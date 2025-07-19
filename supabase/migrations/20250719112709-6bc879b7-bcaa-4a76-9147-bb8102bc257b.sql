-- Create missing database functions for admin modules

-- Function to update user status
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
    target_user_id uuid,
    new_status text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    current_user_role text;
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
    WHERE id = target_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    RETURN 'User status updated successfully';
END;
$$;

-- Function to toggle school status  
CREATE OR REPLACE FUNCTION public.toggle_school_status(
    school_id uuid,
    is_active boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    current_user_role text;
    new_status text;
BEGIN
    -- Check if current user has admin privileges
    SELECT role INTO current_user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    IF current_user_role NOT IN ('super_admin', 'edufam_admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
    END IF;
    
    new_status := CASE WHEN is_active THEN 'active' ELSE 'inactive' END;
    
    -- Update school status
    UPDATE public.schools 
    SET 
        status = new_status,
        updated_at = now()
    WHERE id = school_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'School not found');
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'school_id', school_id,
        'new_status', new_status,
        'message', 'School status updated successfully'
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_update_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_school_status TO authenticated;