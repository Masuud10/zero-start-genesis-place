
-- Add theme preference and dashboard preferences columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dashboard_preferences jsonb DEFAULT '{"showGreetings": true, "compactMode": false, "defaultView": "dashboard"}'::jsonb;

-- Create system_notifications table for system-wide notifications
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'maintenance', 'update', 'security')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  read_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on system_notifications
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own notifications
CREATE POLICY "Users can view their own system notifications" 
  ON public.system_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for admins to manage system notifications
CREATE POLICY "Admins can manage system notifications" 
  ON public.system_notifications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('elimisha_admin', 'edufam_admin')
    )
  );

-- Create updated_at trigger for system_notifications
CREATE TRIGGER update_system_notifications_updated_at
  BEFORE UPDATE ON public.system_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
