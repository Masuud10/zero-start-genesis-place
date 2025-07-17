-- Migrate existing edufam_admin users to the new admin_users table
-- First, let's check if we need to add any existing edufam_admin users
INSERT INTO public.admin_users (user_id, email, name, role, permissions, is_active, app_type, created_at, updated_at)
SELECT 
  p.id as user_id,
  p.email,
  COALESCE(p.name, split_part(p.email, '@', 1)) as name,
  'super_admin' as role,
  '{
    "manage_admin_users": true,
    "view_admin_users": true,
    "manage_schools": true,
    "view_schools": true,
    "manage_billing": true,
    "view_billing": true,
    "manage_users": true,
    "view_users": true,
    "manage_analytics": true,
    "view_analytics": true,
    "manage_system_settings": true,
    "view_system_settings": true,
    "manage_communications": true,
    "view_communications": true,
    "manage_support_tickets": true,
    "view_support_tickets": true,
    "manage_hr_records": true,
    "view_hr_records": true,
    "manage_marketing_campaigns": true,
    "view_marketing_campaigns": true,
    "view_logs": true,
    "manage_database": true,
    "view_api_usage": true,
    "view_audit_logs": true,
    "manage_global_settings": true
  }'::jsonb as permissions,
  true as is_active,
  'admin' as app_type,
  NOW() as created_at,
  NOW() as updated_at
FROM public.profiles p
WHERE p.role = 'edufam_admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = p.id
  );