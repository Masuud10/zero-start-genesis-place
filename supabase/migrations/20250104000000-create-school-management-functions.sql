-- Create school management functions
-- Function to create a school and its owner
CREATE OR REPLACE FUNCTION create_school_and_owner(
    school_name TEXT,
    school_motto TEXT DEFAULT NULL,
    school_slogan TEXT DEFAULT NULL,
    school_email TEXT,
    school_phone TEXT,
    school_address TEXT,
    school_logo_url TEXT DEFAULT NULL,
    school_type TEXT DEFAULT 'Primary',
    term_structure TEXT DEFAULT 'Two Semesters',
    director_name TEXT DEFAULT NULL,
    director_contact TEXT DEFAULT NULL,
    mpesa_paybill TEXT DEFAULT NULL,
    mpesa_consumer_key TEXT DEFAULT NULL,
    mpesa_consumer_secret TEXT DEFAULT NULL,
    owner_full_name TEXT,
    owner_email TEXT,
    owner_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_school_id UUID;
    new_user_id UUID;
    result JSON;
BEGIN
    -- Start transaction
    BEGIN
        -- Insert school details
        INSERT INTO public.schools (
            name,
            motto,
            slogan,
            email,
            phone,
            address,
            logo_url,
            school_type,
            term_structure,
            director_name,
            director_contact,
            mpesa_paybill,
            mpesa_consumer_key,
            mpesa_consumer_secret,
            status,
            created_at,
            updated_at
        ) VALUES (
            school_name,
            school_motto,
            school_slogan,
            school_email,
            school_phone,
            school_address,
            school_logo_url,
            school_type,
            term_structure,
            director_name,
            director_contact,
            mpesa_paybill,
            mpesa_consumer_key,
            mpesa_consumer_secret,
            'active',
            NOW(),
            NOW()
        ) RETURNING id INTO new_school_id;

        -- Create school owner user in auth.users
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
            owner_email,
            crypt('temporary_password_123', gen_salt('bf')),
            NOW(),
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"], "school_id": "' || new_school_id || '", "role": "school_owner"}',
            '{"name": "' || owner_full_name || '", "phone": "' || COALESCE(owner_phone, '') || '"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO new_user_id;

        -- Insert profile for school owner
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
            owner_full_name,
            owner_email,
            'school_owner',
            new_school_id,
            'active',
            NOW(),
            NOW()
        );

        -- Return success result
        result := json_build_object(
            'success', true,
            'school_id', new_school_id,
            'owner_id', new_user_id,
            'message', 'School and owner created successfully'
        );

        RETURN result;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction on error
            RAISE EXCEPTION 'Failed to create school and owner: %', SQLERRM;
    END;
END;
$$;

-- Function to toggle school status
CREATE OR REPLACE FUNCTION toggle_school_status(
    school_id UUID,
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
    
    -- Update school status
    UPDATE public.schools 
    SET 
        status = new_status,
        updated_at = NOW()
    WHERE id = school_id;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'School with ID % not found', school_id;
    END IF;
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'school_id', school_id,
        'new_status', new_status,
        'message', 'School status updated successfully'
    );
    
    RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_school_and_owner TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_school_status TO authenticated; 