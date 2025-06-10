
-- Add the new elimisha_admin role to the existing check constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin'));

-- Update the handle_new_user function to recognize elimisha admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    CASE 
      WHEN NEW.email LIKE '%@elimisha.com' AND NEW.email NOT LIKE 'admin@elimisha.com' THEN 'elimisha_admin'
      WHEN NEW.email = 'admin@elimisha.com' THEN 'edufam_admin'
      WHEN NEW.email LIKE '%owner%' OR NEW.email LIKE '%principal%' THEN 'school_owner'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
    END
  );
  RETURN NEW;
END;
$function$;
