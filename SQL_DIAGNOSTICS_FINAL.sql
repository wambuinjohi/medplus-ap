-- ============================================
-- MEDPLUS AFRICA - RBAC DIAGNOSTICS (FINAL)
-- ============================================
-- Fixed for JSONB permissions and enum/text type mismatch

-- 1. CHECK ALL ROLES
SELECT 
    r.id,
    r.role_type,
    r.name,
    r.is_default,
    r.company_id,
    jsonb_array_length(r.permissions) as permission_count,
    r.created_at
FROM roles r
ORDER BY r.company_id, r.is_default DESC, r.name;

-- 2. CHECK USER ROLES AND ASSIGNMENTS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role::text as assigned_role,
    p.status,
    p.company_id,
    p.created_at
FROM profiles p
ORDER BY p.company_id, p.role::text, p.full_name;

-- 3. MATCH USERS TO THEIR ROLE DEFINITIONS (FIXED TYPE CAST)
-- Cast p.role (enum) to text to match r.role_type (text)
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role::text as profile_role,
    r.role_type,
    r.name as role_name,
    r.is_default,
    p.status,
    jsonb_array_length(r.permissions) as permission_count
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
ORDER BY p.company_id, p.role::text;

-- 4. CHECK FOR MISMATCHES (CRITICAL) - FIXED TYPE CAST
-- Shows users whose role doesn't exist in roles table
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role::text as assigned_role,
    p.company_id,
    CASE WHEN r.id IS NULL THEN '❌ MISSING ROLE DEFINITION' ELSE '✅ OK' END as status
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL
ORDER BY p.company_id, p.email;

-- 5. CHECK SPECIFIC USER (Faith Mabera) - FIXED TYPE CAST
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role::text as assigned_role_type,
    p.status,
    p.company_id,
    p.created_at,
    r.name as role_display_name,
    r.role_type,
    r.is_default,
    jsonb_array_length(r.permissions) as permission_count
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE p.full_name ILIKE '%Faith%' OR p.email ILIKE '%faith%';

-- 6. CHECK ROLE ENUM VALUES
-- Shows what enum values are currently allowed in the database
SELECT enum_range(NULL::user_role) as allowed_role_values;

-- 7. VERIFY SALES AND ACCOUNTS ROLES EXIST
SELECT 
    role_type,
    name,
    company_id,
    is_default,
    jsonb_array_length(permissions) as permission_count,
    created_at
FROM roles
WHERE role_type IN ('sales', 'accounts')
ORDER BY company_id, created_at;

-- 8. COUNT USERS BY ROLE - FIXED TYPE CAST
SELECT 
    p.role::text as profile_role,
    r.name as role_display_name,
    r.role_type,
    COUNT(p.id) as user_count,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_users,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_users
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
GROUP BY p.role::text, r.name, r.role_type
ORDER BY user_count DESC;

-- 9. CHECK COMPANIES
SELECT 
    id,
    name,
    currency,
    created_at
FROM companies
ORDER BY created_at DESC;

-- 10. VERIFY DEFAULT ROLES SETUP
SELECT 
    role_type,
    name,
    is_default,
    company_id,
    jsonb_array_length(permissions) as permission_count
FROM roles
WHERE is_default = true
ORDER BY company_id, role_type;

-- ============================================
-- DETAILED PERMISSION CHECKS
-- ============================================

-- 11. SHOW SALES ROLE PERMISSIONS (expanded)
SELECT 
    role_type,
    name,
    company_id,
    permissions as all_permissions,
    jsonb_array_length(permissions) as permission_count
FROM roles
WHERE role_type = 'sales'
LIMIT 1;

-- 12. SHOW ACCOUNTS ROLE PERMISSIONS (expanded)
SELECT 
    role_type,
    name,
    company_id,
    permissions as all_permissions,
    jsonb_array_length(permissions) as permission_count
FROM roles
WHERE role_type = 'accounts'
LIMIT 1;

-- 13. CHECK IF 'sales' AND 'accounts' ARE IN USER_ROLE ENUM
-- This helps diagnose if database schema has been updated
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- ============================================
-- QUICK SUMMARY (Run this first!)
-- ============================================

-- 14. QUICK SUMMARY - Everything at a glance
SELECT 
    'Total Companies' as metric,
    COUNT(DISTINCT id)::text as value
FROM companies
UNION ALL
SELECT 
    'Total Users',
    COUNT(DISTINCT id)::text
FROM profiles
UNION ALL
SELECT 
    'Active Users',
    COUNT(DISTINCT id)::text
FROM profiles
WHERE status = 'active'
UNION ALL
SELECT 
    'Total Roles',
    COUNT(DISTINCT id)::text
FROM roles
UNION ALL
SELECT 
    'Default Roles',
    COUNT(DISTINCT id)::text
FROM roles
WHERE is_default = true
UNION ALL
SELECT 
    'Custom Roles',
    COUNT(DISTINCT id)::text
FROM roles
WHERE is_default = false
UNION ALL
SELECT 
    'Users with missing roles',
    COUNT(DISTINCT p.id)::text
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL;

-- ============================================
-- PROFILE ROLE VALUES CHECK (Diagnostic)
-- ============================================

-- 15. What role values are currently in profiles table?
SELECT DISTINCT 
    p.role::text as role_value,
    COUNT(p.id) as user_count
FROM profiles p
GROUP BY p.role::text
ORDER BY user_count DESC;

-- 16. Do all user roles have matching role definitions?
SELECT 
    p.role::text,
    CASE WHEN r.role_type IS NULL THEN 'NO MATCH' ELSE 'OK' END as match_status,
    COUNT(p.id) as count
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
GROUP BY p.role::text, r.role_type
ORDER BY count DESC;

-- ============================================
-- FIXES (if needed)
-- ============================================

-- FIX 1: If enum is missing 'sales' or 'accounts' values
-- Run this in Supabase SQL Editor if Query 13 shows they're missing:
-- ALTER TYPE user_role ADD VALUE 'sales' BEFORE 'user';
-- ALTER TYPE user_role ADD VALUE 'accounts' BEFORE 'user';

-- FIX 2: If a user has the wrong role assigned
-- Example: Change Faith Mabera's role to 'sales'
-- UPDATE profiles SET role = 'sales'::user_role 
-- WHERE full_name = 'Faith Mabera';

-- FIX 3: If user role values don't exist in roles table
-- First, check what's missing with Query 4
-- Then either:
-- A) Update the user's role to an existing value
-- B) Create the missing role in the roles table

-- FIX 4: Create missing audit roles manually if needed
-- INSERT INTO roles (role_type, name, company_id, permissions, is_default)
-- VALUES 
--   ('sales', 'Sales Audit', 'your-company-id', '["create_quotation","view_quotation",...more permissions...]'::jsonb, false),
--   ('accounts', 'Accounts Audit', 'your-company-id', '["create_invoice","view_invoice",...more permissions...]'::jsonb, false);
