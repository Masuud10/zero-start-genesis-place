-- Create strict role-based validation functions
-- These functions enforce role-based access control at the database level

-- Function to validate user role for specific access type
CREATE OR REPLACE FUNCTION public.validate_user_access_type(
  p_user_id UUID,
  p_required_access_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_role TEXT;
  user_status TEXT;
  user_school_id UUID;
  admin_roles TEXT[] := ARRAY['edufam_admin', 'elimisha_admin'];
  school_roles TEXT[] := ARRAY['school_owner', 'principal', 'teacher', 'parent', 'finance_officer'];
BEGIN
  -- Get user profile information
  SELECT role, status, school_id
  INTO user_role, user_status, user_school_id
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if user exists
  IF user_role IS NULL THEN
    result := jsonb_build_object(
      'is_valid', false,
      'error', 'User not found or profile incomplete',
      'user_id', p_user_id
    );
    RETURN result;
  END IF;
  
  -- Check if user account is active
  IF user_status = 'inactive' OR user_status = 'suspended' THEN
    result := jsonb_build_object(
      'is_valid', false,
      'error', 'Your account has been deactivated. Please contact your administrator.',
      'user_id', p_user_id,
      'status', user_status
    );
    RETURN result;
  END IF;
  
  -- Validate role for access type
  IF p_required_access_type = 'admin' THEN
    -- Only admin roles can access admin sections
    IF NOT (user_role = ANY(admin_roles)) THEN
      result := jsonb_build_object(
        'is_valid', false,
        'error', 'Access denied. The EduFam Admin Staff area is restricted to internal staff only. Your account is not authorized for this access.',
        'user_id', p_user_id,
        'user_role', user_role,
        'required_access', 'admin'
      );
      RETURN result;
    END IF;
  ELSIF p_required_access_type = 'school' THEN
    -- Only school roles can access school sections
    IF NOT (user_role = ANY(school_roles)) THEN
      result := jsonb_build_object(
        'is_valid', false,
        'error', 'Access denied. The School Users area is restricted to school staff and parents only. Your account is not authorized for this access.',
        'user_id', p_user_id,
        'user_role', user_role,
        'required_access', 'school'
      );
      RETURN result;
    END IF;
    
    -- For school users, ensure they have a school assignment (except for admin roles)
    IF user_school_id IS NULL AND NOT (user_role = ANY(admin_roles)) THEN
      result := jsonb_build_object(
        'is_valid', false,
        'error', 'Your account needs to be assigned to a school. Please contact your administrator.',
        'user_id', p_user_id,
        'user_role', user_role,
        'school_id', user_school_id
      );
      RETURN result;
    END IF;
  ELSE
    -- Invalid access type
    result := jsonb_build_object(
      'is_valid', false,
      'error', 'Invalid access type specified',
      'required_access', p_required_access_type
    );
    RETURN result;
  END IF;
  
  -- All validations passed
  result := jsonb_build_object(
    'is_valid', true,
    'user_id', p_user_id,
    'user_role', user_role,
    'school_id', user_school_id,
    'access_type', p_required_access_type
  );
  
  RETURN result;
END;
$$;

-- Function to get user's allowed access types
CREATE OR REPLACE FUNCTION public.get_user_access_types(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_role TEXT;
  admin_roles TEXT[] := ARRAY['edufam_admin', 'elimisha_admin'];
  school_roles TEXT[] := ARRAY['school_owner', 'principal', 'teacher', 'parent', 'finance_officer'];
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF user_role IS NULL THEN
    result := jsonb_build_object(
      'user_id', p_user_id,
      'access_types', jsonb_build_array(),
      'error', 'User not found'
    );
    RETURN result;
  END IF;
  
  -- Determine access types based on role
  IF user_role = ANY(admin_roles) THEN
    -- Admin roles can access both admin and school sections
    result := jsonb_build_object(
      'user_id', p_user_id,
      'user_role', user_role,
      'access_types', jsonb_build_array('admin', 'school'),
      'primary_access', 'admin'
    );
  ELSIF user_role = ANY(school_roles) THEN
    -- School roles can only access school sections
    result := jsonb_build_object(
      'user_id', p_user_id,
      'user_role', user_role,
      'access_types', jsonb_build_array('school'),
      'primary_access', 'school'
    );
  ELSE
    -- Unknown role - no access
    result := jsonb_build_object(
      'user_id', p_user_id,
      'user_role', user_role,
      'access_types', jsonb_build_array(),
      'error', 'Unknown role - no access granted'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Function to audit access attempts
CREATE OR REPLACE FUNCTION public.audit_access_attempt(
  p_user_id UUID,
  p_attempted_access_type TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Get user information
  SELECT p.role, u.email
  INTO user_role, user_email
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.id = p_user_id;
  
  -- Insert audit record
  INSERT INTO public.access_audit_log (
    user_id,
    user_email,
    user_role,
    attempted_access_type,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    user_email,
    user_role,
    p_attempted_access_type,
    p_success,
    p_error_message,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Create access audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.access_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_role TEXT,
  attempted_access_type TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_audit_log_user_id ON public.access_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_log_created_at ON public.access_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_access_audit_log_success ON public.access_audit_log(success);
CREATE INDEX IF NOT EXISTS idx_access_audit_log_access_type ON public.access_audit_log(attempted_access_type);

-- Enable RLS on audit log table
ALTER TABLE public.access_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit log
CREATE POLICY "Edufam admins can view all audit logs" ON public.access_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('edufam_admin', 'elimisha_admin')
    )
  );

CREATE POLICY "Users can view their own audit logs" ON public.access_audit_log
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Function to get access statistics for monitoring
CREATE OR REPLACE FUNCTION public.get_access_statistics(
  p_start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '24 hours',
  p_end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'period', jsonb_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date
    ),
    'total_attempts', (
      SELECT COUNT(*) 
      FROM public.access_audit_log 
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'successful_attempts', (
      SELECT COUNT(*) 
      FROM public.access_audit_log 
      WHERE created_at BETWEEN p_start_date AND p_end_date 
      AND success = true
    ),
    'failed_attempts', (
      SELECT COUNT(*) 
      FROM public.access_audit_log 
      WHERE created_at BETWEEN p_start_date AND p_end_date 
      AND success = false
    ),
    'access_type_breakdown', (
      SELECT jsonb_object_agg(attempted_access_type, count)
      FROM (
        SELECT attempted_access_type, COUNT(*) as count
        FROM public.access_audit_log
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY attempted_access_type
      ) t
    ),
    'role_breakdown', (
      SELECT jsonb_object_agg(user_role, count)
      FROM (
        SELECT user_role, COUNT(*) as count
        FROM public.access_audit_log
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY user_role
      ) t
    ),
    'recent_failed_attempts', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_email', user_email,
          'user_role', user_role,
          'attempted_access', attempted_access_type,
          'error_message', error_message,
          'created_at', created_at
        )
      )
      FROM public.access_audit_log
      WHERE created_at BETWEEN p_start_date AND p_end_date
      AND success = false
      ORDER BY created_at DESC
      LIMIT 10
    )
  )
  INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_user_access_type(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_access_types(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_access_attempt(UUID, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_access_statistics(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- Grant permissions on audit log table
GRANT SELECT ON public.access_audit_log TO authenticated;
GRANT INSERT ON public.access_audit_log TO authenticated; 