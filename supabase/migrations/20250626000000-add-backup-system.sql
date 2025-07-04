-- Create system_backups table for tracking database backups
CREATE TABLE IF NOT EXISTS public.system_backups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL DEFAULT 'full' CHECK (type IN ('full', 'incremental', 'configuration')),
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  size text,
  duration text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on system_backups
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;

-- Policy: Only edufam_admin can manage system backups
CREATE POLICY "Only edufam_admin can manage system backups" 
  ON public.system_backups 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'edufam_admin'
    )
  );

-- Create updated_at trigger for system_backups
CREATE OR REPLACE FUNCTION update_system_backups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_backups_updated_at
  BEFORE UPDATE ON public.system_backups
  FOR EACH ROW
  EXECUTE FUNCTION update_system_backups_updated_at();

-- Insert default backup settings
INSERT INTO public.system_settings (setting_key, setting_value, description, created_by)
VALUES (
  'backup_settings',
  jsonb_build_object(
    'auto_backup_enabled', true,
    'backup_frequency', 'daily',
    'backup_time', '02:00',
    'retention_days', 30,
    'max_backups', 10,
    'compress_backups', true
  ),
  'Database backup configuration',
  (SELECT id FROM public.profiles WHERE role = 'edufam_admin' LIMIT 1)
) ON CONFLICT (setting_key) DO NOTHING;

-- Insert default notification settings if not exists
INSERT INTO public.system_settings (setting_key, setting_value, description, created_by)
VALUES (
  'notification_settings',
  jsonb_build_object(
    'email_notifications', true,
    'sms_notifications', false,
    'push_notifications', true,
    'security_alerts', true,
    'system_updates', true,
    'maintenance_notifications', true,
    'email_frequency', 'immediate',
    'quiet_hours_start', '22:00',
    'quiet_hours_end', '07:00',
    'notification_channels', jsonb_build_array('email', 'web')
  ),
  'System notification configuration',
  (SELECT id FROM public.profiles WHERE role = 'edufam_admin' LIMIT 1)
) ON CONFLICT (setting_key) DO NOTHING;

-- Create function to check if user can access during maintenance
CREATE OR REPLACE FUNCTION public.can_user_access_during_maintenance(user_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(
    EXISTS (
      SELECT 1 FROM public.system_settings 
      WHERE setting_key = 'maintenance_mode'
      AND (setting_value->>'enabled')::boolean = false
    ) OR user_role = 'edufam_admin',
    true
  );
$$;

-- Create function to get maintenance status for user
CREATE OR REPLACE FUNCTION public.get_maintenance_status_for_user(user_role text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT jsonb_build_object(
    'inMaintenance', COALESCE((setting_value->>'enabled')::boolean, false),
    'message', COALESCE(setting_value->>'message', 'System is under maintenance. Please try again later.'),
    'canBypass', user_role = 'edufam_admin',
    'estimatedDuration', setting_value->>'estimated_duration'
  )
  FROM public.system_settings 
  WHERE setting_key = 'maintenance_mode';
$$; 