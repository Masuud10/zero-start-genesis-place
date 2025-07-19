-- Fix get_admin_users_data function
-- Run this directly in Supabase SQL Editor

-- Drop any existing versions to avoid conflicts
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