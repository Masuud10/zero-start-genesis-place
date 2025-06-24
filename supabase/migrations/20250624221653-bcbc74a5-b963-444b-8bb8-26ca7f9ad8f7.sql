
-- Create centralized audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  performed_by_user_id UUID REFERENCES auth.users(id),
  performed_by_role TEXT NOT NULL,
  school_id UUID REFERENCES public.schools(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  target_entity TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for school-level users (principals, teachers, etc.) - can only see their school's logs
CREATE POLICY "School users can view their school audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('principal', 'teacher', 'school_owner', 'finance_officer')
  );

-- Policy for EduFam admins - can see all logs
CREATE POLICY "EduFam admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('edufam_admin', 'elimisha_admin'));

-- Policy for inserting audit logs - any authenticated user can create logs
CREATE POLICY "Users can create audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_school_id ON public.audit_logs(school_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(performed_by_user_id);

-- Create function to automatically log actions
CREATE OR REPLACE FUNCTION public.log_audit_action(
  p_action TEXT,
  p_target_entity TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
  user_role TEXT;
  user_school_id UUID;
BEGIN
  -- Get current user's role and school
  SELECT role, school_id INTO user_role, user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Insert audit log
  INSERT INTO public.audit_logs (
    action,
    performed_by_user_id,
    performed_by_role,
    school_id,
    target_entity,
    old_value,
    new_value,
    ip_address,
    metadata
  ) VALUES (
    p_action,
    auth.uid(),
    user_role,
    user_school_id,
    p_target_entity,
    p_old_value,
    p_new_value,
    NULL, -- IP will be handled client-side
    p_metadata
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;
