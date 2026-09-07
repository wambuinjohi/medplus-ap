CREATE OR REPLACE FUNCTION public.update_product_stock_core(
  p_product_uuid UUID,
  p_movement_type TEXT,
  p_quantity NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_updated INTEGER;
  v_movement_type TEXT := UPPER(p_movement_type);
BEGIN
  IF v_movement_type IS NULL OR v_movement_type NOT IN ('IN', 'OUT', 'ADJUSTMENT') THEN
    RAISE EXCEPTION 'Invalid movement_type: %. Must be IN, OUT, or ADJUSTMENT', v_movement_type;
  END IF;

  IF p_quantity IS NULL OR p_quantity < 0 THEN
    RAISE EXCEPTION 'Quantity must be non-negative: %', p_quantity;
  END IF;

  IF v_movement_type = 'IN' THEN
    UPDATE public.products
    SET stock_quantity = COALESCE(stock_quantity, 0) + p_quantity,
        updated_at = NOW()
    WHERE id = p_product_uuid;
  ELSIF v_movement_type = 'OUT' THEN
    UPDATE public.products
    SET stock_quantity = GREATEST(COALESCE(stock_quantity, 0) - p_quantity, 0),
        updated_at = NOW()
    WHERE id = p_product_uuid;
  ELSE
    UPDATE public.products
    SET stock_quantity = p_quantity,
        updated_at = NOW()
    WHERE id = p_product_uuid;
  END IF;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', format('Product % not found', p_product_uuid)
    );
  END IF;

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
