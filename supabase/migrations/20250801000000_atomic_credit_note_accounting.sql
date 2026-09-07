-- Keep credit note application, reversal, inventory, and invoice balances atomic.
ALTER TABLE credit_notes
  ADD COLUMN IF NOT EXISTS status_before_application VARCHAR(20),
  ADD COLUMN IF NOT EXISTS inventory_applied BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_reference_type_check;
ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_reference_type_check
  CHECK (reference_type IN ('INVOICE', 'DELIVERY_NOTE', 'RESTOCK', 'ADJUSTMENT', 'CREDIT_NOTE', 'CREDIT_NOTE_REVERSAL', 'PURCHASE'));

CREATE OR REPLACE FUNCTION apply_credit_note_to_invoice(
  credit_note_uuid UUID,
  invoice_uuid UUID,
  amount_to_apply DECIMAL(12, 2),
  applied_by_uuid UUID
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_credit_note RECORD;
  v_invoice RECORD;
  v_allocation_id UUID;
  v_new_applied DECIMAL(12, 2);
  v_new_balance DECIMAL(12, 2);
  v_new_invoice_balance DECIMAL(12, 2);
  v_item RECORD;
BEGIN
  SELECT cn.* INTO v_credit_note
  FROM credit_notes cn
  WHERE cn.id = credit_note_uuid
  FOR UPDATE;

  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Credit note not found'); END IF;
  IF applied_by_uuid <> auth.uid() OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = applied_by_uuid AND company_id = v_credit_note.company_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  IF amount_to_apply <= 0 THEN RETURN json_build_object('success', false, 'error', 'Amount to apply must be greater than zero'); END IF;
  IF amount_to_apply > v_credit_note.balance THEN RETURN json_build_object('success', false, 'error', 'Amount to apply exceeds available balance'); END IF;
  IF EXISTS (SELECT 1 FROM credit_note_allocations WHERE credit_note_id = credit_note_uuid AND invoice_id = invoice_uuid) THEN
    RETURN json_build_object('success', false, 'error', 'This credit note has already been applied to this invoice');
  END IF;

  SELECT i.* INTO v_invoice FROM invoices i WHERE i.id = invoice_uuid FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Invoice not found'); END IF;
  IF v_invoice.company_id <> v_credit_note.company_id THEN RETURN json_build_object('success', false, 'error', 'Credit note and invoice must belong to the same company'); END IF;
  IF amount_to_apply > v_invoice.balance_due THEN RETURN json_build_object('success', false, 'error', 'Amount to apply exceeds invoice balance due'); END IF;

  INSERT INTO credit_note_allocations (credit_note_id, invoice_id, allocated_amount, allocation_date, created_by)
  VALUES (credit_note_uuid, invoice_uuid, amount_to_apply, CURRENT_DATE, applied_by_uuid)
  RETURNING id INTO v_allocation_id;

  v_new_applied := v_credit_note.applied_amount + amount_to_apply;
  v_new_balance := v_credit_note.total_amount - v_new_applied;
  UPDATE credit_notes
  SET applied_amount = v_new_applied,
      balance = v_new_balance,
      status_before_application = COALESCE(status_before_application, status),
      status = CASE WHEN v_new_balance <= 0.01 THEN 'applied' ELSE status END,
      updated_at = NOW()
  WHERE id = credit_note_uuid;

  v_new_invoice_balance := v_invoice.balance_due - amount_to_apply;
  UPDATE invoices
  SET balance_due = v_new_invoice_balance,
      status = CASE WHEN v_new_invoice_balance <= 0.01 THEN 'paid'
                    WHEN v_new_invoice_balance < v_invoice.total_amount THEN 'partial'
                    ELSE status END,
      updated_at = NOW()
  WHERE id = invoice_uuid;

  IF v_credit_note.affects_inventory AND NOT COALESCE(v_credit_note.inventory_applied, FALSE) THEN
    FOR v_item IN SELECT cni.* FROM credit_note_items cni WHERE cni.credit_note_id = credit_note_uuid AND cni.product_id IS NOT NULL LOOP
      INSERT INTO stock_movements (company_id, product_id, movement_type, reference_type, reference_id, quantity, notes)
      VALUES (v_credit_note.company_id, v_item.product_id, 'IN', 'CREDIT_NOTE', credit_note_uuid, v_item.quantity,
              'Credit Note ' || v_credit_note.credit_note_number || ' applied');
      PERFORM public.update_product_stock_core(v_item.product_id, 'IN', v_item.quantity);
    END LOOP;
    UPDATE credit_notes SET inventory_applied = TRUE WHERE id = credit_note_uuid;
  END IF;

  RETURN json_build_object('success', true, 'allocation_id', v_allocation_id, 'invoice_new_balance', v_new_invoice_balance);
END;
$$;

CREATE OR REPLACE FUNCTION unapply_credit_note_allocation(allocation_uuid UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_allocation RECORD;
  v_credit_note RECORD;
  v_invoice RECORD;
  v_remaining INTEGER;
  v_movement RECORD;
BEGIN
  SELECT * INTO v_allocation FROM credit_note_allocations WHERE id = allocation_uuid FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Allocation not found'); END IF;
  SELECT * INTO v_credit_note FROM credit_notes WHERE id = v_allocation.credit_note_id FOR UPDATE;
  SELECT * INTO v_invoice FROM invoices WHERE id = v_allocation.invoice_id FOR UPDATE;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = v_credit_note.company_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  DELETE FROM credit_note_allocations WHERE id = allocation_uuid;
  UPDATE invoices
  SET balance_due = LEAST(total_amount, balance_due + v_allocation.allocated_amount),
      status = CASE WHEN LEAST(total_amount, balance_due + v_allocation.allocated_amount) <= 0.01 THEN 'paid'
                    WHEN LEAST(total_amount, balance_due + v_allocation.allocated_amount) < total_amount THEN 'partial'
                    ELSE CASE WHEN paid_amount > 0 THEN 'partial' ELSE 'sent' END END,
      updated_at = NOW()
  WHERE id = v_invoice.id;

  SELECT COUNT(*) INTO v_remaining FROM credit_note_allocations WHERE credit_note_id = v_credit_note.id;
  UPDATE credit_notes
  SET applied_amount = GREATEST(0, applied_amount - v_allocation.allocated_amount),
      balance = total_amount - GREATEST(0, applied_amount - v_allocation.allocated_amount),
      status = CASE WHEN v_remaining = 0 THEN COALESCE(status_before_application, 'draft') ELSE status END,
      status_before_application = CASE WHEN v_remaining = 0 THEN NULL ELSE status_before_application END,
      updated_at = NOW()
  WHERE id = v_credit_note.id;

  IF v_remaining = 0 AND COALESCE(v_credit_note.inventory_applied, FALSE) THEN
    FOR v_movement IN SELECT * FROM stock_movements WHERE reference_type = 'CREDIT_NOTE' AND reference_id = v_credit_note.id LOOP
      INSERT INTO stock_movements (company_id, product_id, movement_type, reference_type, reference_id, quantity, cost_per_unit, notes)
      VALUES (v_movement.company_id, v_movement.product_id, 'OUT', 'CREDIT_NOTE_REVERSAL', v_credit_note.id, v_movement.quantity, v_movement.cost_per_unit,
              'Reversal of Credit Note ' || v_credit_note.credit_note_number);
      PERFORM public.update_product_stock_core(v_movement.product_id, 'OUT', v_movement.quantity);
    END LOOP;
    UPDATE credit_notes SET inventory_applied = FALSE WHERE id = v_credit_note.id;
  END IF;

  RETURN json_build_object('success', true, 'allocation_id', allocation_uuid);
END;
$$;

CREATE OR REPLACE FUNCTION delete_credit_note_atomic(credit_note_uuid UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_credit_note RECORD;
  v_allocation RECORD;
  v_movement RECORD;
BEGIN
  SELECT * INTO v_credit_note FROM credit_notes WHERE id = credit_note_uuid FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Credit note not found'); END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN roles r ON r.company_id = p.company_id AND r.name = p.role
    WHERE p.id = auth.uid()
      AND p.company_id = v_credit_note.company_id
      AND 'delete_credit_note' = ANY(r.permissions)
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You do not have permission to delete credit notes');
  END IF;

  FOR v_allocation IN SELECT * FROM credit_note_allocations WHERE credit_note_id = credit_note_uuid LOOP
    UPDATE invoices
    SET balance_due = LEAST(total_amount, balance_due + v_allocation.allocated_amount),
        status = CASE WHEN LEAST(total_amount, balance_due + v_allocation.allocated_amount) <= 0.01 THEN 'paid'
                      WHEN LEAST(total_amount, balance_due + v_allocation.allocated_amount) < total_amount THEN 'partial'
                      ELSE CASE WHEN paid_amount > 0 THEN 'partial' ELSE 'sent' END END,
        updated_at = NOW()
    WHERE id = v_allocation.invoice_id;
  END LOOP;

  IF COALESCE(v_credit_note.inventory_applied, FALSE) THEN
    FOR v_movement IN SELECT * FROM stock_movements WHERE reference_type = 'CREDIT_NOTE' AND reference_id = credit_note_uuid LOOP
      INSERT INTO stock_movements (company_id, product_id, movement_type, reference_type, reference_id, quantity, cost_per_unit, notes)
      VALUES (v_movement.company_id, v_movement.product_id, 'OUT', 'CREDIT_NOTE_REVERSAL', credit_note_uuid, v_movement.quantity, v_movement.cost_per_unit,
              'Reversal of deleted Credit Note ' || v_credit_note.credit_note_number);
      PERFORM public.update_product_stock_core(v_movement.product_id, 'OUT', v_movement.quantity);
    END LOOP;
  END IF;

  DELETE FROM credit_notes WHERE id = credit_note_uuid;
  RETURN json_build_object('success', true, 'credit_note_id', credit_note_uuid);
END;
$$;

GRANT EXECUTE ON FUNCTION apply_credit_note_to_invoice(UUID, UUID, DECIMAL, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unapply_credit_note_allocation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_credit_note_atomic(UUID) TO authenticated;
