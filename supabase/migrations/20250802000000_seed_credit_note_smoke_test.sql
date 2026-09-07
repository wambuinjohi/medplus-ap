DO $$
DECLARE
  v_customer RECORD;
  v_product RECORD;
  v_invoice_id UUID;
  v_credit_note_id UUID;
BEGIN
  SELECT id, company_id
  INTO v_customer
  FROM customers
  WHERE customer_code = 'CUST000031'
    AND name = 'Gichuki Simon'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer CUST000031 (Gichuki Simon) was not found';
  END IF;

  SELECT id, company_id, name, unit_of_measure
  INTO v_product
  FROM products
  WHERE company_id = v_customer.company_id
    AND COALESCE(is_active, TRUE)
  ORDER BY created_at
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active inventory product exists for customer company';
  END IF;

  IF EXISTS (
    SELECT 1 FROM invoices WHERE invoice_number = 'SMOKE-TEST-INVOICE-CUST000031'
  ) OR EXISTS (
    SELECT 1 FROM credit_notes WHERE credit_note_number = 'SMOKE-TEST-CREDIT-CUST000031'
  ) THEN
    RAISE NOTICE 'Smoke-test records already exist; no records were created';
    RETURN;
  END IF;

  INSERT INTO invoices (
    company_id, customer_id, invoice_number, invoice_date, due_date, status,
    subtotal, tax_amount, total_amount, paid_amount, balance_due,
    notes, affects_inventory
  ) VALUES (
    v_customer.company_id, v_customer.id, 'SMOKE-TEST-INVOICE-CUST000031', CURRENT_DATE,
    CURRENT_DATE + 30, 'sent', 1000, 0, 1000, 0, 1000,
    'Smoke test for atomic credit note application', FALSE
  )
  RETURNING id INTO v_invoice_id;

  INSERT INTO invoice_items (
    invoice_id, product_id, description, quantity, unit_price,
    discount_percentage, discount_before_vat, tax_percentage, tax_amount,
    tax_inclusive, line_total, sort_order, batch_no
  ) VALUES (
    v_invoice_id, v_product.id, v_product.name, 2, 500,
    0, 0, 0, 0, FALSE, 1000, 0, 'N/A'
  );

  INSERT INTO credit_notes (
    company_id, customer_id, invoice_id, credit_note_number, credit_note_date,
    status, reason, subtotal, tax_amount, total_amount, applied_amount, balance,
    affects_inventory, notes
  ) VALUES (
    v_customer.company_id, v_customer.id, v_invoice_id,
    'SMOKE-TEST-CREDIT-CUST000031', CURRENT_DATE, 'sent', 'Product Return',
    400, 0, 400, 0, 400, TRUE,
    'Smoke test: Apply, Unapply, and Delete for Gichuki Simon'
  )
  RETURNING id INTO v_credit_note_id;

  INSERT INTO credit_note_items (
    credit_note_id, product_id, description, quantity, unit_price,
    tax_percentage, tax_amount, tax_inclusive, line_total, sort_order
  ) VALUES (
    v_credit_note_id, v_product.id, v_product.name, 2, 200,
    0, 0, FALSE, 400, 0
  );

  RAISE NOTICE 'Created invoice %, credit note %, product %',
    v_invoice_id, v_credit_note_id, v_product.id;
END;
$$;
