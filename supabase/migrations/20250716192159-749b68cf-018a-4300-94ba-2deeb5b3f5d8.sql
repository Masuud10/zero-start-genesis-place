-- Fix HR users login by setting known passwords
-- This will allow mary@gmail.com and sharon@gmail.com to login

DO $$
DECLARE
    mary_user_id UUID;
    sharon_user_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO mary_user_id FROM auth.users WHERE email = 'mary@gmail.com';
    SELECT id INTO sharon_user_id FROM auth.users WHERE email = 'sharon@gmail.com';
    
    -- Reset passwords for mary@gmail.com and sharon@gmail.com to known values
    IF mary_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET encrypted_password = crypt('HRPassword123!', gen_salt('bf'))
        WHERE id = mary_user_id;
        RAISE NOTICE 'Updated password for mary@gmail.com (ID: %)', mary_user_id;
    END IF;
    
    IF sharon_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET encrypted_password = crypt('HRPassword123!', gen_salt('bf'))
        WHERE id = sharon_user_id;
        RAISE NOTICE 'Updated password for sharon@gmail.com (ID: %)', sharon_user_id;
    END IF;
    
    -- Also ensure their profiles are set up correctly
    UPDATE public.profiles 
    SET status = 'active', updated_at = now()
    WHERE email IN ('mary@gmail.com', 'sharon@gmail.com');
    
    -- Ensure their user_login_details are correct
    UPDATE public.user_login_details 
    SET 
        role = 'hr',
        access_level = 2,
        department = 'Human Resources',
        is_locked = false,
        locked_until = NULL,
        login_attempts = 0,
        updated_at = now()
    WHERE user_id IN (mary_user_id, sharon_user_id);
    
    RAISE NOTICE 'HR users mary@gmail.com and sharon@gmail.com can now login with password: HRPassword123!';
    
END $$;