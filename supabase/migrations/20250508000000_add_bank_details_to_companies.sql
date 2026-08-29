-- Add bank details columns to companies table if they don't exist
-- This ensures all installations have the necessary columns for banking information

ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS paybill_number VARCHAR(20);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS companies_updated_at_trigger ON companies;
CREATE TRIGGER companies_updated_at_trigger
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_companies_updated_at();
