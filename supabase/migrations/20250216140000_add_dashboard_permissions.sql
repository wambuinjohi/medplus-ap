-- Add view_dashboard_summary permission to Admin role
UPDATE roles
SET permissions = array_append(permissions, 'view_dashboard_summary')
WHERE name = 'Admin'
AND NOT ('view_dashboard_summary' = ANY(permissions));

-- Add view_dashboard_summary permission to any custom admin roles
UPDATE roles
SET permissions = array_append(permissions, 'view_dashboard_summary')
WHERE role_type = 'admin'
AND NOT ('view_dashboard_summary' = ANY(permissions));

-- Add view_dashboard_summary to user_permissions for all admin and super_admin users
INSERT INTO user_permissions (user_id, permission_name, granted)
SELECT
    p.id,
    'view_dashboard_summary',
    TRUE
FROM profiles p
WHERE (p.role = 'admin' OR p.role = 'super_admin')
AND NOT EXISTS (
    SELECT 1 FROM user_permissions up
    WHERE up.user_id = p.id
    AND up.permission_name = 'view_dashboard_summary'
);
