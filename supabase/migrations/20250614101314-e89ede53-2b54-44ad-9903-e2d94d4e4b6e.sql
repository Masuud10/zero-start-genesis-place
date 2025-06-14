
-- Enable necessary extensions for security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create security audit table for logging
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit logs (only admins can read, system can write)
CREATE POLICY "Admins can view audit logs" ON public.security_audit_logs
FOR SELECT USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "System can insert audit logs" ON public.security_audit_logs
FOR INSERT WITH CHECK (true);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP or user_id
  action TEXT NOT NULL, -- login, signup, api_call, etc
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier, action)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create rate limit policies
CREATE POLICY "Users can view their own rate limits" ON public.rate_limits
FOR SELECT USING (identifier = auth.uid()::text);

CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL USING (true);

-- Create user sessions table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create session policies
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
FOR UPDATE USING (user_id = auth.uid());

-- Create MFA secrets table for TOTP
CREATE TABLE IF NOT EXISTS public.mfa_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  secret_key TEXT NOT NULL, -- Encrypted TOTP secret
  backup_codes TEXT[], -- Encrypted backup codes
  is_enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on MFA secrets
ALTER TABLE public.mfa_secrets ENABLE ROW LEVEL SECURITY;

-- Create MFA policies
CREATE POLICY "Users can manage their own MFA" ON public.mfa_secrets
FOR ALL USING (user_id = auth.uid());

-- Update profiles table to include security fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_ip INET;

-- Create security functions
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    success,
    error_message,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource,
    p_resource_id,
    p_success,
    p_error_message,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_attempts INTEGER := 0;
  window_start TIMESTAMP WITH TIME ZONE;
  is_blocked BOOLEAN := false;
BEGIN
  -- Check if currently blocked
  SELECT blocked_until > now() INTO is_blocked
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
  -- Get current attempts in window
  SELECT attempts, rate_limits.window_start INTO current_attempts, window_start
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND action = p_action
    AND window_start > now() - (p_window_minutes || ' minutes')::interval;
  
  -- If no record or window expired, create/reset
  IF current_attempts IS NULL OR window_start < now() - (p_window_minutes || ' minutes')::interval THEN
    INSERT INTO public.rate_limits (identifier, action, attempts, window_start)
    VALUES (p_identifier, p_action, 1, now())
    ON CONFLICT (identifier, action) 
    DO UPDATE SET 
      attempts = 1,
      window_start = now(),
      blocked_until = NULL,
      updated_at = now();
    RETURN true;
  END IF;
  
  -- Increment attempts
  current_attempts := current_attempts + 1;
  
  -- Block if exceeded
  IF current_attempts > p_max_attempts THEN
    UPDATE public.rate_limits 
    SET 
      attempts = current_attempts,
      blocked_until = now() + (p_window_minutes || ' minutes')::interval,
      updated_at = now()
    WHERE identifier = p_identifier AND action = p_action;
    RETURN false;
  END IF;
  
  -- Update attempts
  UPDATE public.rate_limits 
  SET 
    attempts = current_attempts,
    updated_at = now()
  WHERE identifier = p_identifier AND action = p_action;
  
  RETURN true;
END;
$$;

-- Create password strength validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{"valid": false, "errors": []}'::JSONB;
  errors TEXT[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for uppercase
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for numbers
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special characters
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  -- Return result
  IF array_length(errors, 1) IS NULL THEN
    result := '{"valid": true, "errors": []}'::JSONB;
  ELSE
    result := jsonb_build_object('valid', false, 'errors', errors);
  END IF;
  
  RETURN result;
END;
$$;

-- Create function to require MFA for sensitive roles
CREATE OR REPLACE FUNCTION public.requires_mfa(user_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT user_role IN ('elimisha_admin', 'edufam_admin', 'school_owner', 'principal', 'finance_officer');
$$;

-- Update existing RLS policies to include audit logging
CREATE OR REPLACE FUNCTION public.audit_rls_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access attempt
  PERFORM public.log_security_event(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    true,
    NULL,
    jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_profiles_access ON public.profiles;
CREATE TRIGGER audit_profiles_access
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_rls_access();

DROP TRIGGER IF EXISTS audit_grades_access ON public.grades;
CREATE TRIGGER audit_grades_access
  AFTER INSERT OR UPDATE OR DELETE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.audit_rls_access();

DROP TRIGGER IF EXISTS audit_students_access ON public.students;
CREATE TRIGGER audit_students_access
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.audit_rls_access();

DROP TRIGGER IF EXISTS audit_fees_access ON public.fees;
CREATE TRIGGER audit_fees_access
  AFTER INSERT OR UPDATE OR DELETE ON public.fees
  FOR EACH ROW EXECUTE FUNCTION public.audit_rls_access();

-- Ensure all tables have RLS enabled
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_details ENABLE ROW LEVEL SECURITY;
