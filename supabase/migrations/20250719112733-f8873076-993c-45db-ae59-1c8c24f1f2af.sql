-- Drop and recreate the admin_update_user_status function with correct return type
DROP FUNCTION IF EXISTS public.admin_update_user_status(uuid, text);

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_update_user_status TO authenticated;