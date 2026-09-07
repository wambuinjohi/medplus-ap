CREATE OR REPLACE FUNCTION public.update_product_stock(
  product_uuid UUID,
  movement_type TEXT,
  quantity NUMERIC
)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.update_product_stock_core(product_uuid, movement_type, quantity);
$$;

CREATE OR REPLACE FUNCTION public.update_product_stock(
  movement_type TEXT,
  product_uuid UUID,
  quantity NUMERIC
)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.update_product_stock_core(product_uuid, movement_type, quantity);
$$;

CREATE OR REPLACE FUNCTION public.update_product_stock(
  product_uuid UUID,
  movement_type TEXT,
  quantity INTEGER
)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.update_product_stock_core(product_uuid, movement_type, quantity::NUMERIC);
$$;

CREATE OR REPLACE FUNCTION public.update_product_stock(
  movement_type TEXT,
  product_uuid UUID,
  quantity INTEGER
)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.update_product_stock_core(product_uuid, movement_type, quantity::NUMERIC);
$$;

REVOKE EXECUTE ON FUNCTION public.update_product_stock_core(UUID, TEXT, NUMERIC)
  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_product_stock(UUID, TEXT, NUMERIC)
  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_product_stock(TEXT, UUID, NUMERIC)
  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_product_stock(UUID, TEXT, INTEGER)
  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_product_stock(TEXT, UUID, INTEGER)
  FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.update_product_stock_core(UUID, TEXT, NUMERIC)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_stock(UUID, TEXT, NUMERIC)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_stock(TEXT, UUID, NUMERIC)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_stock(UUID, TEXT, INTEGER)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_stock(TEXT, UUID, INTEGER)
  TO authenticated;

NOTIFY pgrst, 'reload schema';
