-- ============================================================================
-- SQL Reference for Simon Invoicing System Enhancements
-- Features: Bank Details, Overdue Distinction, Excel Aging Analysis
-- ============================================================================

-- ============================================================================
-- 1. BANK DETAILS SCHEMA (MIGRATION)
-- ============================================================================

-- Primary migration (should be run once via Supabase migrations)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS paybill_number VARCHAR(20);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_companies_bank_details 
ON companies(id) 
WHERE bank_name IS NOT NULL;

-- ============================================================================
-- 2. AGING ANALYSIS QUERIES
-- ============================================================================

-- Query 1: Customer Aging Summary (By Customer)
-- Returns aging buckets for all customers
SELECT
  c.id as customer_id,
  c.name as customer_name,
  c.customer_code,
  c.email,
  
  -- Total Outstanding
  COALESCE(SUM(i.total_amount - COALESCE(
    (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
    0
  )), 0) as total_outstanding,
  
  -- Current (not yet due)
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) <= 0
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as current_amount,
  
  -- 1-30 Days Overdue
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 0 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 30
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as days_1_30_overdue,
  
  -- 31-60 Days Overdue
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 30 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 60
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as days_31_60_overdue,
  
  -- 61-90 Days Overdue
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 60 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 90
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as days_61_90_overdue,
  
  -- 90+ Days Overdue
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 90
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as days_90_plus_overdue,
  
  COUNT(DISTINCT i.id) as total_invoices,
  MAX(i.due_date) as oldest_invoice_due_date
  
FROM customers c
LEFT JOIN invoices i ON c.id = i.customer_id AND i.status != 'cancelled'
GROUP BY c.id, c.name, c.customer_code, c.email
HAVING COALESCE(SUM(i.total_amount - COALESCE(
  (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
  0
)), 0) > 0
ORDER BY total_outstanding DESC;


-- Query 2: Individual Invoice Aging Status
-- Returns each invoice with its status and aging bucket
SELECT
  i.id,
  i.invoice_number,
  i.customer_id,
  c.name as customer_name,
  i.invoice_date,
  i.due_date,
  i.total_amount,
  COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) as paid_amount,
  (i.total_amount - COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0)) as outstanding_amount,
  
  -- Days overdue calculation
  EXTRACT(DAY FROM NOW() - i.due_date)::INT as days_overdue,
  
  -- Status determination
  CASE 
    WHEN (i.total_amount - COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0)) = 0 
      THEN 'Paid'
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) <= 0 
      THEN 'Current'
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 0 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 30 
      THEN 'Overdue (1-30 days)'
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 30 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 60 
      THEN 'Overdue (31-60 days)'
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 60 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 90 
      THEN 'Overdue (61-90 days)'
    ELSE 'Overdue (90+ days)'
  END as status,
  
  -- Aging bucket for reports
  CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) <= 0 
      THEN 'Current'
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 0 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 30 
      THEN '1-30 days'
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 30 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 60 
      THEN '31-60 days'
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 60 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 90 
      THEN '61-90 days'
    ELSE '90+ days'
  END as aging_bucket

FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE i.status != 'cancelled'
  AND (i.total_amount - COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0)) > 0
ORDER BY c.name, i.due_date;


-- Query 3: Company Bank Details Verification
-- Verify bank details are configured for company
SELECT
  id,
  name,
  bank_name,
  bank_account_number,
  bank_account_name,
  swift_code,
  branch_code,
  paybill_number,
  CASE 
    WHEN bank_name IS NOT NULL AND bank_account_number IS NOT NULL THEN 'Complete'
    WHEN bank_name IS NOT NULL OR bank_account_number IS NOT NULL THEN 'Partial'
    ELSE 'Not Configured'
  END as bank_details_status,
  created_at,
  updated_at
FROM companies
ORDER BY updated_at DESC;


-- Query 4: Aging Analysis by Company
-- Returns complete aging breakdown per company
SELECT
  comp.id,
  comp.name,
  comp.currency,
  
  -- Current (not yet due)
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) <= 0
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as current_amount,
  
  -- 1-30 Days Overdue
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 0 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 30
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as days_1_30,
  
  -- 31-60 Days Overdue
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 30 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 60
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as days_31_60,
  
  -- 61-90 Days Overdue
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 60 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 90
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as days_61_90,
  
  -- 90+ Days Overdue
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 90
    THEN i.total_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
      0
    )
    ELSE 0 
  END), 0) as days_90_plus,
  
  COALESCE(SUM(i.total_amount - COALESCE(
    (SELECT SUM(amount) FROM payments WHERE invoice_id = i.id),
    0
  )), 0) as total_outstanding,
  
  COUNT(DISTINCT i.id) as total_invoices,
  COUNT(DISTINCT c.id) as total_customers
  
FROM companies comp
LEFT JOIN customers c ON comp.id = c.company_id
LEFT JOIN invoices i ON c.id = i.customer_id AND i.status != 'cancelled'
GROUP BY comp.id, comp.name, comp.currency
ORDER BY total_outstanding DESC;


-- ============================================================================
-- 3. DATA VALIDATION QUERIES
-- ============================================================================

