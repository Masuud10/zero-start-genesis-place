-- Create user management functions
-- Function to create a school user
CREATE OR REPLACE FUNCTION create_school_user(
    full_name TEXT,
    email TEXT,
    temporary_password TEXT,
    role TEXT,
    school_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    result JSON;
BEGIN
    -- Start transaction
    BEGIN
        -- Create user in auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            email,
            crypt(temporary_password, gen_salt('bf')),
            NOW(),
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"], "school_id": "' || school_id || '", "role": "' || role || '"}',
            '{"name": "' || full_name || '"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO new_user_id;

        -- Insert profile for school user
        INSERT INTO public.profiles (
            id,
            name,
            email,
            role,
            school_id,
            status,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            full_name,
            email,
            role,
            school_id,
            'active',
            NOW(),
            NOW()
        );

        -- Return success result
        result := json_build_object(
            'success', true,
            'user_id', new_user_id,
            'message', 'School user created successfully'
        );

        RETURN result;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction on error
            RAISE EXCEPTION 'Failed to create school user: %', SQLERRM;
    END;
END;
$$;

-- Function to create an admin user
CREATE OR REPLACE FUNCTION create_admin_user(
    full_name TEXT,
    email TEXT,
    temporary_password TEXT,
    role TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    result JSON;
BEGIN
    -- Start transaction
    BEGIN
        -- Create user in auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            email,
            crypt(temporary_password, gen_salt('bf')),
            NOW(),
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"], "role": "' || role || '"}',
            '{"name": "' || full_name || '"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO new_user_id;

        -- Insert profile for admin user (school_id is NULL for internal users)
        INSERT INTO public.profiles (
            id,
            name,
            email,
            role,
            school_id,
            status,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            full_name,
            email,
            role,
            NULL,
            'active',
            NOW(),
            NOW()
        );

        -- Return success result
        result := json_build_object(
            'success', true,
            'user_id', new_user_id,
            'message', 'Admin user created successfully'
        );

        RETURN result;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction on error
            RAISE EXCEPTION 'Failed to create admin user: %', SQLERRM;
    END;
END;
$$;

-- Function to toggle user status
CREATE OR REPLACE FUNCTION toggle_user_status(
    user_id UUID,
    is_active BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    new_status TEXT;
BEGIN
    -- Determine new status
    new_status := CASE WHEN is_active THEN 'active' ELSE 'inactive' END;
    
    -- Update user status in profiles table
    UPDATE public.profiles 
    SET 
        status = new_status,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with ID % not found', user_id;
    END IF;
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'user_id', user_id,
        'new_status', new_status,
        'message', 'User status updated successfully'
    );
    
    RETURN result;
END;
$$;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(
    user_type TEXT DEFAULT 'all' -- 'school', 'admin', or 'all'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_users INTEGER;
    active_users INTEGER;
    inactive_users INTEGER;
BEGIN
    -- Get statistics based on user type
    IF user_type = 'school' THEN
        -- School users only
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'inactive') as inactive
        INTO total_users, active_users, inactive_users
        FROM public.profiles 
        WHERE school_id IS NOT NULL;
    ELSIF user_type = 'admin' THEN
        -- Admin users only
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'inactive') as inactive
        INTO total_users, active_users, inactive_users
        FROM public.profiles 
        WHERE school_id IS NULL;
    ELSE
        -- All users
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'inactive') as inactive
        INTO total_users, active_users, inactive_users
        FROM public.profiles;
    END IF;
    
    -- Return statistics
    result := json_build_object(
        'total_users', total_users,
        'active_users', active_users,
        'inactive_users', inactive_users
    );
    
    RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_school_user TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics TO authenticated; 