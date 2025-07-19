-- Insert admin users with specified roles and credentials
-- This will create the admin users in both auth.users and admin_users tables

-- First, let's create a function to safely create admin users
CREATE OR REPLACE FUNCTION public.create_admin_user_safe(
    user_email text,
    user_password text,
    user_name text,
    user_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    new_user_id uuid;
    password_hash text;
    result jsonb;
BEGIN
    -- Generate a new UUID for the user
    new_user_id := gen_random_uuid();
    
    -- Create a simple password hash (in production, use proper hashing)
    password_hash := crypt(user_password, gen_salt('bf'));
    
    -- Insert into auth.users first
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        raw_user_meta_data
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        user_email,
        password_hash,
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        jsonb_build_object('name', user_name, 'role', user_role)
    );
    
    -- Insert into admin_users table
    INSERT INTO public.admin_users (
        user_id,
        email,
        name,
        role,
        app_type,
        is_active,
        permissions,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        user_email,
        user_name,
        user_role::USER-DEFINED,
        'admin',
        true,
        '{"dashboard_access": true, "user_management": true}'::jsonb,
        now(),
        now()
    );
    
    -- Also create profile entry
    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        user_email,
        user_name,
        user_role,
        'active',
        now(),
        now()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', user_email,
        'name', user_name,
        'role', user_role,
        'message', 'Admin user created successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create admin user'
    );
END;
$$;

-- Now create the admin users
SELECT public.create_admin_user_safe('nasra@gmail.com', 'elimisha123', 'Nasra Ahmed', 'support_hr') as support_hr_result;
SELECT public.create_admin_user_safe('aisha@gmail.com', 'elimisha123', 'Aisha Mohamed', 'sales_marketing') as sales_marketing_result;
SELECT public.create_admin_user_safe('joseph@gmail.com', 'elimisha123', 'Joseph Kibira', 'finance') as finance_result;
SELECT public.create_admin_user_safe('john@gmail.com', 'elimisha123', 'John Doe', 'software_engineer') as software_engineer_result;