-- Phase 1: Create notifications table for proper broadcast delivery
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  announcement_id UUID NOT NULL REFERENCES public.admin_communications(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to update their own notifications
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for system to insert notifications
CREATE POLICY "System can insert notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (TRUE);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_announcement_id ON public.notifications(announcement_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Create function to automatically create notifications for all target users when a communication is created
CREATE OR REPLACE FUNCTION create_notifications_for_communication()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification records for all users with matching roles
  INSERT INTO public.notifications (user_id, announcement_id, is_read, created_at, updated_at)
  SELECT 
    p.id as user_id,
    NEW.id as announcement_id,
    FALSE as is_read,
    NOW() as created_at,
    NOW() as updated_at
  FROM public.profiles p
  WHERE p.role = ANY(NEW.target_roles)
    AND p.id IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create notifications when a new communication is inserted
DROP TRIGGER IF EXISTS trigger_create_notifications ON public.admin_communications;
CREATE TRIGGER trigger_create_notifications
  AFTER INSERT ON public.admin_communications
  FOR EACH ROW
  EXECUTE FUNCTION create_notifications_for_communication();