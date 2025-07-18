-- Insert admin users with specified roles and credentials

-- Insert auth users first
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES 
-- Support HR user
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'nasra@gmail.com',
  crypt('elimisha123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Nasra", "role": "support_hr"}',
  'authenticated',
  'authenticated'
),
-- Sales Marketing user  
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'aisha@gmail.com',
  crypt('elimisha123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Aisha", "role": "sales_marketing"}',
  'authenticated',
  'authenticated'
),
-- Finance user
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'joseph@gmail.com',
  crypt('elimisha123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Joseph", "role": "finance"}',
  'authenticated',
  'authenticated'
),
-- Software Engineer user
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'john@gmail.com',
  crypt('elimisha123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "John", "role": "software_engineer"}',
  'authenticated',
  'authenticated'
);

-- Insert corresponding admin_users records
INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'name',
  (au.raw_user_meta_data->>'role')::admin_role,
  'admin',
  true,
  now(),
  now()
FROM auth.users au
WHERE au.email IN ('nasra@gmail.com', 'aisha@gmail.com', 'joseph@gmail.com', 'john@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_users adu WHERE adu.user_id = au.id
  );