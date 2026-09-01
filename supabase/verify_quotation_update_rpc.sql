SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS identity_arguments,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'update_quotation_with_items_atomic';

SELECT
  has_function_privilege(
    'authenticated',
    'public.update_quotation_with_items_atomic(uuid,jsonb,jsonb)',
    'EXECUTE'
  ) AS authenticated_can_execute,
  has_function_privilege(
    'public',
    'public.update_quotation_with_items_atomic(uuid,jsonb,jsonb)',
    'EXECUTE'
  ) AS public_can_execute;

SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('quotations', 'quotation_items')
  AND column_name IN (
    'customer_id', 'quotation_date', 'valid_until', 'status', 'subtotal',
    'tax_amount', 'total_amount', 'notes', 'terms_and_conditions', 'batch_no',
    'expiry_date', 'product_id', 'description', 'quantity', 'unit_price',
    'discount_percentage', 'discount_before_vat', 'tax_setting_id',
    'tax_percentage', 'tax_amount', 'tax_inclusive', 'line_total', 'sort_order'
  )
ORDER BY table_name, ordinal_position;
