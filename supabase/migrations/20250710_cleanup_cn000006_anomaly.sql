-- ==============================================================================
-- DATA CLEANUP: FIX CN000006 OVER-APPLICATION ANOMALY
-- Issue: Credit note CN000006 had applied_amount (1000) > total_amount (500)
-- Solution: Recalculate based on actual allocations and fix balance
-- ==============================================================================

-- Find the credit note CN000006 and fix it
-- This is idempotent - it will only execute if the credit note exists
DO $$
DECLARE
    v_cn_id UUID;
    v_total_allocations DECIMAL(12, 2);
    v_current_applied DECIMAL(12, 2);
    v_current_total DECIMAL(12, 2);
    v_new_balance DECIMAL(12, 2);
    v_allocation_record RECORD;
BEGIN
    -- Find the credit note with number CN000006
    SELECT id, applied_amount, total_amount 
    INTO v_cn_id, v_current_applied, v_current_total
    FROM credit_notes 
    WHERE credit_note_number = 'CN000006'
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE NOTICE 'Credit note CN000006 not found - nothing to fix';
        RETURN;
    END IF;

    RAISE NOTICE 'Processing CN000006: ID=%, Current Applied=%, Total=%', 
        v_cn_id, v_current_applied, v_current_total;

    -- Calculate sum of all actual allocations for this credit note
    SELECT COALESCE(SUM(allocated_amount), 0)
    INTO v_total_allocations
    FROM credit_note_allocations
    WHERE credit_note_id = v_cn_id;

    RAISE NOTICE 'Total allocations found: %', v_total_allocations;

    -- If there's a mismatch, fix the credit note
    IF v_total_allocations != v_current_applied THEN
        -- Calculate new balance based on actual allocations
        v_new_balance := v_current_total - v_total_allocations;

        RAISE NOTICE 'Fixing CN000006: Setting applied_amount=%, balance=%', 
            v_total_allocations, v_new_balance;

        -- Update the credit note with correct values
        UPDATE credit_notes
        SET
            applied_amount = v_total_allocations,
            balance = v_new_balance,
            status = CASE 
                WHEN v_new_balance <= 0.01 THEN 'applied'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = v_cn_id;

        RAISE NOTICE 'CN000006 fixed successfully';

        -- For each allocation on this credit note, verify invoice balance
        FOR v_allocation_record IN
            SELECT 
                cna.id as allocation_id,
                cna.allocated_amount,
                cna.invoice_id,
                inv.balance_due,
                inv.total_amount
            FROM credit_note_allocations cna
            JOIN invoices inv ON cna.invoice_id = inv.id
            WHERE cna.credit_note_id = v_cn_id
        LOOP
            RAISE NOTICE 'Checking allocation % on invoice with balance_due=%', 
                v_allocation_record.allocation_id, v_allocation_record.balance_due;

            -- Note: Don't auto-fix invoice balances as we don't know the original intent
            -- The RPC will handle future allocations with proper validation
        END LOOP;

    ELSE
        RAISE NOTICE 'CN000006 is already correct (no action needed)';
    END IF;

END $$;

-- Add informational note about what happened
-- This helps audit logs understand the cleanup
COMMENT ON TABLE credit_notes IS 
'Credit notes table - manages customer credit notes with applied/balance tracking.
Includes validation: applied_amount <= total_amount and balance = total_amount - applied_amount.
On 2025-07-10: Fixed CN000006 anomaly where over-application had occurred.';
