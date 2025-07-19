-- Fix get_school_users_data() function overloading
-- Run this directly in Supabase SQL Editor

-- Drop ALL versions of the function to clean up completely
DROP FUNCTION IF EXISTS public.get_school_users_data();
DROP FUNCTION IF EXISTS public.get_school_users_data(uuid);
DROP FUNCTION IF EXISTS public.get_school_users_data(p_school_id uuid);
DROP FUNCTION IF EXISTS public.get_school_users_data(target_school_id uuid);

-- Create a single, clear version of get_school_users_data
CREATE OR REPLACE FUNCTION public.get_school_users_data(target_school_id uuid DEFAULT NULL)
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
SET search_path = 'public'
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
    WHERE (target_school_id IS NULL OR p.school_id = target_school_id)
    AND p.role != 'super_admin'
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_school_users_data(uuid) TO authenticated;

-- Also create a version without parameters for backward compatibility
CREATE OR REPLACE FUNCTION public.get_school_users_data()
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
SET search_path = 'public'
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
    WHERE p.role != 'super_admin'
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_school_users_data() TO authenticated; 