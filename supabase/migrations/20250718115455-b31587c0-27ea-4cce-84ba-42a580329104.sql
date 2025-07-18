-- Update admin user permissions for super_admin users
UPDATE public.admin_users 
SET permissions = '{
    "manage_admin_users": true,
    "view_admin_users": true,
    "view_system_analytics": true,
    "export_reports": true,
    "view_logs": true,
    "manage_database": true,
    "manage_deployments": true,
    "view_api_usage": true,
    "manage_support_tickets": true,
    "view_support_tickets": true,
    "manage_hr_records": true,
    "view_hr_records": true,
    "manage_marketing_campaigns": true,
    "view_marketing_analytics": true,
    "manage_events": true,
    "send_notifications": true,
    "manage_billing": true,
    "view_billing": true,
    "export_financial_reports": true,
    "manage_global_settings": true,
    "view_audit_logs": true
}'::jsonb
WHERE role = 'super_admin' AND permissions = '{}'::jsonb;