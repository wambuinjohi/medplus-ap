ALTER TABLE public.quotation_items
  ADD COLUMN IF NOT EXISTS discount_before_vat DECIMAL(15,2) DEFAULT 0;

UPDATE public.quotation_items
SET discount_before_vat = 0
WHERE discount_before_vat IS NULL;

NOTIFY pgrst, 'reload schema';
