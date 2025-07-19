-- Fix the profiles table entries for admin users
-- Update existing profiles or insert missing ones for admin users

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
            -- Update existing profile
            UPDATE public.profiles 
            SET 
                role = admin_user_record.admin_role,
                status = 'active',
                updated_at = now()
            WHERE id = admin_user_record.user_id;
            RAISE NOTICE 'Updated profile for %: %', admin_user_record.email, admin_user_record.admin_role;
        ELSE
            -- Insert new profile
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
                admin_user_record.admin_role,
                'active',
                now(),
                now()
            );
            RAISE NOTICE 'Created profile for %: %', admin_user_record.email, admin_user_record.admin_role;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Profile synchronization completed for all admin users';
END $$;

-- Verify the profiles are now correctly set up
SELECT 
    u.email,
    au.role as admin_role,
    au.is_active,
    p.role as profile_role,
    p.status as profile_status
FROM auth.users u
LEFT JOIN public.admin_users au ON u.id = au.user_id  
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('nasra@gmail.com', 'aisha@gmail.com', 'joseph@gmail.com', 'john@gmail.com')
ORDER BY u.email;