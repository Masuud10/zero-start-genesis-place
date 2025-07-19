-- Fix admin_update_user_status function
-- Run this directly in Supabase SQL Editor

-- Drop any existing versions to avoid conflicts
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