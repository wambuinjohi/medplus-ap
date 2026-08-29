-- ============================================
-- CREATE MISSING ROLES (without conflict clause)
-- Company ID: 550e8400-e29b-41d4-a716-446655440000
-- ============================================

INSERT INTO roles (role_type, name, company_id, permissions, is_default, description)
VALUES 
    (
        'admin',
        'admin',
        '550e8400-e29b-41d4-a716-446655440000',
        '["create_quotation","view_quotation","edit_quotation","delete_quotation","export_quotation","create_invoice","view_invoice","edit_invoice","delete_invoice","export_invoice","create_credit_note","view_credit_note","edit_credit_note","delete_credit_note","export_credit_note","create_proforma","view_proforma","edit_proforma","delete_proforma","export_proforma","create_payment","view_payment","edit_payment","delete_payment","create_inventory","view_inventory","edit_inventory","delete_inventory","manage_inventory","view_reports","export_reports","view_customer_reports","view_inventory_reports","view_sales_reports","create_customer","view_customer","edit_customer","delete_customer","create_delivery_note","view_delivery_note","edit_delivery_note","delete_delivery_note","create_lpo","view_lpo","edit_lpo","delete_lpo","create_remittance","view_remittance","edit_remittance","delete_remittance","create_user","edit_user","delete_user","manage_users","approve_users","invite_users","view_audit_logs","manage_roles","manage_permissions","access_settings"]'::jsonb,
        true,
        'Administrator with full system access'
    ),
    (
        'user',
        'User',
        '550e8400-e29b-41d4-a716-446655440000',
        '["create_quotation","view_quotation","edit_quotation","view_invoice","view_credit_note","view_proforma","view_inventory","view_reports","view_customer_reports","view_sales_reports","view_customer","view_delivery_note","view_lpo","view_payment"]'::jsonb,
        true,
        'Basic user with limited viewing permissions'
    );
