-- Create function to get admin users data (without school_id)
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    result jsonb;
    user_role text;
BEGIN
    -- Get current user's role
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Only super admins and edufam admins can access this data
    IF user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
        RETURN jsonb_build_object('error', 'Insufficient permissions');
    END IF;
    
    -- Get admin users (those without school_id)
    SELECT jsonb_build_object(
        'success', true,
        'users', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', p.id,
                    'name', p.name,
                    'email', p.email,
                    'role', p.role,
                    'status', p.status,
                    'created_at', p.created_at,
                    'updated_at', p.updated_at
                )
            )
            FROM public.profiles p 
            WHERE p.school_id IS NULL 
            ORDER BY p.created_at DESC),
            '[]'::jsonb
        ),
        'stats', jsonb_build_object(
            'total_admins', (SELECT COUNT(*) FROM public.profiles WHERE school_id IS NULL),
            'active_admins', (SELECT COUNT(*) FROM public.profiles WHERE school_id IS NULL AND status = 'active'),
            'inactive_admins', (SELECT COUNT(*) FROM public.profiles WHERE school_id IS NULL AND status = 'inactive')
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Create function to get school users data (with school_id)
CREATE OR REPLACE FUNCTION public.get_school_users_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    result jsonb;
    user_role text;
BEGIN
    -- Get current user's role
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Only super admins and edufam admins can access this data
    IF user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
        RETURN jsonb_build_object('error', 'Insufficient permissions');
    END IF;
    
    -- Get school users with their school information
    SELECT jsonb_build_object(
        'success', true,
        'users', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', p.id,
                    'name', p.name,
                    'email', p.email,
                    'role', p.role,
                    'status', p.status,
                    'school_id', p.school_id,
                    'school_name', COALESCE(s.name, 'Unknown School'),
                    'created_at', p.created_at,
                    'updated_at', p.updated_at
                )
            )
            FROM public.profiles p 
            LEFT JOIN public.schools s ON p.school_id = s.id
            WHERE p.school_id IS NOT NULL 
            ORDER BY p.created_at DESC),
            '[]'::jsonb
        ),
        'stats', jsonb_build_object(
            'total_users', (SELECT COUNT(*) FROM public.profiles WHERE school_id IS NOT NULL),
            'active_users', (SELECT COUNT(*) FROM public.profiles WHERE school_id IS NOT NULL AND status = 'active'),
            'inactive_users', (SELECT COUNT(*) FROM public.profiles WHERE school_id IS NOT NULL AND status = 'inactive')
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Create function to get schools data with stats
CREATE OR REPLACE FUNCTION public.get_schools_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    result jsonb;
    user_role text;
BEGIN
    -- Get current user's role
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Only super admins and edufam admins can access this data
    IF user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
        RETURN jsonb_build_object('error', 'Insufficient permissions');
    END IF;
    
    -- Get schools with student counts
    SELECT jsonb_build_object(
        'success', true,
        'schools', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'name', s.name,
                    'email', s.email,
                    'phone', s.phone,
                    'address', s.address,
                    'school_type', s.school_type,
                    'status', s.status,
                    'logo_url', s.logo_url,
                    'created_at', s.created_at,
                    'student_count', COALESCE(student_counts.count, 0)
                )
            )
            FROM public.schools s
            LEFT JOIN (
                SELECT school_id, COUNT(*) as count
                FROM public.students
                GROUP BY school_id
            ) student_counts ON s.id = student_counts.school_id
            ORDER BY s.created_at DESC),
            '[]'::jsonb
        ),
        'stats', jsonb_build_object(
            'total_schools', (SELECT COUNT(*) FROM public.schools),
            'active_schools', (SELECT COUNT(*) FROM public.schools WHERE status = 'active'),
            'inactive_schools', (SELECT COUNT(*) FROM public.schools WHERE status = 'inactive')
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Create function for super admin analytics
CREATE OR REPLACE FUNCTION public.get_super_admin_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    result jsonb;
    user_role text;
BEGIN
    -- Get current user's role
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Only super admins and edufam admins can access this data
    IF user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
        RETURN jsonb_build_object('error', 'Insufficient permissions');
    END IF;
    
    -- Get comprehensive analytics data
    SELECT jsonb_build_object(
        'success', true,
        'schools', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM public.schools),
            'active', (SELECT COUNT(*) FROM public.schools WHERE status = 'active'),
            'new_this_month', (SELECT COUNT(*) FROM public.schools WHERE created_at >= date_trunc('month', CURRENT_DATE))
        ),
        'users', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM public.profiles),
            'school_users', (SELECT COUNT(*) FROM public.profiles WHERE school_id IS NOT NULL),
            'admin_users', (SELECT COUNT(*) FROM public.profiles WHERE school_id IS NULL),
            'active', (SELECT COUNT(*) FROM public.profiles WHERE status = 'active'),
            'new_this_month', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= date_trunc('month', CURRENT_DATE))
        ),
        'students', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM public.students),
            'new_this_month', (SELECT COUNT(*) FROM public.students WHERE created_at >= date_trunc('month', CURRENT_DATE))
        ),
        'recent_activities', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', p.id,
                    'name', p.name,
                    'email', p.email,
                    'role', p.role,
                    'school_name', COALESCE(s.name, 'System Admin'),
                    'created_at', p.created_at
                )
            )
            FROM public.profiles p
            LEFT JOIN public.schools s ON p.school_id = s.id
            ORDER BY p.created_at DESC
            LIMIT 10),
            '[]'::jsonb
        )
    ) INTO result;
    
    RETURN result;
END;
$$;