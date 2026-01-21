-- Add 'custom' value to user_role enum type
-- This allows custom company-specific roles to be assigned to users

-- PostgreSQL doesn't allow modifying enums directly, so we need to:
-- 1. Create a new enum type with all values including 'custom'
-- 2. Alter columns to use the new type
-- 3. Drop the old enum type

-- Create new enum type with 'custom' added
CREATE TYPE user_role_new AS ENUM ('admin', 'accountant', 'stock_manager', 'user', 'custom');

-- Alter profiles table to use new enum
ALTER TABLE profiles
  ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- Alter user_invitations table to use new enum
ALTER TABLE user_invitations
  ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- Drop the old enum type
DROP TYPE user_role;

-- Rename the new enum type to the original name
ALTER TYPE user_role_new RENAME TO user_role;

-- Create index on the updated column if needed
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
