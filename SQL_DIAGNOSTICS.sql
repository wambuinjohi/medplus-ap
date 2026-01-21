-- ============================================
-- MEDPLUS AFRICA - RBAC DIAGNOSTICS
-- ============================================
-- Run these queries in Supabase SQL editor to check role configuration

-- 1. CHECK ALL ROLES IN THE SYSTEM
-- Shows role_type, name, permissions, and company info
SELECT 
    r.id,
    r.role_type,
    r.name,
    r.is_default,
    r.company_id,
    array_length(r.permissions, 1) as permission_count,
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

-- 3. MATCH USERS TO THEIR ROLE DEFINITIONS
-- Shows users with their assigned role details
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role as profile_role,
    r.role_type,
    r.name as role_name,
    r.is_default,
    p.status
FROM profiles p
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
ORDER BY p.company_id, p.role;

-- 4. CHECK FOR MISMATCHES
-- Highlights users whose role doesn't exist in roles table
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role as assigned_role,
    p.company_id,
    CASE WHEN r.id IS NULL THEN 'MISSING ROLE DEFINITION' ELSE 'OK' END as status
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
    p.updated_at,
    r.name as role_display_name,
    r.role_type,
    r.is_default,
    array_length(r.permissions, 1) as permission_count
FROM profiles p
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
WHERE p.full_name ILIKE '%Faith%' OR p.email ILIKE '%faith%';

-- 6. CHECK ROLE ENUM VALUES
-- Shows what enum values are currently allowed
SELECT enum_range(NULL::user_role) as allowed_role_values;

-- 7. VERIFY SALES AND ACCOUNTS ROLES EXIST
-- Checks if the audit roles are properly set up
SELECT 
    role_type,
    name,
    company_id,
    is_default,
    array_length(permissions, 1) as permission_count,
    created_at
FROM roles
WHERE role_type IN ('sales', 'accounts')
ORDER BY company_id, created_at;

-- 8. COUNT USERS BY ROLE
-- Shows how many users are in each role
SELECT 
    p.role,
    r.name as role_display_name,
    COUNT(p.id) as user_count,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_users
FROM profiles p
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
GROUP BY p.role, r.name
ORDER BY user_count DESC;

-- 9. CHECK COMPANIES
-- Shows company setup
SELECT 
    id,
    name,
    currency,
    created_at,
    updated_at
FROM companies
ORDER BY created_at DESC;

-- 10. VERIFY DEFAULT ROLES SETUP
-- Checks if default roles (admin, accountant, stock_manager, user) exist
SELECT 
    role_type,
    name,
    is_default,
    company_id,
    array_length(permissions, 1) as permission_count
FROM roles
WHERE is_default = true
ORDER BY company_id, role_type;

-- ============================================
-- UPDATE QUERIES (if needed to fix issues)
-- ============================================

-- FIX: If a user has wrong role assigned, update their role
-- Example: UPDATE profiles SET role = 'sales' WHERE email = 'gichukikkmed@gmail.com';

-- FIX: If a role is missing, you may need to run setupAuditRoles from the app
-- Or manually insert roles:
-- INSERT INTO roles (role_type, name, company_id, permissions, is_default, description)
-- VALUES ('sales', 'Sales Audit', '...company_id...', ARRAY['create_quotation', 'view_quotation', ...], false, 'Sales role');

-- CHECK: Verify a specific company has all needed roles
-- SELECT COUNT(*) as total_roles FROM roles WHERE company_id = 'your-company-id';
