# MEDPLUS AFRICA - RBAC Diagnostic Guide

## Overview
This guide helps you diagnose role-based access control (RBAC) issues in the Medplus Africa system.

## Key Issues Fixed
1. **Role storage inconsistency**: Users were being assigned role names instead of role_type
2. **Permission lookup failure**: System was looking up roles by name instead of role_type
3. **Menu visibility**: Sidebar filters weren't matching user roles to allowed roles
4. **Display mismatch**: "Sales" role was showing as "Custom"

## SQL Queries to Run

### Query 1: Check All Roles
```sql
SELECT 
    r.id,
    r.role_type,
    r.name,
    r.is_default,
    r.company_id,
    array_length(r.permissions, 1) as permission_count
FROM roles r
ORDER BY r.company_id, r.is_default DESC, r.name;
```

**What to look for:**
- ✅ Should see: 'admin', 'accountant', 'stock_manager', 'user' as default roles
- ✅ Should see: 'sales' and 'accounts' roles (role_type, not 'Sales Audit')
- ❌ Should NOT see: role_type as 'custom' for audit roles
- ❌ Should NOT see: role names in role_type column

**Expected output:**
```
role_type  | name                | is_default
-----------|---------------------|----------
admin      | Admin              | true
accountant | Accountant         | true
stock_manager | Stock Manager   | true
sales      | Sales Audit        | false
accounts   | Accounts Audit     | false
user       | User               | true
```

---

### Query 2: Check User Assignments
```sql
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
```

**What to look for:**
- ✅ Should see: profiles.role contains values like 'admin', 'sales', 'accounts', etc.
- ❌ Should NOT see: 'Sales Audit', 'Accounts Audit' in profiles.role (these are role names, not types)
- Check: Is Faith Mabera showing 'sales'? (not 'Sales Audit' or 'custom')

---

### Query 3: Find Mismatches (CRITICAL)
```sql
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
```

**What to look for:**
- ✅ Should return: NO ROWS (empty result)
- ❌ If you see rows: These users have role assignments that don't match any role in roles table
  - This is the main issue - causes menus to be hidden and permissions to fail

**If you get results, it means:**
- The user's `profiles.role` value doesn't exist in `roles.role_type`
- Example: User assigned 'Sales Audit' but roles table has role_type='sales'
- FIX: See "Fixing Mismatches" section below

---

### Query 4: Check Enum Values
```sql
SELECT enum_range(NULL::user_role) as allowed_role_values;
```

**What to look for:**
- Should show: admin, accountant, stock_manager, sales, accounts, user
- If missing 'sales' or 'accounts': The database schema hasn't been updated yet

**Note:** The enum must be updated in Supabase before users can be assigned those roles. This requires running the migration or manually updating the enum type.

---

### Query 5: Verify Audit Roles
```sql
SELECT 
    role_type,
    name,
    company_id,
    is_default,
    array_length(permissions, 1) as permission_count
FROM roles
WHERE role_type IN ('sales', 'accounts')
ORDER BY company_id, created_at;
```

**What to look for:**
- ✅ Should see: 'sales' role_type with name 'Sales Audit'
- ✅ Should see: 'accounts' role_type with name 'Accounts Audit'
- ❌ Should NOT see: role_type='custom' (old setup)
- Check: Permission counts look reasonable (20-30 permissions for each)

---

### Query 6: Check Specific User (Faith Mabera)
```sql
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role as assigned_role_type,
    p.status,
    r.name as role_display_name,
    r.role_type,
    array_length(r.permissions, 1) as permission_count
FROM profiles p
LEFT JOIN roles r ON p.role = r.role_type AND p.company_id = r.company_id
WHERE p.full_name ILIKE '%Faith%' OR p.email ILIKE '%faith%';
```

**What to look for:**
- ✅ Should see: assigned_role_type = 'sales'
- ✅ Should see: role_display_name = 'Sales Audit'
- ✅ Should see: role_type = 'sales'
- ✅ Should see: status = 'active'
- ❌ Should NOT see: NULL values in role_type or role_display_name (mismatch)

