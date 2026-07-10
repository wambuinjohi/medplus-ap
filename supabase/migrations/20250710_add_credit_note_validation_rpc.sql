-- ==============================================================================
-- CREDIT NOTE VALIDATION AND RPC FUNCTION
-- Issue: Over-application bug where applied_amount exceeded total_amount
-- Solution: Add CHECK constraint and RPC function with proper validation
-- ==============================================================================

-- Add CHECK constraint to prevent applied_amount > total_amount
ALTER TABLE credit_notes
ADD CONSTRAINT check_applied_amount_within_total
CHECK (applied_amount <= total_amount);

-- Add CHECK constraint to ensure balance is correct (balance = total_amount - applied_amount)
ALTER TABLE credit_notes
ADD CONSTRAINT check_balance_calculation
CHECK (balance = total_amount - applied_amount);

-- Create RPC function to safely apply credit note to invoice
DROP FUNCTION IF EXISTS apply_credit_note_to_invoice(UUID, UUID, DECIMAL, UUID);

CREATE OR REPLACE FUNCTION apply_credit_note_to_invoice(
    credit_note_uuid UUID,
    invoice_uuid UUID,
    amount_to_apply DECIMAL(12, 2),
    applied_by_uuid UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_credit_note RECORD;
    v_invoice RECORD;
    v_allocation_id UUID;
    v_new_applied_amount DECIMAL(12, 2);
    v_new_balance DECIMAL(12, 2);
    v_new_invoice_balance DECIMAL(12, 2);
BEGIN
    -- Validate user authorization (belongs to same company)
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = applied_by_uuid 
        AND company_id = (SELECT company_id FROM credit_notes WHERE id = credit_note_uuid)
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: User does not belong to the credit note company'
        );
    END IF;

    -- Lock and fetch credit note with current values
    SELECT id, company_id, customer_id, total_amount, applied_amount, balance, status
    INTO v_credit_note
    FROM credit_notes
    WHERE id = credit_note_uuid
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Credit note not found'
        );
    END IF;

    -- Validate amount to apply is positive
    IF amount_to_apply <= 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Amount to apply must be greater than zero'
        );
    END IF;

    -- Validate amount does not exceed available balance
    IF amount_to_apply > v_credit_note.balance THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Amount to apply exceeds available balance',
            'available_balance', v_credit_note.balance,
            'requested_amount', amount_to_apply
        );
    END IF;

    -- Check if allocation already exists (UNIQUE constraint)
    IF EXISTS (
        SELECT 1 FROM credit_note_allocations
        WHERE credit_note_id = credit_note_uuid
        AND invoice_id = invoice_uuid
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'This credit note has already been applied to this invoice'
        );
    END IF;

    -- Fetch and lock invoice
    SELECT id, company_id, total_amount, balance_due, paid_amount
    INTO v_invoice
    FROM invoices
    WHERE id = invoice_uuid
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invoice not found'
        );
    END IF;

    -- Verify both records belong to same company
    IF v_credit_note.company_id != v_invoice.company_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Credit note and invoice must belong to the same company'
        );
    END IF;

    -- Validate amount does not exceed invoice balance
    IF amount_to_apply > v_invoice.balance_due THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Amount to apply exceeds invoice balance due',
            'invoice_balance_due', v_invoice.balance_due,
            'requested_amount', amount_to_apply
        );
    END IF;

    -- Create allocation record
    INSERT INTO credit_note_allocations (
        credit_note_id,
        invoice_id,
        allocated_amount,
        allocation_date,
        created_by
    ) VALUES (
        credit_note_uuid,
        invoice_uuid,
        amount_to_apply,
        CURRENT_DATE,
        applied_by_uuid
    ) RETURNING id INTO v_allocation_id;

    -- Update credit note balance and applied amount
    v_new_applied_amount := v_credit_note.applied_amount + amount_to_apply;
    v_new_balance := v_credit_note.total_amount - v_new_applied_amount;

    UPDATE credit_notes
    SET
        applied_amount = v_new_applied_amount,
        balance = v_new_balance,
        status = CASE 
            WHEN v_new_balance <= 0.01 THEN 'applied'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = credit_note_uuid;

    -- Update invoice balance due
    v_new_invoice_balance := v_invoice.balance_due - amount_to_apply;

    UPDATE invoices
    SET
        balance_due = v_new_invoice_balance,
        status = CASE
            WHEN v_new_invoice_balance <= 0.01 THEN 'paid'
            WHEN v_new_invoice_balance < v_invoice.total_amount THEN 'partial'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = invoice_uuid;

    -- Return success response
    RETURN json_build_object(
        'success', true,
        'allocation_id', v_allocation_id,
        'credit_note_id', credit_note_uuid,
        'invoice_id', invoice_uuid,
        'allocated_amount', amount_to_apply,
        'credit_note_new_balance', v_new_balance,
        'invoice_new_balance', v_new_invoice_balance,
        'message', 'Credit note successfully applied to invoice'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION apply_credit_note_to_invoice(UUID, UUID, DECIMAL, UUID) TO authenticated;
