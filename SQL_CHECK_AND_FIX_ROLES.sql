-- ============================================
-- CHECK: What roles are defined in roles table?
-- ============================================
SELECT 
    role_type,
    name,
    company_id,
    is_default,
    jsonb_array_length(permissions) as permission_count
FROM roles
ORDER BY role_type, is_default DESC;

-- ============================================
-- CHECK: What roles are being used in profiles?
-- ============================================
SELECT DISTINCT
    p.role::text as role_used_in_profiles
FROM profiles p
ORDER BY p.role::text;

-- ============================================
-- IDENTIFY: Which roles are missing definitions
-- ============================================
SELECT 
    p.role::text as role_used,
    COUNT(p.id) as user_count,
    CASE WHEN r.id IS NULL THEN '❌ MISSING DEFINITION' ELSE '✅ OK' END as status
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
GROUP BY p.role::text, r.id
ORDER BY user_count DESC;

-- ============================================
-- LIKELY FIX: Create missing default roles
-- ============================================
-- Based on the issue, we need to ensure 'admin' and 'user' roles exist
-- Get the company_id first to use in the INSERT

-- First, find the company_id from any profile
SELECT DISTINCT company_id FROM profiles LIMIT 1;

-- Then insert missing roles. Replace 'YOUR-COMPANY-ID' with actual company_id
-- These are default permission sets for the standard roles

INSERT INTO roles (role_type, name, company_id, permissions, is_default, description)
VALUES 
    (
        'admin',
        'admin',
        'YOUR-COMPANY-ID',
        '["create_quotation","view_quotation","edit_quotation","delete_quotation","export_quotation","create_invoice","view_invoice","edit_invoice","delete_invoice","export_invoice","create_credit_note","view_credit_note","edit_credit_note","delete_credit_note","export_credit_note","create_proforma","view_proforma","edit_proforma","delete_proforma","export_proforma","create_payment","view_payment","edit_payment","delete_payment","create_inventory","view_inventory","edit_inventory","delete_inventory","manage_inventory","view_reports","export_reports","view_customer_reports","view_inventory_reports","view_sales_reports","create_customer","view_customer","edit_customer","delete_customer","create_delivery_note","view_delivery_note","edit_delivery_note","delete_delivery_note","create_lpo","view_lpo","edit_lpo","delete_lpo","create_remittance","view_remittance","edit_remittance","delete_remittance","create_user","edit_user","delete_user","manage_users","approve_users","invite_users","view_audit_logs","manage_roles","manage_permissions","access_settings"]'::jsonb,
        true,
        'Administrator with full system access'
    ),
    (
        'user',
        'User',
        'YOUR-COMPANY-ID',
        '["create_quotation","view_quotation","edit_quotation","view_invoice","view_credit_note","view_proforma","view_inventory","view_reports","view_customer_reports","view_sales_reports","view_customer","view_delivery_note","view_lpo","view_payment"]'::jsonb,
        true,
        'Basic user with limited viewing permissions'
    )
ON CONFLICT DO NOTHING;

-- ============================================
-- BETTER APPROACH: Get company_id and use it properly
-- ============================================
-- Run this to see what company_id to use:
WITH company_id_query AS (
    SELECT DISTINCT company_id FROM profiles WHERE company_id IS NOT NULL LIMIT 1
)
INSERT INTO roles (role_type, name, company_id, permissions, is_default, description)
SELECT 
    role_type,
    name,
    (SELECT company_id FROM company_id_query),
    permissions,
    is_default,
    description
FROM (
    VALUES
    (
        'admin',
        'admin',
        '["create_quotation","view_quotation","edit_quotation","delete_quotation","export_quotation","create_invoice","view_invoice","edit_invoice","delete_invoice","export_invoice","create_credit_note","view_credit_note","edit_credit_note","delete_credit_note","export_credit_note","create_proforma","view_proforma","edit_proforma","delete_proforma","export_proforma","create_payment","view_payment","edit_payment","delete_payment","create_inventory","view_inventory","edit_inventory","delete_inventory","manage_inventory","view_reports","export_reports","view_customer_reports","view_inventory_reports","view_sales_reports","create_customer","view_customer","edit_customer","delete_customer","create_delivery_note","view_delivery_note","edit_delivery_note","delete_delivery_note","create_lpo","view_lpo","edit_lpo","delete_lpo","create_remittance","view_remittance","edit_remittance","delete_remittance","create_user","edit_user","delete_user","manage_users","approve_users","invite_users","view_audit_logs","manage_roles","manage_permissions","access_settings"]'::jsonb,
        true,
        'Administrator with full system access'
    ),
    (
        'user',
        'User',
        '["create_quotation","view_quotation","edit_quotation","view_invoice","view_credit_note","view_proforma","view_inventory","view_reports","view_customer_reports","view_sales_reports","view_customer","view_delivery_note","view_lpo","view_payment"]'::jsonb,
        true,
        'Basic user with limited viewing permissions'
    )
) AS new_roles(role_type, name, permissions, is_default, description)
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE role_type = new_roles.role_type
);

-- ============================================
-- VERIFY: All users now have valid roles
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
-- FINAL CHECK: No missing roles remain
-- ============================================
SELECT 
    COUNT(*) as users_with_missing_roles
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL;
-- Should be 0
