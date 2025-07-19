-- Fix super admin permissions for all admin functions
-- Update get_current_user_role function to properly handle admin users
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  -- First check if user is an admin user, then check profiles
  SELECT COALESCE(
    (SELECT au.role::text FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true),
    (SELECT p.role::text FROM public.profiles p WHERE p.id = auth.uid())
  );
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'edufam_admin') 
    AND is_active = true
  );
$$;

-- Update has_admin_permission function to include super_admin
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
    user_role admin_role;
BEGIN
    SELECT role, permissions INTO user_role, user_permissions
    FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true;
    
    -- Super admin and edufam_admin have all permissions
    IF user_role IN ('super_admin', 'edufam_admin') THEN
        RETURN true;
    END IF;
    
    -- Check specific permission
    RETURN COALESCE((user_permissions->permission_name)::boolean, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update get_current_user_school_id to handle admin users
CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(
    (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid()),
    (SELECT NULL::uuid WHERE EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'edufam_admin') AND au.is_active = true))
  );
$$;

-- Update RLS policies to use is_super_admin function
-- Update profiles table policies
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (is_super_admin());

-- Update schools table policies  
DROP POLICY IF EXISTS "Super admins can manage all schools" ON public.schools;
CREATE POLICY "Super admins can manage all schools" 
ON public.schools 
FOR ALL 
USING (is_super_admin());

-- Update admin_users table policies to use is_super_admin
DROP POLICY IF EXISTS "admin_users_view_all" ON public.admin_users;
CREATE POLICY "admin_users_view_all" 
ON public.admin_users 
FOR SELECT 
USING (is_super_admin());

DROP POLICY IF EXISTS "admin_users_insert" ON public.admin_users;
CREATE POLICY "admin_users_insert" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "admin_users_update" ON public.admin_users;
CREATE POLICY "admin_users_update" 
ON public.admin_users 
FOR UPDATE 
USING (is_super_admin());

DROP POLICY IF EXISTS "admin_users_delete" ON public.admin_users;
CREATE POLICY "admin_users_delete" 
ON public.admin_users 
FOR DELETE 
USING (is_super_admin());

-- Update get_admin_users_data function permissions
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    email text,
    name text,
    role text,
    app_type text,
    permissions jsonb,
    is_active boolean,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Check if user is super admin
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        au.id,
        au.user_id,
        au.email,
        au.name,
        au.role::text,
        au.app_type,
        au.permissions,
        au.is_active,
        au.last_login_at,
        au.created_at,
        au.updated_at,
        au.created_by
    FROM public.admin_users au
    ORDER BY au.created_at DESC;
END;
$$;

-- Update get_school_users_data function permissions
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
SET search_path = ''
AS $$
BEGIN
    -- Check if user is super admin
    IF NOT is_super_admin() THEN
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

-- Update get_schools_data function permissions
CREATE OR REPLACE FUNCTION public.get_schools_data()
RETURNS TABLE (
    id uuid,
    name text,
    email text,
    phone text,
    address text,
    school_type text,
    status text,
    subscription_plan text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    user_count bigint,
    student_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Check if user is super admin
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.address,
        s.school_type,
        s.status,
        s.subscription_plan,
        s.created_at,
        s.updated_at,
        COALESCE(user_counts.user_count, 0) as user_count,
        COALESCE(student_counts.student_count, 0) as student_count
    FROM public.schools s
    LEFT JOIN (
        SELECT school_id, COUNT(*) as user_count 
        FROM public.profiles 
        WHERE school_id IS NOT NULL 
        GROUP BY school_id
    ) user_counts ON s.id = user_counts.school_id
    LEFT JOIN (
        SELECT school_id, COUNT(*) as student_count 
        FROM public.students 
        WHERE school_id IS NOT NULL 
        GROUP BY school_id
    ) student_counts ON s.id = student_counts.school_id
    ORDER BY s.created_at DESC;
END;
$$;