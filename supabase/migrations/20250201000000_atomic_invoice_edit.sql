CREATE OR REPLACE FUNCTION public.update_invoice_with_items_atomic(
  p_invoice_id UUID,
  p_invoice JSONB,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice invoices%ROWTYPE;
  v_updated_invoice invoices%ROWTYPE;
  v_item JSONB;
  v_product_id UUID;
  v_quantity NUMERIC;
  v_unit_price NUMERIC;
  v_discount_percentage NUMERIC;
  v_discount_before_vat NUMERIC;
  v_tax_percentage NUMERIC;
  v_tax_inclusive BOOLEAN;
  v_base_amount NUMERIC;
  v_discount_amount NUMERIC;
  v_taxable_amount NUMERIC;
  v_tax_amount NUMERIC;
  v_line_total NUMERIC;
  v_subtotal NUMERIC := 0;
  v_total_tax NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_paid_amount NUMERIC;
  v_product RECORD;
BEGIN
  SELECT *
  INTO v_invoice
  FROM invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  IF v_invoice.status = 'paid'
     OR (COALESCE(v_invoice.paid_amount, 0) > 0 AND COALESCE(v_invoice.balance_due, 0) <= 0) THEN
    RAISE EXCEPTION 'Paid invoices cannot be edited';
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND company_id = v_invoice.company_id
  ) THEN
    RAISE EXCEPTION 'You cannot edit an invoice outside your company';
  END IF;

  DROP TABLE IF EXISTS tmp_invoice_old_quantities;
  DROP TABLE IF EXISTS tmp_invoice_new_quantities;

  CREATE TEMP TABLE tmp_invoice_old_quantities (
    product_id UUID PRIMARY KEY,
    quantity NUMERIC NOT NULL
  ) ON COMMIT DROP;
  CREATE TEMP TABLE tmp_invoice_new_quantities (
    product_id UUID PRIMARY KEY,
    quantity NUMERIC NOT NULL
  ) ON COMMIT DROP;

  INSERT INTO tmp_invoice_old_quantities (product_id, quantity)
  SELECT product_id,
         SUM(CASE WHEN movement_type = 'OUT' THEN ABS(quantity) ELSE -ABS(quantity) END)
  FROM stock_movements
  WHERE reference_id = p_invoice_id
    AND movement_type IN ('IN', 'OUT')
    AND (
      reference_type = 'INVOICE'
      OR (
        reference_type = 'ADJUSTMENT'
        AND notes LIKE 'Reversal for updated invoice%'
      )
    )
  GROUP BY product_id;

  DELETE FROM stock_movements
  WHERE reference_id = p_invoice_id
    AND (
      reference_type = 'INVOICE'
      OR (
        reference_type = 'ADJUSTMENT'
        AND notes LIKE 'Reversal for updated invoice%'
      )
    );

  DELETE FROM invoice_items
  WHERE invoice_id = p_invoice_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(p_items, '[]'::JSONB))
  LOOP
    v_product_id := NULLIF(v_item->>'product_id', '')::UUID;
    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::NUMERIC, 0), 0);
    v_unit_price := GREATEST(COALESCE((v_item->>'unit_price')::NUMERIC, 0), 0);
    v_discount_percentage := GREATEST(COALESCE((v_item->>'discount_percentage')::NUMERIC, 0), 0);
    v_discount_before_vat := GREATEST(COALESCE((v_item->>'discount_before_vat')::NUMERIC, 0), 0);
    v_tax_percentage := GREATEST(COALESCE((v_item->>'tax_percentage')::NUMERIC, 0), 0);
    v_tax_inclusive := COALESCE((v_item->>'tax_inclusive')::BOOLEAN, FALSE);
    v_base_amount := v_quantity * v_unit_price;
    v_discount_amount := LEAST(
      v_base_amount,
      (v_base_amount * v_discount_percentage / 100) + v_discount_before_vat
    );
    v_taxable_amount := v_base_amount - v_discount_amount;

    IF v_tax_inclusive AND v_tax_percentage > 0 THEN
      v_tax_amount := v_taxable_amount - (v_taxable_amount / (1 + v_tax_percentage / 100));
      v_line_total := v_taxable_amount;
    ELSE
      v_tax_amount := v_taxable_amount * v_tax_percentage / 100;
      v_line_total := v_taxable_amount + v_tax_amount;
    END IF;

    IF v_product_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM products
      WHERE id = v_product_id
        AND company_id = v_invoice.company_id
    ) THEN
      RAISE EXCEPTION 'Invoice item product does not belong to this company';
    END IF;

    IF v_invoice.affects_inventory IS TRUE AND v_product_id IS NOT NULL THEN
      INSERT INTO tmp_invoice_new_quantities (product_id, quantity)
      VALUES (v_product_id, v_quantity)
      ON CONFLICT (product_id) DO UPDATE
      SET quantity = tmp_invoice_new_quantities.quantity + EXCLUDED.quantity;
    END IF;

    INSERT INTO invoice_items (
      invoice_id,
      product_id,
      description,
      quantity,
      unit_price,
      discount_percentage,
      discount_before_vat,
      tax_percentage,
      tax_amount,
      tax_inclusive,
      line_total,
      sort_order,
      batch_no,
      expiry_date
    ) VALUES (
      p_invoice_id,
      v_product_id,
      COALESCE(v_item->>'description', ''),
      v_quantity,
      v_unit_price,
      v_discount_percentage,
      v_discount_before_vat,
      v_tax_percentage,
      ROUND(v_tax_amount, 2),
      v_tax_inclusive,
      ROUND(v_line_total, 2),
      COALESCE((v_item->>'sort_order')::INTEGER, 0),
      COALESCE(NULLIF(v_item->>'batch_no', ''), 'N/A'),
      NULLIF(v_item->>'expiry_date', '')::DATE
    );

    v_subtotal := v_subtotal + ROUND(v_taxable_amount, 2);
    v_total_tax := v_total_tax + ROUND(v_tax_amount, 2);
    v_total_amount := v_total_amount + ROUND(v_line_total, 2);
  END LOOP;

  v_subtotal := ROUND(v_subtotal, 2);
  v_total_tax := ROUND(v_total_tax, 2);
  v_total_amount := ROUND(v_total_amount, 2);
  v_paid_amount := COALESCE(v_invoice.paid_amount, 0);

  UPDATE invoices
  SET customer_id = COALESCE(NULLIF(p_invoice->>'customer_id', '')::UUID, customer_id),
      invoice_date = COALESCE(NULLIF(p_invoice->>'invoice_date', '')::DATE, invoice_date),
      due_date = NULLIF(p_invoice->>'due_date', '')::DATE,
      lpo_number = NULLIF(p_invoice->>'lpo_number', ''),
      subtotal = v_subtotal,
      tax_amount = v_total_tax,
      total_amount = v_total_amount,
      balance_due = GREATEST(v_total_amount - v_paid_amount, 0),
      terms_and_conditions = p_invoice->>'terms_and_conditions',
      notes = p_invoice->>'notes',
      updated_at = NOW()
  WHERE id = p_invoice_id
  RETURNING * INTO v_updated_invoice;

  FOR v_product IN
    SELECT product_id, SUM(new_quantity) - SUM(old_quantity) AS delta
    FROM (
      SELECT product_id, quantity AS new_quantity, 0::NUMERIC AS old_quantity
      FROM tmp_invoice_new_quantities
      UNION ALL
      SELECT product_id, 0::NUMERIC AS new_quantity, quantity AS old_quantity
      FROM tmp_invoice_old_quantities
    ) quantities
    GROUP BY product_id
  LOOP
    IF v_product.delta > 0 THEN
      UPDATE products
      SET stock_quantity = GREATEST(COALESCE(stock_quantity, 0) - v_product.delta, 0),
          updated_at = NOW()
      WHERE id = v_product.product_id
        AND company_id = v_invoice.company_id;
    ELSIF v_product.delta < 0 THEN
      UPDATE products
      SET stock_quantity = COALESCE(stock_quantity, 0) + ABS(v_product.delta),
          updated_at = NOW()
      WHERE id = v_product.product_id
        AND company_id = v_invoice.company_id;
    ELSE
      CONTINUE;
    END IF;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product for invoice stock reconciliation not found';
    END IF;
  END LOOP;

  IF v_invoice.affects_inventory IS TRUE THEN
    FOR v_product IN
      SELECT product_id, quantity
      FROM tmp_invoice_new_quantities
    LOOP
      INSERT INTO stock_movements (
        company_id,
        product_id,
        movement_type,
        reference_type,
        reference_id,
        quantity,
        cost_per_unit,
        notes,
        movement_date
      )
      SELECT
        v_invoice.company_id,
        v_product.product_id,
        'OUT',
        'INVOICE',
        p_invoice_id,
        v_product.quantity,
        COALESCE((value->>'unit_price')::NUMERIC, 0),
        'Stock reduction for updated invoice ' || v_invoice.invoice_number,
        v_updated_invoice.invoice_date
      FROM jsonb_array_elements(COALESCE(p_items, '[]'::JSONB))
      WHERE NULLIF(value->>'product_id', '')::UUID = v_product.product_id
      LIMIT 1;
    END LOOP;
  END IF;

  RETURN to_jsonb(v_updated_invoice);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_invoice_with_items_atomic(UUID, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_invoice_with_items_atomic(UUID, JSONB, JSONB) TO authenticated;
