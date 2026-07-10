-- ==============================================================================
-- FIX: Add missing RLS policies for credit_notes and related tables
-- Issue: RLS was enabled but no policies were defined, causing permission errors
-- Solution: Add company-scoped policies following the pattern used for invoices
-- ==============================================================================

-- Helper function to check if user belongs to a company
CREATE OR REPLACE FUNCTION user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- ==============================================================================
-- CREDIT_NOTES TABLE POLICIES
-- ==============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Company scoped access" ON credit_notes;
DROP POLICY IF EXISTS "Users can view credit notes from their company" ON credit_notes;
DROP POLICY IF EXISTS "Users can create credit notes in their company" ON credit_notes;

-- Add SELECT policy for credit_notes
CREATE POLICY "Users can view credit notes from their company"
ON credit_notes
FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    )
);

-- Add INSERT policy for credit_notes
CREATE POLICY "Users can create credit notes in their company"
ON credit_notes
FOR INSERT
WITH CHECK (
    company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    )
);

-- Add UPDATE policy for credit_notes (allow updating own company's credit notes)
CREATE POLICY "Users can update credit notes in their company"
ON credit_notes
FOR UPDATE
USING (
    company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    )
);

-- Add DELETE policy for credit_notes
CREATE POLICY "Users can delete credit notes in their company"
ON credit_notes
FOR DELETE
USING (
    company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    )
);

-- ==============================================================================
-- CREDIT_NOTE_ITEMS TABLE POLICIES
-- ==============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Company scoped access" ON credit_note_items;
DROP POLICY IF EXISTS "Users can view credit note items from their company" ON credit_note_items;
DROP POLICY IF EXISTS "Users can create credit note items" ON credit_note_items;

-- Add SELECT policy for credit_note_items
CREATE POLICY "Users can view credit note items from their company"
ON credit_note_items
FOR SELECT
USING (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- Add INSERT policy for credit_note_items
CREATE POLICY "Users can create credit note items"
ON credit_note_items
FOR INSERT
WITH CHECK (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- Add UPDATE policy for credit_note_items
CREATE POLICY "Users can update credit note items"
ON credit_note_items
FOR UPDATE
USING (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
)
WITH CHECK (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- Add DELETE policy for credit_note_items
CREATE POLICY "Users can delete credit note items"
ON credit_note_items
FOR DELETE
USING (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- ==============================================================================
-- CREDIT_NOTE_ALLOCATIONS TABLE POLICIES
-- ==============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Company scoped access" ON credit_note_allocations;
DROP POLICY IF EXISTS "Users can view credit note allocations from their company" ON credit_note_allocations;
DROP POLICY IF EXISTS "Users can create credit note allocations" ON credit_note_allocations;

-- Add SELECT policy for credit_note_allocations
CREATE POLICY "Users can view credit note allocations from their company"
ON credit_note_allocations
FOR SELECT
USING (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- Add INSERT policy for credit_note_allocations
CREATE POLICY "Users can create credit note allocations"
ON credit_note_allocations
FOR INSERT
WITH CHECK (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
    AND
    invoice_id IN (
        SELECT id FROM invoices
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- Add UPDATE policy for credit_note_allocations
CREATE POLICY "Users can update credit note allocations"
ON credit_note_allocations
FOR UPDATE
USING (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
)
WITH CHECK (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- Add DELETE policy for credit_note_allocations
CREATE POLICY "Users can delete credit note allocations"
ON credit_note_allocations
FOR DELETE
USING (
    credit_note_id IN (
        SELECT id FROM credit_notes
        WHERE company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- ==============================================================================
-- FIX: Make generate_credit_note_number RPC SECURITY DEFINER
-- This ensures the function can read from credit_notes even when RLS policies
-- would otherwise deny access (required for generating new numbers)
-- ==============================================================================

DROP FUNCTION IF EXISTS generate_credit_note_number(UUID);
CREATE OR REPLACE FUNCTION generate_credit_note_number(company_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Verify the user belongs to the company (security check)
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND company_id = company_uuid
    ) THEN
        RAISE EXCEPTION 'Unauthorized: User does not belong to this company';
    END IF;

    SELECT COALESCE(MAX(CAST(SUBSTRING(credit_note_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM credit_notes
    WHERE company_id = company_uuid
    AND credit_note_number ~ '^CN[0-9]+$';
    
    formatted_number := 'CN' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN formatted_number;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_credit_note_number(UUID) TO authenticated;
