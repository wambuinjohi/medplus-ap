-- ============================================
-- FIND: Which companies have missing role definitions
-- ============================================

SELECT DISTINCT
    p.company_id,
    c.name as company_name,
    p.email,
    p.full_name,
    p.role::text as assigned_role
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL
ORDER BY p.company_id, p.email;

-- ============================================
-- CHECK: What roles exist for each company
-- ============================================
SELECT 
    r.company_id,
    c.name as company_name,
    r.role_type,
    r.name as role_name,
    jsonb_array_length(r.permissions) as permission_count
FROM roles r
LEFT JOIN companies c ON r.company_id = c.id
ORDER BY r.company_id, r.role_type;

-- ============================================
-- GET: Company IDs that need roles
-- ============================================
SELECT DISTINCT
    p.company_id,
    c.name as company_name,
    COUNT(DISTINCT p.id) as total_users
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL
GROUP BY p.company_id, c.name
ORDER BY total_users DESC;
