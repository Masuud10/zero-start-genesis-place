-- Check existing users and create only new ones
DO $$
DECLARE
    nasra_id uuid;
    aisha_id uuid;
    joseph_id uuid;
    john_id uuid;
    existing_email text;
BEGIN
    -- Check and create Nasra (Support HR) if doesn't exist
    SELECT email INTO existing_email FROM auth.users WHERE email = 'nasra@gmail.com';
    IF existing_email IS NULL THEN
        nasra_id := gen_random_uuid();
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
        RAISE NOTICE 'Created Nasra Ahmed (support_hr)';
    ELSE
        RAISE NOTICE 'Nasra Ahmed already exists, skipping';
    END IF;

    -- Check and create Aisha (Sales Marketing) if doesn't exist
    SELECT email INTO existing_email FROM auth.users WHERE email = 'aisha@gmail.com';
    IF existing_email IS NULL THEN
        aisha_id := gen_random_uuid();
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
        RAISE NOTICE 'Created Aisha Mohamed (sales_marketing)';
    ELSE
        RAISE NOTICE 'Aisha Mohamed already exists, skipping';
    END IF;

    -- Check and create Joseph (Finance) if doesn't exist
    SELECT email INTO existing_email FROM auth.users WHERE email = 'joseph@gmail.com';
    IF existing_email IS NULL THEN
        joseph_id := gen_random_uuid();
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
        RAISE NOTICE 'Created Joseph Kibira (finance)';
    ELSE
        RAISE NOTICE 'Joseph Kibira already exists, skipping';
    END IF;

    -- Check and create John (Software Engineer) if doesn't exist
    SELECT email INTO existing_email FROM auth.users WHERE email = 'john@gmail.com';
    IF existing_email IS NULL THEN
        john_id := gen_random_uuid();
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
        RAISE NOTICE 'Created John Doe (software_engineer)';
    ELSE
        RAISE NOTICE 'John Doe already exists, skipping';
    END IF;
    
    RAISE NOTICE 'Admin user creation process completed';
END $$;