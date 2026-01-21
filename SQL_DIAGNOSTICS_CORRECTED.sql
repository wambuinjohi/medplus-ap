-- ============================================
-- MEDPLUS AFRICA - RBAC DIAGNOSTICS (CORRECTED)
-- ============================================
-- Corrected for JSONB permissions column

-- 1. CHECK ALL ROLES (CORRECTED FOR JSONB)
-- Shows role_type, name, and permissions stored as JSONB
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
-- Shows which users have which roles and their status
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role as assigned_role,
    p.status,
    p.company_id,
    p.created_at
FROM profiles p
ORDER BY p.company_id, p.role, p.full_name;

-- 3. MATCH USERS TO THEIR ROLE DEFINITIONS (WITH PERMISSION COUNT)
-- Shows users with their assigned role details
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role as profile_role,
    r.role_type,
    r.name as role_name,
    r.is_default,
    p.status,
    jsonb_array_length(r.permissions) as permission_count
FROM profiles p
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
ORDER BY p.company_id, p.role;

-- 4. CHECK FOR MISMATCHES (CRITICAL)
-- Highlights users whose role doesn't exist in roles table
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role as assigned_role,
    p.company_id,
    CASE WHEN r.id IS NULL THEN '❌ MISSING ROLE DEFINITION' ELSE '✅ OK' END as status
FROM profiles p
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL
ORDER BY p.company_id, p.email;

-- 5. CHECK SPECIFIC USER (Faith Mabera)
-- Details for the sales user mentioned in the issue
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role as assigned_role_type,
    p.status,
    p.company_id,
    p.created_at,
    r.name as role_display_name,
    r.role_type,
    r.is_default,
    jsonb_array_length(r.permissions) as permission_count
FROM profiles p
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
WHERE p.full_name ILIKE '%Faith%' OR p.email ILIKE '%faith%';

-- 6. CHECK ROLE ENUM VALUES
-- Shows what enum values are currently allowed in the database
SELECT enum_range(NULL::user_role) as allowed_role_values;

-- 7. VERIFY SALES AND ACCOUNTS ROLES EXIST
-- Checks if the audit roles are properly set up
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

-- 8. COUNT USERS BY ROLE
-- Shows how many users are in each role
SELECT 
    p.role,
    r.name as role_display_name,
    r.role_type,
    COUNT(p.id) as user_count,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_users,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_users
FROM profiles p
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
GROUP BY p.role, r.name, r.role_type
ORDER BY user_count DESC;

-- 9. CHECK COMPANIES
-- Shows company setup
SELECT 
    id,
    name,
    currency,
    created_at
FROM companies
ORDER BY created_at DESC;

-- 10. VERIFY DEFAULT ROLES SETUP
-- Checks if default roles (admin, accountant, stock_manager, user) exist
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
-- SUMMARY CHECK (Run this first!)
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
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL;

-- ============================================
-- FIXES (if needed)
-- ============================================

-- FIX: Update user role if assigned to wrong value
-- Example: If user has role='Sales Audit' but should have role='sales'
-- UPDATE profiles SET role = 'sales' WHERE full_name = 'Faith Mabera' AND role = 'Sales Audit';

-- FIX: Add missing enum values (if 'sales' or 'accounts' missing from user_role enum)
-- ALTER TYPE user_role ADD VALUE 'sales' BEFORE 'user';
-- ALTER TYPE user_role ADD VALUE 'accounts' BEFORE 'user';
