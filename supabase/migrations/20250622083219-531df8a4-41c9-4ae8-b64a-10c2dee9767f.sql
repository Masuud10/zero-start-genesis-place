
-- Create system_settings table to store global system configuration
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Add Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only edufam_admin can read system settings
CREATE POLICY "Only edufam_admin can read system settings" 
  ON public.system_settings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'edufam_admin'
    )
  );

-- Policy: Only edufam_admin can insert system settings
CREATE POLICY "Only edufam_admin can insert system settings" 
  ON public.system_settings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'edufam_admin'
    )
  );

-- Policy: Only edufam_admin can update system settings
CREATE POLICY "Only edufam_admin can update system settings" 
  ON public.system_settings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'edufam_admin'
    )
  );

-- Insert default maintenance mode setting with proper JSONB casting
INSERT INTO public.system_settings (setting_key, setting_value, description, created_by)
VALUES (
  'maintenance_mode',
  jsonb_build_object(
    'enabled', false,
    'message', 'System is currently under maintenance. Please try again later.',
    'updated_at', now()
  ),
  'Controls system-wide maintenance mode',
  (SELECT id FROM public.profiles WHERE role = 'edufam_admin' LIMIT 1)
);

-- Create function to check if system is in maintenance mode
CREATE OR REPLACE FUNCTION public.is_system_in_maintenance()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(
    (setting_value->>'enabled')::boolean, 
    false
  )
  FROM public.system_settings 
  WHERE setting_key = 'maintenance_mode';
$$;

-- Create function to get maintenance message
CREATE OR REPLACE FUNCTION public.get_maintenance_message()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(
    setting_value->>'message', 
    'System is currently under maintenance. Please try again later.'
  )
  FROM public.system_settings 
  WHERE setting_key = 'maintenance_mode';
$$;
