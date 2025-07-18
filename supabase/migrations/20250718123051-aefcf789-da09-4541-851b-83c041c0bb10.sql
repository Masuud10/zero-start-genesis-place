-- First, let's check what data we have that's causing the constraint issue
DO $$
DECLARE
    admin_profile RECORD;
    existing_admin_user RECORD;
BEGIN
    -- Loop through all admin users in profiles table and migrate them to admin_users
    FOR admin_profile IN 
        SELECT id, email, name, role 
        FROM public.profiles 
        WHERE role IN ('edufam_admin', 'elimisha_admin', 'super_admin', 'support_hr', 'software_engineer', 'sales_marketing', 'finance')
    LOOP
        -- Check if this user already exists in admin_users table
        SELECT * INTO existing_admin_user 
        FROM public.admin_users 
        WHERE user_id = admin_profile.id;
        
        -- If not in admin_users table, create entry
        IF NOT FOUND THEN
            INSERT INTO public.admin_users (
                user_id,
                email,
                name,
                role,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                admin_profile.id,
                admin_profile.email,
                admin_profile.name,
                -- Map edufam_admin to super_admin, keep others as is
                CASE 
                    WHEN admin_profile.role = 'edufam_admin' THEN 'super_admin'::admin_role
                    ELSE admin_profile.role::admin_role
                END,
                true,
                now(),
                now()
            );
            
            RAISE NOTICE 'Migrated admin user % with role % to admin_users table', admin_profile.email, admin_profile.role;
        ELSE
            RAISE NOTICE 'Admin user % already exists in admin_users table', admin_profile.email;
        END IF;
    END LOOP;
END $$;

-- Instead of deleting admin users from profiles, update their role to a default school role
-- This preserves foreign key constraints while cleaning up the role separation
UPDATE public.profiles 
SET role = 'teacher', updated_at = now()
WHERE role IN ('edufam_admin', 'elimisha_admin', 'super_admin', 'support_hr', 'software_engineer', 'sales_marketing', 'finance');

-- Update the get_current_user_role function to prioritize admin_users over profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  -- First check if user is an admin user, then check profiles
  SELECT COALESCE(
    (SELECT au.role::text FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true),
    (SELECT p.role::text FROM public.profiles p WHERE p.id = auth.uid())
  );
$function$;

-- Create a helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  );
$function$;

-- Update the is_edufam_admin function to check for super_admin in admin_users
CREATE OR REPLACE FUNCTION public.is_edufam_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = is_edufam_admin.user_id AND role = 'super_admin' AND is_active = true
  );
$function$;

-- Update get_current_admin_role to return the admin role
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
$function$;