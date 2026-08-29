-- ============================================
-- STEP 1: Get the company_id
-- ============================================
SELECT DISTINCT company_id FROM profiles WHERE company_id IS NOT NULL;

-- ============================================
-- STEP 2: Create missing 'admin' and 'user' roles
-- Replace 'COMPANY_ID_HERE' with the value from Step 1
-- ============================================

INSERT INTO roles (role_type, name, company_id, permissions, is_default, description)
VALUES 
    (
        'admin',
        'admin',
        'COMPANY_ID_HERE',
        '["create_quotation","view_quotation","edit_quotation","delete_quotation","export_quotation","create_invoice","view_invoice","edit_invoice","delete_invoice","export_invoice","create_credit_note","view_credit_note","edit_credit_note","delete_credit_note","export_credit_note","create_proforma","view_proforma","edit_proforma","delete_proforma","export_proforma","create_payment","view_payment","edit_payment","delete_payment","create_inventory","view_inventory","edit_inventory","delete_inventory","manage_inventory","view_reports","export_reports","view_customer_reports","view_inventory_reports","view_sales_reports","create_customer","view_customer","edit_customer","delete_customer","create_delivery_note","view_delivery_note","edit_delivery_note","delete_delivery_note","create_lpo","view_lpo","edit_lpo","delete_lpo","create_remittance","view_remittance","edit_remittance","delete_remittance","create_user","edit_user","delete_user","manage_users","approve_users","invite_users","view_audit_logs","manage_roles","manage_permissions","access_settings"]'::jsonb,
        true,
        'Administrator with full system access'
    ),
    (
        'user',
        'User',
        'COMPANY_ID_HERE',
        '["create_quotation","view_quotation","edit_quotation","view_invoice","view_credit_note","view_proforma","view_inventory","view_reports","view_customer_reports","view_sales_reports","view_customer","view_delivery_note","view_lpo","view_payment"]'::jsonb,
        true,
        'Basic user with limited viewing permissions'
    )
ON CONFLICT (role_type, company_id) DO NOTHING;

-- ============================================
-- STEP 3: Verify all users now have valid roles
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
-- STEP 4: Final check - should return 0
-- ============================================
SELECT COUNT(*) as users_with_missing_roles
FROM profiles p
LEFT JOIN roles r ON p.role::text = r.role_type AND p.company_id = r.company_id
WHERE r.id IS NULL;
