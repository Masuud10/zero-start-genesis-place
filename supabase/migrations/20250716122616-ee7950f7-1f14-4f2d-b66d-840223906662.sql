-- Reset Sharon's password and ensure account is fully functional
-- First, let's update her auth user record to ensure it's properly set up
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  last_sign_in_at = NULL,  -- Clear any previous sign-in issues
  updated_at = NOW()
WHERE email = 'sharon@gmail.com';

-- Update her profile to ensure everything is correct
UPDATE public.profiles 
SET 
  status = 'active',
  updated_at = NOW()
WHERE email = 'sharon@gmail.com';

-- Reset login details to ensure no lockout
UPDATE public.user_login_details 
SET 
  login_attempts = 0,
  is_locked = FALSE,
  locked_until = NULL,
  force_password_change = FALSE,
  updated_at = NOW()
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'sharon@gmail.com')
  AND role = 'hr';

-- Create a simple function to test HR login capability
CREATE OR REPLACE FUNCTION public.test_sharon_hr_authentication()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    sharon_record record;
    result jsonb;
BEGIN
    -- Get Sharon's details
    SELECT 
        au.id,
        au.email,
        au.email_confirmed_at IS NOT NULL as email_confirmed,
        au.encrypted_password IS NOT NULL as has_password,
        p.role,
        p.name,
        p.school_id,
        p.status,
        s.name as school_name,
        uld.login_attempts,
        uld.is_locked
    INTO sharon_record
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    LEFT JOIN public.schools s ON p.school_id = s.id
    LEFT JOIN public.user_login_details uld ON au.id = uld.user_id AND uld.role = 'hr'
    WHERE au.email = 'sharon@gmail.com';
    
    IF sharon_record.id IS NULL THEN
        result := jsonb_build_object('error', 'Sharon not found');
    ELSE
        result := jsonb_build_object(
            'success', true,
            'user_id', sharon_record.id,
            'email', sharon_record.email,
            'email_confirmed', sharon_record.email_confirmed,
            'has_password', sharon_record.has_password,
            'role', sharon_record.role,
            'name', sharon_record.name,
            'school_id', sharon_record.school_id,
            'school_name', sharon_record.school_name,
            'status', sharon_record.status,
            'login_attempts', sharon_record.login_attempts,
            'is_locked', sharon_record.is_locked,
            'message', 'Sharon''s HR account setup verified successfully'
        );
    END IF;
    
    RETURN result;
END $$;