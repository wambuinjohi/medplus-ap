-- Add batch_no and expiry_date columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS batch_no TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Create indexes for batch lookups
CREATE INDEX IF NOT EXISTS idx_products_batch_no ON products(batch_no);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);
