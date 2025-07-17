-- Create proper mapping for edufam_admin users to admin_users table
-- This will ensure edufam_admin users can access the admin dashboard as super_admin

DO $$
DECLARE
  profile_user record;
  admin_user_id uuid;
BEGIN
  -- Loop through all edufam_admin and elimisha_admin users in profiles table
  FOR profile_user IN 
    SELECT id, email, name 
    FROM public.profiles 
    WHERE role IN ('edufam_admin', 'elimisha_admin')
      AND id NOT IN (SELECT user_id FROM public.admin_users WHERE user_id IS NOT NULL)
  LOOP
    -- Insert corresponding admin_user record if it doesn't exist
    INSERT INTO public.admin_users (
      user_id,
      email,
      name,
      role,
      app_type,
      permissions,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      profile_user.id,
      profile_user.email,
      profile_user.name,
      'super_admin', -- Map edufam_admin to super_admin role
      'admin',
      jsonb_build_object(
        'manage_admin_users', true,
        'view_admin_users', true,
        'manage_schools', true,
        'view_schools', true,
        'view_system_analytics', true,
        'view_school_analytics', true,
        'export_reports', true,
        'view_logs', true,
        'manage_database', true,
        'manage_deployments', true,
        'view_api_usage', true,
        'manage_support_tickets', true,
        'view_support_tickets', true,
        'manage_hr_records', true,
        'view_hr_records', true,
        'manage_marketing_campaigns', true,
        'view_marketing_analytics', true,
        'manage_events', true,
        'send_notifications', true,
        'manage_billing', true,
        'view_billing', true,
        'export_financial_reports', true,
        'manage_global_settings', true,
        'view_audit_logs', true
      ),
      true,
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'super_admin',
      permissions = jsonb_build_object(
        'manage_admin_users', true,
        'view_admin_users', true,
        'manage_schools', true,
        'view_schools', true,
        'view_system_analytics', true,
        'view_school_analytics', true,
        'export_reports', true,
        'view_logs', true,
        'manage_database', true,
        'manage_deployments', true,
        'view_api_usage', true,
        'manage_support_tickets', true,
        'view_support_tickets', true,
        'manage_hr_records', true,
        'view_hr_records', true,
        'manage_marketing_campaigns', true,
        'view_marketing_analytics', true,
        'manage_events', true,
        'send_notifications', true,
        'manage_billing', true,
        'view_billing', true,
        'export_financial_reports', true,
        'manage_global_settings', true,
        'view_audit_logs', true
      ),
      is_active = true,
      updated_at = now();
      
    RAISE LOG 'Created/updated admin_user for profile %: %', profile_user.email, profile_user.id;
  END LOOP;
END $$;