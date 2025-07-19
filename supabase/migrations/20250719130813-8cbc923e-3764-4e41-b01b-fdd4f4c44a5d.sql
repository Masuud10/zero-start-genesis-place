-- Insert admin users directly using proper data types
-- First, let's check what enum type exists for roles and create the users

-- Insert the admin users directly
DO $$
DECLARE
    nasra_id uuid := gen_random_uuid();
    aisha_id uuid := gen_random_uuid();
    joseph_id uuid := gen_random_uuid();
    john_id uuid := gen_random_uuid();
BEGIN
    -- Insert Nasra (Support HR)
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, role, aud, raw_user_meta_data
    ) VALUES (
        nasra_id, '00000000-0000-0000-0000-000000000000', 'nasra@gmail.com',
        crypt('elimisha123', gen_salt('bf')), now(), now(), now(),
        'authenticated', 'authenticated',
        '{"name": "Nasra Ahmed", "role": "support_hr"}'::jsonb
    );
    
    INSERT INTO public.admin_users (
        user_id, email, name, role, app_type, is_active, permissions, created_at, updated_at
    ) VALUES (
        nasra_id, 'nasra@gmail.com', 'Nasra Ahmed', 'support_hr', 'admin', true,
        '{"dashboard_access": true, "user_management": true}'::jsonb, now(), now()
    );
    
    INSERT INTO public.profiles (
        id, email, name, role, status, created_at, updated_at
    ) VALUES (
        nasra_id, 'nasra@gmail.com', 'Nasra Ahmed', 'support_hr', 'active', now(), now()
    );

    -- Insert Aisha (Sales Marketing)
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, role, aud, raw_user_meta_data
    ) VALUES (
        aisha_id, '00000000-0000-0000-0000-000000000000', 'aisha@gmail.com',
        crypt('elimisha123', gen_salt('bf')), now(), now(), now(),
        'authenticated', 'authenticated',
        '{"name": "Aisha Mohamed", "role": "sales_marketing"}'::jsonb
    );
    
    INSERT INTO public.admin_users (
        user_id, email, name, role, app_type, is_active, permissions, created_at, updated_at
    ) VALUES (
        aisha_id, 'aisha@gmail.com', 'Aisha Mohamed', 'sales_marketing', 'admin', true,
        '{"dashboard_access": true, "user_management": true}'::jsonb, now(), now()
    );
    
    INSERT INTO public.profiles (
        id, email, name, role, status, created_at, updated_at
    ) VALUES (
        aisha_id, 'aisha@gmail.com', 'Aisha Mohamed', 'sales_marketing', 'active', now(), now()
    );

    -- Insert Joseph (Finance)
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, role, aud, raw_user_meta_data
    ) VALUES (
        joseph_id, '00000000-0000-0000-0000-000000000000', 'joseph@gmail.com',
        crypt('elimisha123', gen_salt('bf')), now(), now(), now(),
        'authenticated', 'authenticated',
        '{"name": "Joseph Kibira", "role": "finance"}'::jsonb
    );
    
    INSERT INTO public.admin_users (
        user_id, email, name, role, app_type, is_active, permissions, created_at, updated_at
    ) VALUES (
        joseph_id, 'joseph@gmail.com', 'Joseph Kibira', 'finance', 'admin', true,
        '{"dashboard_access": true, "user_management": true}'::jsonb, now(), now()
    );
    
    INSERT INTO public.profiles (
        id, email, name, role, status, created_at, updated_at
    ) VALUES (
        joseph_id, 'joseph@gmail.com', 'Joseph Kibira', 'finance', 'active', now(), now()
    );

    -- Insert John (Software Engineer)
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, role, aud, raw_user_meta_data
    ) VALUES (
        john_id, '00000000-0000-0000-0000-000000000000', 'john@gmail.com',
        crypt('elimisha123', gen_salt('bf')), now(), now(), now(),
        'authenticated', 'authenticated',
        '{"name": "John Doe", "role": "software_engineer"}'::jsonb
    );
    
    INSERT INTO public.admin_users (
        user_id, email, name, role, app_type, is_active, permissions, created_at, updated_at
    ) VALUES (
        john_id, 'john@gmail.com', 'John Doe', 'software_engineer', 'admin', true,
        '{"dashboard_access": true, "user_management": true}'::jsonb, now(), now()
    );
    
    INSERT INTO public.profiles (
        id, email, name, role, status, created_at, updated_at
    ) VALUES (
        john_id, 'john@gmail.com', 'John Doe', 'software_engineer', 'active', now(), now()
    );

    RAISE NOTICE 'Successfully created 4 admin users: Nasra (support_hr), Aisha (sales_marketing), Joseph (finance), John (software_engineer)';
END $$;