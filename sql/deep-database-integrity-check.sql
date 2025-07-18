-- Deep Database Integrity Check for admin_users and related tables

-- 1. Orphaned admin_users (user_id not in auth.users)
SELECT * FROM public.admin_users au
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = au.user_id
);

-- 2. Orphaned admin_users (user_id not in profiles)
SELECT * FROM public.admin_users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.user_id
);

-- 3. Duplicate emails in admin_users
SELECT email, COUNT(*) FROM public.admin_users
GROUP BY email HAVING COUNT(*) > 1;

-- 4. Duplicate user_ids in admin_users
SELECT user_id, COUNT(*) FROM public.admin_users
GROUP BY user_id HAVING COUNT(*) > 1;

-- 5. Invalid roles in admin_users (not in enum)
SELECT * FROM public.admin_users
WHERE role::text NOT IN (
  SELECT unnest(enum_range(NULL::admin_role))::text
);

-- 6. Enum values in use but not present in admin_role
SELECT DISTINCT role FROM public.admin_users
WHERE role::text NOT IN (
  SELECT unnest(enum_range(NULL::admin_role))::text
);

-- 7. admin_audit_logs.admin_user_id not in admin_users
SELECT * FROM public.admin_audit_logs aal
WHERE admin_user_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM public.admin_users au WHERE au.user_id = aal.admin_user_id
);

-- 8. List all current enum values for admin_role
SELECT unnest(enum_range(NULL::admin_role)) AS valid_admin_roles;

-- 9. List all roles in use in admin_users
SELECT DISTINCT role FROM public.admin_users; 