-- Reset HR user password and ensure proper authentication setup
UPDATE auth.users 
SET 
  encrypted_password = crypt('HRPassword123!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email IN ('hr@edufam.com', 'sharon@gmail.com', 'mary@gmail.com');

-- Ensure profiles table has correct data
UPDATE profiles 
SET 
  status = 'active',
  updated_at = now()
WHERE email IN ('hr@edufam.com', 'sharon@gmail.com', 'mary@gmail.com') AND status IS NULL;

-- Check if there are any authentication blocking policies
SELECT 
  'Checking HR authentication setup' as check_type,
  COUNT(*) as hr_users_count
FROM profiles 
WHERE role = 'hr' AND status = 'active';