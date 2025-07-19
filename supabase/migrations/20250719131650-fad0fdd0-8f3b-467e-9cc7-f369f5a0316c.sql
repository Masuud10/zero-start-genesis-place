-- Add 'admin' to the profiles role constraint first
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Create new constraint that includes 'admin' role
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'school_director', 'principal', 'teacher', 'parent', 'finance_officer', 
  'edufam_admin', 'elimisha_admin', 'support_hr', 'sales_marketing', 
  'finance', 'software_engineer', 'admin'
));

-- Now update admin user profiles with generic 'admin' role
DO $$
DECLARE
    admin_user_record RECORD;
BEGIN
    -- Loop through all admin users and ensure they have corresponding profiles
    FOR admin_user_record IN 
        SELECT 
            au.user_id,
            au.email, 
            au.name,
            au.role::text as admin_role
        FROM public.admin_users au
        WHERE au.is_active = true
    LOOP
        -- Check if profile exists for this user
        IF EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_user_record.user_id) THEN
            -- Update existing profile with generic admin role
            UPDATE public.profiles 
            SET 
                role = 'admin',
                status = 'active',
                updated_at = now()
            WHERE id = admin_user_record.user_id;
            RAISE NOTICE 'Updated profile for % with generic admin role', admin_user_record.email;
        ELSE
            -- Insert new profile with generic admin role
            INSERT INTO public.profiles (
                id, 
                email, 
                name, 
                role, 
                status, 
                created_at, 
                updated_at
            ) VALUES (
                admin_user_record.user_id,
                admin_user_record.email,
                admin_user_record.name,
                'admin',
                'active',
                now(),
                now()
            );
            RAISE NOTICE 'Created profile for % with generic admin role', admin_user_record.email;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Profile synchronization completed - admin users have generic admin role in profiles, specific roles remain in admin_users table';
END $$;

-- Verify the setup - admin_users has specific roles, profiles has generic admin role
SELECT 
    u.email,
    au.role as admin_specific_role,
    au.is_active as admin_active,
    p.role as profile_generic_role,
    p.status as profile_status
FROM auth.users u
LEFT JOIN public.admin_users au ON u.id = au.user_id  
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('nasra@gmail.com', 'aisha@gmail.com', 'joseph@gmail.com', 'john@gmail.com')
ORDER BY u.email;