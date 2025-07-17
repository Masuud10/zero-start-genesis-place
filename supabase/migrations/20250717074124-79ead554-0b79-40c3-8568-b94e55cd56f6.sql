-- Test HR authentication by checking user status and profile consistency
SELECT 
  u.email,
  u.encrypted_password IS NOT NULL as has_password,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  u.banned_until,
  u.deleted_at,
  p.role,
  p.name,
  p.school_id,
  p.status,
  CASE 
    WHEN u.encrypted_password IS NULL THEN 'No password set'
    WHEN u.email_confirmed_at IS NULL THEN 'Email not confirmed'
    WHEN u.banned_until IS NOT NULL THEN 'User banned'
    WHEN u.deleted_at IS NOT NULL THEN 'User deleted'
    WHEN p.status = 'inactive' THEN 'Profile inactive'
    WHEN p.role IS NULL THEN 'No role assigned'
    WHEN p.school_id IS NULL AND p.role = 'hr' THEN 'No school assignment'
    ELSE 'OK'
  END as status_check
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('hr@edufam.com', 'sharon@gmail.com', 'mary@gmail.com')
ORDER BY u.email;

-- Also check if there are any specific authentication blocks or inconsistencies
SELECT 
  'Profiles with HR role but missing in auth.users' as check_type,
  p.email,
  p.role,
  p.status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'hr' AND u.id IS NULL

UNION ALL

SELECT 
  'Auth users with HR metadata but missing profile' as check_type,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  'N/A' as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE (u.raw_user_meta_data->>'role' = 'hr' OR u.app_metadata->>'role' = 'hr')
  AND p.id IS NULL;