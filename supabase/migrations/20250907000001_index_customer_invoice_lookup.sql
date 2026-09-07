CREATE INDEX IF NOT EXISTS invoices_company_customer_balance_date_idx
  ON public.invoices (company_id, customer_id, balance_due, invoice_date DESC)
  WHERE status <> 'cancelled';
