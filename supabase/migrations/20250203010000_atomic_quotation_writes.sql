CREATE OR REPLACE FUNCTION public.create_quotation_with_items_atomic(
  p_quotation JSONB,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_quotation quotations%ROWTYPE;
  v_item JSONB;
  v_company_id UUID;
  v_customer_id UUID;
  v_product_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_company_id := NULLIF(p_quotation->>'company_id', '')::UUID;
  v_customer_id := NULLIF(p_quotation->>'customer_id', '')::UUID;

  IF NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND company_id = v_company_id
  ) THEN
    RAISE EXCEPTION 'You cannot create a quotation outside your company';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM customers
    WHERE id = v_customer_id
      AND company_id = v_company_id
  ) THEN
    RAISE EXCEPTION 'Quotation customer does not belong to this company';
  END IF;

  IF COALESCE(NULLIF(p_quotation->>'total_amount', '')::NUMERIC, 0) <> 0
     AND jsonb_array_length(COALESCE(p_items, '[]'::JSONB)) = 0 THEN
    RAISE EXCEPTION 'A quotation with a nonzero total must include at least one item';
  END IF;

  INSERT INTO quotations (
    company_id,
    customer_id,
    quotation_number,
    quotation_date,
    valid_until,
    status,
    subtotal,
    tax_amount,
    total_amount,
    notes,
    terms_and_conditions,
    created_by,
    batch_no,
    expiry_date
  ) VALUES (
    v_company_id,
    v_customer_id,
    p_quotation->>'quotation_number',
    NULLIF(p_quotation->>'quotation_date', '')::DATE,
    NULLIF(p_quotation->>'valid_until', '')::DATE,
    COALESCE(NULLIF(p_quotation->>'status', ''), 'draft')::document_status,
    COALESCE(NULLIF(p_quotation->>'subtotal', '')::NUMERIC, 0),
    COALESCE(NULLIF(p_quotation->>'tax_amount', '')::NUMERIC, 0),
    COALESCE(NULLIF(p_quotation->>'total_amount', '')::NUMERIC, 0),
    p_quotation->>'notes',
    p_quotation->>'terms_and_conditions',
    auth.uid(),
    COALESCE(NULLIF(p_quotation->>'batch_no', ''), 'N/A'),
    NULLIF(p_quotation->>'expiry_date', '')::DATE
  )
  RETURNING * INTO v_quotation;

  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(p_items, '[]'::JSONB))
  LOOP
    v_product_id := NULLIF(v_item->>'product_id', '')::UUID;

    IF v_product_id IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM products
      WHERE id = v_product_id
        AND company_id = v_company_id
    ) THEN
      RAISE EXCEPTION 'Quotation item product does not belong to this company';
    END IF;

    INSERT INTO quotation_items (
      quotation_id,
      product_id,
      description,
      quantity,
      unit_price,
      discount_percentage,
      discount_before_vat,
      tax_setting_id,
      tax_percentage,
      tax_amount,
      tax_inclusive,
      line_total,
      sort_order,
      batch_no,
      expiry_date
    ) VALUES (
      v_quotation.id,
      v_product_id,
      COALESCE(v_item->>'description', ''),
      COALESCE(NULLIF(v_item->>'quantity', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'unit_price', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'discount_percentage', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'discount_before_vat', '')::NUMERIC, 0),
      NULLIF(v_item->>'tax_setting_id', '')::UUID,
      COALESCE(NULLIF(v_item->>'tax_percentage', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'tax_amount', '')::NUMERIC, 0),
      COALESCE((v_item->>'tax_inclusive')::BOOLEAN, FALSE),
      COALESCE(NULLIF(v_item->>'line_total', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'sort_order', '')::INTEGER, 0),
      COALESCE(NULLIF(v_item->>'batch_no', ''), 'N/A'),
      NULLIF(v_item->>'expiry_date', '')::DATE
    );
  END LOOP;

  RETURN to_jsonb(v_quotation);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_quotation_with_items_atomic(
  p_quotation_id UUID,
  p_quotation JSONB,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing quotations%ROWTYPE;
  v_quotation quotations%ROWTYPE;
  v_item JSONB;
  v_customer_id UUID;
  v_product_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT *
  INTO v_existing
  FROM quotations
  WHERE id = p_quotation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND company_id = v_existing.company_id
  ) THEN
    RAISE EXCEPTION 'You cannot edit a quotation outside your company';
  END IF;

  v_customer_id := NULLIF(p_quotation->>'customer_id', '')::UUID;

  IF NOT EXISTS (
    SELECT 1
    FROM customers
    WHERE id = v_customer_id
      AND company_id = v_existing.company_id
  ) THEN
    RAISE EXCEPTION 'Quotation customer does not belong to this company';
  END IF;

  IF COALESCE(NULLIF(p_quotation->>'total_amount', '')::NUMERIC, 0) <> 0
     AND jsonb_array_length(COALESCE(p_items, '[]'::JSONB)) = 0 THEN
    RAISE EXCEPTION 'A quotation with a nonzero total must include at least one item';
  END IF;

  UPDATE quotations
  SET customer_id = v_customer_id,
      quotation_date = COALESCE(NULLIF(p_quotation->>'quotation_date', '')::DATE, quotation_date),
      valid_until = NULLIF(p_quotation->>'valid_until', '')::DATE,
      status = COALESCE(NULLIF(p_quotation->>'status', '')::document_status, status),
      subtotal = COALESCE(NULLIF(p_quotation->>'subtotal', '')::NUMERIC, 0),
      tax_amount = COALESCE(NULLIF(p_quotation->>'tax_amount', '')::NUMERIC, 0),
      total_amount = COALESCE(NULLIF(p_quotation->>'total_amount', '')::NUMERIC, 0),
      notes = p_quotation->>'notes',
      terms_and_conditions = p_quotation->>'terms_and_conditions',
      batch_no = COALESCE(NULLIF(p_quotation->>'batch_no', ''), batch_no),
      expiry_date = NULLIF(p_quotation->>'expiry_date', '')::DATE,
      updated_at = NOW()
  WHERE id = p_quotation_id
  RETURNING * INTO v_quotation;

  DELETE FROM quotation_items
  WHERE quotation_id = p_quotation_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(p_items, '[]'::JSONB))
  LOOP
    v_product_id := NULLIF(v_item->>'product_id', '')::UUID;

    IF v_product_id IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM products
      WHERE id = v_product_id
        AND company_id = v_existing.company_id
    ) THEN
      RAISE EXCEPTION 'Quotation item product does not belong to this company';
    END IF;

    INSERT INTO quotation_items (
      quotation_id,
      product_id,
      description,
      quantity,
      unit_price,
      discount_percentage,
      discount_before_vat,
      tax_setting_id,
      tax_percentage,
      tax_amount,
      tax_inclusive,
      line_total,
      sort_order,
      batch_no,
      expiry_date
    ) VALUES (
      p_quotation_id,
      v_product_id,
      COALESCE(v_item->>'description', ''),
      COALESCE(NULLIF(v_item->>'quantity', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'unit_price', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'discount_percentage', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'discount_before_vat', '')::NUMERIC, 0),
      NULLIF(v_item->>'tax_setting_id', '')::UUID,
      COALESCE(NULLIF(v_item->>'tax_percentage', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'tax_amount', '')::NUMERIC, 0),
      COALESCE((v_item->>'tax_inclusive')::BOOLEAN, FALSE),
      COALESCE(NULLIF(v_item->>'line_total', '')::NUMERIC, 0),
      COALESCE(NULLIF(v_item->>'sort_order', '')::INTEGER, 0),
      COALESCE(NULLIF(v_item->>'batch_no', ''), 'N/A'),
      NULLIF(v_item->>'expiry_date', '')::DATE
    );
  END LOOP;

  RETURN to_jsonb(v_quotation);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_quotation_with_items_atomic(JSONB, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_quotation_with_items_atomic(UUID, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_quotation_with_items_atomic(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_quotation_with_items_atomic(UUID, JSONB, JSONB) TO authenticated;
