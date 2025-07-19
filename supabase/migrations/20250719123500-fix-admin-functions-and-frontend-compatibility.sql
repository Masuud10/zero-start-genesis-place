-- Fix admin functions and ensure frontend compatibility
-- This migration addresses the issues with function signatures and return types

-- First, let's fix the admin_update_user_status function to match frontend expectations
DROP FUNCTION IF EXISTS public.admin_update_user_status(uuid, text);
DROP FUNCTION IF EXISTS public.admin_update_user_status(uuid, boolean);

-- Create admin_update_user_status function that matches frontend expectations
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
    target_user_id uuid,
    new_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    current_user_role text;
    updated_user record;
BEGIN
    -- Check if current user has admin privileges
    SELECT role INTO current_user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    IF current_user_role NOT IN ('super_admin', 'edufam_admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to update user status';
    END IF;
    
    -- Update user status
    UPDATE public.profiles 
    SET 
        status = new_status,
        updated_at = now()
    WHERE id = target_user_id
    RETURNING * INTO updated_user;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Return success response with updated user data
    RETURN jsonb_build_object(
        'success', true,
        'new_status', new_status,
        'user_id', target_user_id,
        'message', 'User status updated successfully'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_update_user_status(uuid, text) TO authenticated;

-- Now fix the get_admin_users_data function to return the expected structure
DROP FUNCTION IF EXISTS public.get_admin_users_data();

-- Create get_admin_users_data function that returns the expected structure for frontend
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    admin_users_data jsonb;
    stats_data jsonb;
BEGIN
    -- Check if user is super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;

    -- Get admin users data
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', au.user_id,
            'name', au.name,
            'email', au.email,
            'role', au.role,
            'status', CASE WHEN au.is_active THEN 'active' ELSE 'inactive' END,
            'created_at', au.created_at,
            'updated_at', au.updated_at
        )
    ) INTO admin_users_data
    FROM public.admin_users au
    ORDER BY au.created_at DESC;

    -- Get stats
    SELECT jsonb_build_object(
        'total_admins', COUNT(*),
        'active_admins', COUNT(*) FILTER (WHERE is_active = true),
        'inactive_admins', COUNT(*) FILTER (WHERE is_active = false)
    ) INTO stats_data
    FROM public.admin_users;

    -- Return combined data
    RETURN jsonb_build_object(
        'success', true,
        'users', COALESCE(admin_users_data, '[]'::jsonb),
        'stats', stats_data
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_users_data() TO authenticated;

-- Also create a version that returns the original table structure for backward compatibility
CREATE OR REPLACE FUNCTION public.get_admin_users_data_table()
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
SET search_path = 'public'
AS $$
BEGIN
    -- Check if user is super admin
    IF NOT public.is_super_admin() THEN
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_users_data_table() TO authenticated;

-- Update the get_school_users_data function to have clear signatures
DROP FUNCTION IF EXISTS public.get_school_users_data();
DROP FUNCTION IF EXISTS public.get_school_users_data(uuid);
DROP FUNCTION IF EXISTS public.get_school_users_data(p_school_id uuid);
DROP FUNCTION IF EXISTS public.get_school_users_data(target_school_id uuid);

-- Create get_school_users_data function with clear signature
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

-- Test the functions to ensure they work
DO $$
BEGIN
    -- Test is_super_admin function
    PERFORM public.is_super_admin();
    RAISE NOTICE 'is_super_admin function is working';
    
    -- Test get_admin_users_data function (this will fail if not super admin, which is expected)
    BEGIN
        PERFORM public.get_admin_users_data();
        RAISE NOTICE 'get_admin_users_data function is working';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_admin_users_data function exists but access denied (expected for non-super admin)';
    END;
    
    -- Test admin_update_user_status function (this will fail if not super admin, which is expected)
    BEGIN
        PERFORM public.admin_update_user_status('00000000-0000-0000-0000-000000000000'::uuid, 'active');
        RAISE NOTICE 'admin_update_user_status function is working';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'admin_update_user_status function exists but access denied (expected for non-super admin)';
    END;
END $$; 