---

## Common Issues and Fixes

### Issue 1: "MISSING ROLE DEFINITION"
**Problem:** Query 3 returns rows with users

**Cause:** User's role doesn't match any role_type in roles table

**Fix:**
```sql
-- Find what role_type the user should have
SELECT DISTINCT role FROM profiles WHERE role LIKE '%Sales%';

-- Then check what exists in roles table
SELECT role_type, name FROM roles WHERE role_type LIKE '%sales%';

-- Update the user's role to match
UPDATE profiles SET role = 'sales' WHERE id = 'user-id';
```

---

### Issue 2: Enum Error When Creating Users
**Problem:** "value for domain user_role violates check constraint"

**Cause:** Database enum doesn't include 'sales' or 'accounts'

**Fix:** Run in Supabase SQL Editor:
```sql
-- Add new enum values
ALTER TYPE user_role ADD VALUE 'sales' BEFORE 'user';
ALTER TYPE user_role ADD VALUE 'accounts' BEFORE 'user';
```

---

### Issue 3: User's Role Shows as "Custom" in UI
**Problem:** UI displays "Custom" instead of "Sales" or "Accounts"

**Cause:** The getRoleLabel function doesn't recognize the role value

**Check:** User's `profiles.role` value:
```sql
SELECT email, full_name, role FROM profiles WHERE full_name ILIKE '%Faith%';
```

**Fix:** If role is stored as 'Sales Audit' instead of 'sales':
```sql
UPDATE profiles SET role = 'sales' WHERE role = 'Sales Audit' AND company_id = 'your-company-id';
```

---

### Issue 4: Menu Items Hidden (Inventory Not Showing)
**Problem:** User can't see menu items they should have access to

**Cause:** profile.role doesn't match allowedRoles in sidebar

**Check:**
```sql
-- What role does the user have?
SELECT role FROM profiles WHERE full_name = 'Faith Mabera';

-- What roles are allowed to see Inventory?
-- Answer: Only 'admin' and 'stock_manager' (check Sidebar.tsx:63)
-- Sales users can see: Dashboard, Sales, Delivery Notes, Customers, Purchase Orders, Reports
```

**Note:** This is by design. Sales users intentionally don't have access to Inventory.

---

## Step-by-Step Diagnosis Checklist

Run these in order to diagnose the issue:

- [ ] **Step 1:** Run Query 1 (Check All Roles)
  - Verify 'sales' role_type exists
  - Verify no 'Sales Audit' in role_type column

- [ ] **Step 2:** Run Query 3 (Find Mismatches)
  - Should be empty
  - If not empty, see "Issue 1" fix above

- [ ] **Step 3:** Run Query 6 (Check Specific User)
  - Verify Faith Mabera has role='sales'
  - Verify role joins to 'Sales Audit' name
  - If joins are NULL, user doesn't have valid role

- [ ] **Step 4:** Run Query 4 (Check Enum)
  - Verify 'sales' and 'accounts' are in enum
  - If missing, apply enum fix from "Issue 2"

- [ ] **Step 5:** Check User's Expected Menu Items
  - Sales role users should see:
    - Dashboard ✅
    - Sales (all sub-items) ✅
    - Customers ✅
    - Delivery Notes ✅
    - Purchase Orders ✅
    - Reports (Sales & Customer only) ✅
  - Should NOT see:
    - Payments ❌
    - Inventory ❌
    - Settings ❌

---

## If Everything Looks Good But Issues Persist

1. **Clear browser cache:** The app may have cached role information
2. **Refresh the page:** Force reload of user profile
3. **Check Supabase RLS policies:** Row-level security might be blocking access
4. **Check Supabase logs:** Look for any SQL errors

---

## Contact & Support

If you find issues after running these queries, gather:
1. Query results (especially Query 3 and Query 6)
2. Browser console errors (F12 → Console tab)
3. Supabase function logs (if applicable)
4. Screenshot of what's expected vs. what's shown
