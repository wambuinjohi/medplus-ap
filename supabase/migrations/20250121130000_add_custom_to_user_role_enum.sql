-- Add 'custom' value to user_role enum type
-- This allows custom company-specific roles to be assigned to users

-- Note: This migration has already been applied manually.
-- It adds 'custom' to the user_role enum and fixes role_type mappings.

-- The roles table should have role_type values mapped as follows:
-- - 'admin' for Admin role
-- - 'accountant' for Accountant role
-- - 'stock_manager' for Stock Manager role
-- - 'user' for User role
-- - 'custom' for custom company-specific roles

-- If re-applying: ensure roles are updated with correct role_type values
-- UPDATE roles SET role_type = 'accountant' WHERE name = 'Accountant';
-- UPDATE roles SET role_type = 'stock_manager' WHERE name = 'Stock Manager';
-- UPDATE roles SET role_type = 'user' WHERE name = 'User';
