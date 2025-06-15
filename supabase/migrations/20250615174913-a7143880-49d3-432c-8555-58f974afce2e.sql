
-- Add school_id to security_audit_logs to enable school-scoped queries
ALTER TABLE public.security_audit_logs
ADD COLUMN school_id UUID;

-- Add foreign key to ensure data integrity
ALTER TABLE public.security_audit_logs
ADD CONSTRAINT fk_security_audit_logs_school_id
FOREIGN KEY (school_id)
REFERENCES public.schools(id)
ON DELETE SET NULL;

-- Create an index for performance
CREATE INDEX idx_security_audit_logs_school_id ON public.security_audit_logs(school_id);

-- Update the logging function to include school_id
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text, 
  p_resource text, 
  p_resource_id uuid DEFAULT NULL::uuid, 
  p_success boolean DEFAULT true, 
  p_error_message text DEFAULT NULL::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  log_id UUID;
  user_school_id UUID;
BEGIN
  -- Get the school_id of the current user from their profile
  SELECT school_id INTO user_school_id
  FROM public.profiles
  WHERE id = auth.uid();

  INSERT INTO public.security_audit_logs (
    user_id,
    school_id, -- added column
    action,
    resource,
    resource_id,
    success,
    error_message,
    metadata
  ) VALUES (
    auth.uid(),
    user_school_id, -- added value
    p_action,
    p_resource,
    p_resource_id,
    p_success,
    p_error_message,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$