-- Verify invoice/payment consistency
SELECT
  i.id,
  i.invoice_number,
  i.total_amount,
  COALESCE(SUM(p.amount), 0) as total_paid,
  (i.total_amount - COALESCE(SUM(p.amount), 0)) as balance_remaining,
  CASE 
    WHEN ABS((i.total_amount - COALESCE(SUM(p.amount), 0))) < 0.01 THEN 'Balanced'
    WHEN (i.total_amount - COALESCE(SUM(p.amount), 0)) > 0 THEN 'Partial'
    ELSE 'Over-Paid'
  END as status
FROM invoices i
LEFT JOIN payments p ON i.id = p.invoice_id
GROUP BY i.id, i.invoice_number, i.total_amount
ORDER BY i.created_at DESC;


-- Find invoices with potential data issues
SELECT
  i.id,
  i.invoice_number,
  CASE 
    WHEN i.due_date IS NULL THEN 'Missing due_date'
    WHEN i.total_amount IS NULL THEN 'Missing total_amount'
    WHEN i.customer_id IS NULL THEN 'Missing customer'
    WHEN i.due_date < i.invoice_date THEN 'Invalid: due_date before invoice_date'
    ELSE 'OK'
  END as issue
FROM invoices i
WHERE i.due_date IS NULL 
   OR i.total_amount IS NULL 
   OR i.customer_id IS NULL 
   OR i.due_date < i.invoice_date;


-- ============================================================================
-- 4. HELPER FUNCTIONS (OPTIONAL - For Supabase SQL Editor)
-- ============================================================================

-- Create function to calculate aging bucket
CREATE OR REPLACE FUNCTION get_aging_bucket(due_date DATE)
RETURNS VARCHAR AS $$
BEGIN
  IF EXTRACT(DAY FROM NOW() - due_date) <= 0 THEN
    RETURN 'Current';
  ELSIF EXTRACT(DAY FROM NOW() - due_date) <= 30 THEN
    RETURN '1-30 days';
  ELSIF EXTRACT(DAY FROM NOW() - due_date) <= 60 THEN
    RETURN '31-60 days';
  ELSIF EXTRACT(DAY FROM NOW() - due_date) <= 90 THEN
    RETURN '61-90 days';
  ELSE
    RETURN '90+ days';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate days overdue
CREATE OR REPLACE FUNCTION get_days_overdue(due_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(DAY FROM NOW() - due_date)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Create function to get outstanding amount for invoice
CREATE OR REPLACE FUNCTION get_outstanding_amount(invoice_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_amount DECIMAL;
  paid_amount DECIMAL;
BEGIN
  SELECT i.total_amount INTO total_amount FROM invoices i WHERE i.id = invoice_id;
  SELECT COALESCE(SUM(amount), 0) INTO paid_amount FROM payments WHERE invoice_id = invoice_id;
  RETURN total_amount - paid_amount;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Test scenario: Insert sample company with bank details
INSERT INTO companies (name, email, phone, bank_name, bank_account_number, bank_account_name, swift_code, branch_code, paybill_number)
VALUES (
  'Test Company',
  'test@example.com',
  '+254712345678',
  'ABSA BANK',
  '2047138798',
  'TEST COMPANY LIMITED',
  'ABSKKENX',
  '001',
  '620000'
) ON CONFLICT DO NOTHING;

-- Verify aging calculations for specific customer
WITH customer_invoices AS (
  SELECT
    i.id,
    i.invoice_number,
    i.total_amount,
    COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) as paid,
    i.due_date,
    EXTRACT(DAY FROM NOW() - i.due_date)::INT as days_overdue
  FROM invoices i
  WHERE i.customer_id = 'CUSTOMER_ID_HERE'
    AND i.status != 'cancelled'
)
SELECT
  invoice_number,
  total_amount,
  paid,
  (total_amount - paid) as outstanding,
  days_overdue,
  CASE 
    WHEN (total_amount - paid) = 0 THEN 'Paid'
    WHEN days_overdue <= 0 THEN 'Current'
    WHEN days_overdue <= 30 THEN 'Overdue (1-30)'
    WHEN days_overdue <= 60 THEN 'Overdue (31-60)'
    WHEN days_overdue <= 90 THEN 'Overdue (61-90)'
    ELSE 'Overdue (90+)'
  END as status
FROM customer_invoices
ORDER BY days_overdue DESC;

-- ============================================================================
-- 6. INDEX RECOMMENDATIONS FOR PERFORMANCE
-- ============================================================================

-- Performance indexes for aging queries
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON invoices(customer_id, status) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);

-- Composite index for common aging queries
CREATE INDEX IF NOT EXISTS idx_invoices_aging ON invoices(customer_id, due_date, status) WHERE status != 'cancelled';

-- ============================================================================
-- Notes:
-- 1. Replace 'CUSTOMER_ID_HERE' with actual customer UUID for testing
-- 2. All currency calculations assume 2 decimal places
-- 3. Aging buckets: Current | 1-30 | 31-60 | 61-90 | 90+
-- 4. "Current" = due_date has not passed yet
-- 5. All dates use server timezone (recommend UTC for consistency)
-- ============================================================================
