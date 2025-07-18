-- Fix ambiguous status column references and handle_new_user function for admin roles

-- First, let's fix the get_admin_schools_data function that likely has ambiguous status reference
CREATE OR REPLACE FUNCTION public.get_admin_schools_data()
RETURNS TABLE(id uuid, name text, email text, phone text, address text, status text, subscription_plan text, total_students bigint, total_teachers bigint, created_at timestamp with time zone, last_activity timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
    AND au.role::text IN ('super_admin', 'finance', 'sales_marketing', 'support_hr')
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
    s.status, -- explicitly reference s.status to avoid ambiguity
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
$function$;

-- Create or replace handle_new_user function to handle admin roles properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  user_school_id UUID;
BEGIN
  -- Get user metadata
  user_role := NEW.raw_user_meta_data->>'role';
  user_name := NEW.raw_user_meta_data->>'name';
  
  -- For admin roles, don't require school_id
  IF user_role IN ('super_admin', 'support_hr', 'sales_marketing', 'finance', 'software_engineer') THEN
    -- Insert into admin_users table instead of profiles
    INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active, created_at, updated_at)
    VALUES (
      NEW.id, 
      NEW.email, 
      user_name, 
      user_role::admin_role, 
      'admin', 
      true, 
      now(), 
      now()
    );
  ELSE
    -- For non-admin roles, require school assignment and use profiles table
    user_school_id := (NEW.raw_user_meta_data->>'school_id')::UUID;
    
    IF user_school_id IS NULL THEN
      RAISE EXCEPTION 'School assignment is required for role: %', user_role;
    END IF;
    
    INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
    VALUES (NEW.id, NEW.email, user_name, user_role, user_school_id, now(), now());
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RAISE;
END;
$$;

-- Update get_admin_users_data function to handle admin users properly
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS TABLE(
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
AS $function$
BEGIN
  -- Check if user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() 
    AND au.role = 'super_admin' 
    AND au.is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Only Super administrators can access user data.';
  END IF;

  RETURN QUERY
  -- Get regular users from profiles
  SELECT 
    p.id,
    p.email,
    p.name,
    p.role,
    p.school_id,
    s.name as school_name,
    p.status,
    p.created_at,
    NULL::timestamp with time zone as last_login_at
  FROM public.profiles p
  LEFT JOIN public.schools s ON p.school_id = s.id
  WHERE p.role NOT IN ('super_admin', 'support_hr', 'sales_marketing', 'finance', 'software_engineer')
  
  UNION ALL
  
  -- Get admin users from admin_users table
  SELECT 
    au.user_id as id,
    au.email,
    au.name,
    au.role::text,
    NULL::uuid as school_id,
    'EduFam Admin'::text as school_name,
    CASE WHEN au.is_active THEN 'active' ELSE 'inactive' END as status,
    au.created_at,
    au.last_login_at
  FROM public.admin_users au
  
  ORDER BY created_at DESC;
END;
$function$;