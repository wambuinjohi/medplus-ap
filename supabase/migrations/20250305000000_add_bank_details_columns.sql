-- Migration: Add Bank Details Columns to Companies Table
-- Purpose: Support editable and visible bank details in invoices and statements
-- Date: 2025-03-05

-- Add bank detail columns to companies table if they don't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS paybill_number VARCHAR(20);

-- Add index for performance (optional but recommended for lookups)
CREATE INDEX IF NOT EXISTS idx_companies_bank_details 
ON companies(id) 
WHERE bank_name IS NOT NULL;

-- Add audit trigger for updated_at on bank detail changes
-- This ensures that any bank detail update triggers the updated_at timestamp
CREATE OR REPLACE FUNCTION update_companies_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS trigger_update_companies_timestamp ON companies;

CREATE TRIGGER trigger_update_companies_timestamp
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_companies_timestamp();

-- Add RLS policies if you're using row-level security
-- Uncomment and adjust based on your RLS setup:
/*
-- Policy to allow users to read their company's bank details
CREATE POLICY "Users can read own company bank details"
ON companies FOR SELECT
USING (
    id IN (
        SELECT company_id FROM profiles 
        WHERE profiles.id = auth.uid()
    )
);

-- Policy to allow admins to update bank details
CREATE POLICY "Admins can update company bank details"
ON companies FOR UPDATE
USING (
    id IN (
        SELECT company_id FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
*/
