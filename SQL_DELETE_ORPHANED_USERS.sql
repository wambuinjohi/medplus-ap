-- ============================================
-- DELETE ORPHANED USERS (no company assigned)
-- ============================================
-- These 3 users have NULL company_id and cannot be assigned proper roles
-- They should be removed from the system

-- First, let's verify which users will be deleted
SELECT 
    id,
    email,
    full_name,
    company_id,
    status
FROM profiles
WHERE email IN (
    'admin@biolegendscientific.co.ke',
    'admin@medplusafrica.com',
    'info@construction.com'
);

-- DELETE the profiles (this will cascade to auth.users if configured)
DELETE FROM profiles
WHERE email IN (
    'admin@biolegendscientific.co.ke',
    'admin@medplusafrica.com',
    'info@construction.com'
);

-- ============================================
-- VERIFY: All remaining users have valid roles
-- ============================================
SELECT 
    p.email,
    p.full_name,
    p.role::text as assigned_role,
    r.name as role_display_name,
    jsonb_array_length(r.permissions) as permission_count,
    CASE WHEN r.id IS NULL THEN '❌ MISSING' ELSE '✅ OK' END as status
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
ORDER BY p.email;

-- ============================================
-- FINAL CHECK: Should return 0
-- ============================================
SELECT COUNT(*) as users_with_missing_roles
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL;
-- Should return 0
