-- Fix admin_role enum and ensure all functions work correctly
-- Drop existing objects that reference admin_role
DROP FUNCTION IF EXISTS public.get_current_admin_role();
DROP FUNCTION IF EXISTS public.get_admin_schools_data();
DROP FUNCTION IF EXISTS public.get_admin_users_data();

-- Recreate admin_role enum with correct values
DROP TYPE IF EXISTS public.admin_role CASCADE;
CREATE TYPE public.admin_role AS ENUM (
    'super_admin',
    'software_engineer', 
    'support_hr',
    'sales_marketing',
    'finance'
);

-- Recreate get_current_admin_role function
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT au.role
  FROM public.admin_users au
  WHERE au.user_id = auth.uid() AND au.is_active = true
  LIMIT 1;
$$;

-- Recreate get_admin_schools_data function
CREATE OR REPLACE FUNCTION public.get_admin_schools_data()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  address text,
  status text,
  subscription_plan text,
  total_students bigint,
  total_teachers bigint,
  created_at timestamp with time zone,
  last_activity timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
    AND au.role IN ('super_admin', 'finance', 'sales_marketing', 'support_hr')
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.email,
    s.phone,
    s.address,
    s.status,
    s.subscription_plan,
    COALESCE(student_counts.total_students, 0) as total_students,
    COALESCE(teacher_counts.total_teachers, 0) as total_teachers,
    s.created_at,
    s.updated_at as last_activity
  FROM public.schools s
  LEFT JOIN (
    SELECT school_id, COUNT(*) as total_students
    FROM public.students
    WHERE status = 'active'
    GROUP BY school_id
  ) student_counts ON s.id = student_counts.school_id
  LEFT JOIN (
    SELECT school_id, COUNT(*) as total_teachers
    FROM public.profiles
    WHERE role = 'teacher' AND status = 'active'
    GROUP BY school_id
  ) teacher_counts ON s.id = teacher_counts.school_id
  ORDER BY s.created_at DESC;
END;
$$;

-- Recreate get_admin_users_data function 
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role text,
  school_id uuid,
  school_name text,
  status text,
  created_at timestamp with time zone,
  last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true AND au.role = 'super_admin'
  ) THEN
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
    p.last_login_at
  FROM public.profiles p
  LEFT JOIN public.schools s ON p.school_id = s.id
  WHERE p.role IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer')
  ORDER BY p.created_at DESC;
END;
$$;