ALTER TABLE public.quotation_items
  ADD COLUMN IF NOT EXISTS discount_before_vat NUMERIC(15,2) DEFAULT 0;

UPDATE public.quotation_items
SET discount_before_vat = 0
WHERE discount_before_vat IS NULL;

ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotation_items_select_company" ON public.quotation_items;
DROP POLICY IF EXISTS "quotation_items_insert_company" ON public.quotation_items;
DROP POLICY IF EXISTS "quotation_items_update_company" ON public.quotation_items;
DROP POLICY IF EXISTS "quotation_items_delete_company" ON public.quotation_items;

CREATE POLICY "quotation_items_select_company"
ON public.quotation_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.quotations q
    JOIN public.profiles p ON p.company_id = q.company_id
    WHERE q.id = quotation_items.quotation_id
      AND p.id = auth.uid()
  )
);

CREATE POLICY "quotation_items_insert_company"
ON public.quotation_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quotations q
    JOIN public.profiles p ON p.company_id = q.company_id
    WHERE q.id = quotation_items.quotation_id
      AND p.id = auth.uid()
  )
);

CREATE POLICY "quotation_items_update_company"
ON public.quotation_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.quotations q
    JOIN public.profiles p ON p.company_id = q.company_id
    WHERE q.id = quotation_items.quotation_id
      AND p.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quotations q
    JOIN public.profiles p ON p.company_id = q.company_id
    WHERE q.id = quotation_items.quotation_id
      AND p.id = auth.uid()
  )
);

CREATE POLICY "quotation_items_delete_company"
ON public.quotation_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.quotations q
    JOIN public.profiles p ON p.company_id = q.company_id
    WHERE q.id = quotation_items.quotation_id
      AND p.id = auth.uid()
  )
);

NOTIFY pgrst, 'reload schema';
