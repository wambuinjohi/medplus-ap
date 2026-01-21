-- ============================================
-- FIX: Add missing enum values to user_role
-- ============================================
-- The enum currently has: admin, accountant, stock_manager, user, custom
-- We need to add: sales, accounts

-- This will allow these values to be stored in profiles.role
ALTER TYPE user_role ADD VALUE 'sales' BEFORE 'user';
ALTER TYPE user_role ADD VALUE 'accounts' BEFORE 'user';

-- Verify the enum was updated:
SELECT enum_range(NULL::user_role) as allowed_role_values;

-- ============================================
-- FIX: Update Faith Mabera's role from 'custom' to 'sales'
-- ============================================
-- She should have the 'Sales' role based on the issue description

UPDATE profiles 
SET role = 'sales'::user_role
WHERE full_name = 'Faith Mabera' AND email = 'fmabera@gmail.com';

-- Verify the update:
SELECT 
    email,
    full_name,
    role::text as assigned_role_type,
    status
FROM profiles
WHERE full_name = 'Faith Mabera';

-- ============================================
-- FIX: Update the other users with missing roles
-- ============================================
-- Query 4 showed:
-- - gichukiwairu: role = 'user' (this is OK, keep as is)
-- - System Administrator (info@construction.com): role = 'admin' (OK)
-- - System Administrator (admin@medplusafrica.com): role = 'admin' (OK)
-- - System Administrator (admin@biolegendscientific.co.ke): role = 'admin' (OK)

-- Only Faith Mabera needs updating. The others are fine.

-- ============================================
-- VERIFY: Check that all users now have valid roles
-- ============================================
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role::text as profile_role,
    r.role_type,
    r.name as role_display_name,
    r.is_default,
    jsonb_array_length(r.permissions) as permission_count,
    CASE WHEN r.id IS NULL THEN '❌ MISSING' ELSE '✅ OK' END as status
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
ORDER BY p.email;

-- ============================================
-- VERIFY: Count users by role (should be clean)
-- ============================================
SELECT 
    p.role::text as profile_role,
    r.name as role_display_name,
    COUNT(p.id) as user_count,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_users
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
GROUP BY p.role::text, r.name
ORDER BY user_count DESC;

-- ============================================
-- VERIFY: No more missing roles
-- ============================================
SELECT COUNT(*) as users_with_missing_roles
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL;
-- This should return 0

-- ============================================
-- NOTES:
-- ============================================
-- After running these fixes:
-- 1. The user_role enum will include 'sales' and 'accounts'
-- 2. Faith Mabera will be assigned to the 'sales' role
-- 3. All users will have valid role definitions
-- 4. The sidebar menu will filter correctly based on role
-- 5. Faith Mabera should now see "Sales" instead of "Custom"
-- 6. She'll have access to Sales menu items but NOT Inventory or Payments
