-- Fix function overloading issues and missing functions
-- Drop all conflicting function versions first
DROP FUNCTION IF EXISTS public.get_school_users_data();
DROP FUNCTION IF EXISTS public.get_school_users_data(uuid);
DROP FUNCTION IF EXISTS public.get_school_users_data(p_school_id uuid);
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.is_admin_user();

-- Recreate is_super_admin function with proper schema qualification
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'edufam_admin') 
    AND is_active = true
  );
$$;

-- Recreate is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
$$;

-- Recreate get_school_users_data with single signature
CREATE OR REPLACE FUNCTION public.get_school_users_data(p_school_id uuid DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    email text,
    name text,
    role text,
    school_id uuid,
    school_name text,
    status text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check if user is super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.name,
        p.role,
        p.school_id,
        s.name as school_name,
        p.status,
        p.created_at,
        p.updated_at,
        p.last_login_at
    FROM public.profiles p
    LEFT JOIN public.schools s ON p.school_id = s.id
    WHERE (p_school_id IS NULL OR p.school_id = p_school_id)
    AND p.role != 'super_admin'
    ORDER BY p.created_at DESC;
END;
$$;

-- Update RLS policies to use the correct function references
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can manage all schools" ON public.schools;
CREATE POLICY "Super admins can manage all schools" 
ON public.schools 
FOR ALL 
USING (public.is_super_admin());

-- Update admin_users policies
DROP POLICY IF EXISTS "admin_users_view_all" ON public.admin_users;
CREATE POLICY "admin_users_view_all" 
ON public.admin_users 
FOR SELECT 
USING (public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_insert" ON public.admin_users;
CREATE POLICY "admin_users_insert" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_update" ON public.admin_users;
CREATE POLICY "admin_users_update" 
ON public.admin_users 
FOR UPDATE 
USING (public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_delete" ON public.admin_users;
CREATE POLICY "admin_users_delete" 
ON public.admin_users 
FOR DELETE 
USING (public.is_super_admin());

-- Update admin_audit_logs policies
DROP POLICY IF EXISTS "admin_audit_logs_view_all" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_view_all" 
ON public.admin_audit_logs 
FOR SELECT 
USING (public.is_super_admin());

DROP POLICY IF EXISTS "admin_audit_logs_insert" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_insert" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (public.is_admin_user());