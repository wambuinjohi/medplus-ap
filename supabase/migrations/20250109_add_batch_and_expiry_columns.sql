-- Add batch_no and expiry_date columns to quotation header and items
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

ALTER TABLE quotation_items
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add batch_no and expiry_date columns to invoice header and items
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add batch_no and expiry_date columns to proforma invoice header and items
ALTER TABLE proforma_invoices
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

ALTER TABLE proforma_items
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add batch_no and expiry_date columns to LPO header and items
ALTER TABLE lpos
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

ALTER TABLE lpo_items
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add batch_no and expiry_date columns to delivery notes (if they exist)
ALTER TABLE IF EXISTS delivery_notes
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

ALTER TABLE IF EXISTS delivery_note_items
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add batch_no and expiry_date columns to remittance advice (if they exist)
ALTER TABLE IF EXISTS remittance_advice
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

ALTER TABLE IF EXISTS remittance_advice_items
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Create indexes for batch_no lookups (useful if you'll search by batch)
CREATE INDEX IF NOT EXISTS idx_quotations_batch_no ON quotations(batch_no);
CREATE INDEX IF NOT EXISTS idx_invoices_batch_no ON invoices(batch_no);
CREATE INDEX IF NOT EXISTS idx_proforma_invoices_batch_no ON proforma_invoices(batch_no);
CREATE INDEX IF NOT EXISTS idx_lpos_batch_no ON lpos(batch_no);

CREATE INDEX IF NOT EXISTS idx_quotation_items_batch_no ON quotation_items(batch_no);
CREATE INDEX IF NOT EXISTS idx_invoice_items_batch_no ON invoice_items(batch_no);
CREATE INDEX IF NOT EXISTS idx_proforma_items_batch_no ON proforma_items(batch_no);
CREATE INDEX IF NOT EXISTS idx_lpo_items_batch_no ON lpo_items(batch_no);
