-- Add audit logging trigger for system_settings changes
CREATE OR REPLACE FUNCTION log_system_settings_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log system settings changes to audit_logs
  INSERT INTO public.audit_logs (
    action,
    target_entity,
    performed_by_role,
    performed_by_user_id,
    old_value,
    new_value,
    metadata
  ) VALUES (
    TG_OP,
    'system_settings',
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    auth.uid(),
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    jsonb_build_object(
      'setting_key', COALESCE(NEW.setting_key, OLD.setting_key),
      'table', 'system_settings',
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for system_settings changes
DROP TRIGGER IF EXISTS trigger_log_system_settings_changes ON public.system_settings;
CREATE TRIGGER trigger_log_system_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION log_system_settings_changes();

-- Ensure we have default notification settings
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES (
  'notification_config',
  jsonb_build_object(
    'email_sender_name', 'EduFam System',
    'notification_email', 'admin@edufam.com',
    'auto_alerts_enabled', true,
    'support_ticket_alerts', true,
    'system_update_alerts', true,
    'maintenance_alerts', true
  ),
  'System notification configuration settings'
) ON CONFLICT (setting_key) DO NOTHING;

-- Add default global config if not exists
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES (
  'global_config',
  jsonb_build_object(
    'school_year_start', '',
    'school_year_end', '',
    'default_curriculum', 'CBC',
    'default_grading_scale', 'CBC',
    'timezone', 'Africa/Nairobi',
    'date_format', 'DD/MM/YYYY',
    'term_structure', '3-term'
  ),
  'Global system configuration settings'
) ON CONFLICT (setting_key) DO NOTHING;