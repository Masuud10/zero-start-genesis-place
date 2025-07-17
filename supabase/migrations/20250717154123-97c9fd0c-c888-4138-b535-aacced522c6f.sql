-- Fix infinite recursion by creating security definer functions
CREATE OR REPLACE FUNCTION public.get_current_admin_user_role()
RETURNS admin_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role admin_role;
BEGIN
  SELECT role INTO user_role
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  RETURN user_role;
END;
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'::admin_role 
    AND is_active = true
  );
END;
$$;

-- Create function to check if user has admin permission
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_permissions JSONB;
  user_role admin_role;
BEGIN
  SELECT role, permissions INTO user_role, user_permissions
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  RETURN COALESCE((user_permissions->permission_name)::boolean, false);
END;
$$;

-- Drop and recreate the problematic policies
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;

-- Create new policies using security definer functions
CREATE POLICY "Admin users can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all admin users" 
ON public.admin_users 
FOR ALL 
USING (public.is_super_admin());

-- Update audit logs policy to use new function
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.admin_audit_logs;
CREATE POLICY "Super admins can view all audit logs" 
ON public.admin_audit_logs 
FOR SELECT 
USING (public.is_super_admin());

DROP POLICY IF EXISTS "All admin users can create audit logs" ON public.admin_audit_logs;
CREATE POLICY "All admin users can create audit logs" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true
));