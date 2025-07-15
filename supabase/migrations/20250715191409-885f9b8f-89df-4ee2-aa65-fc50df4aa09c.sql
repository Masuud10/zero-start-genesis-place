-- Update the create_user_login_details function to handle HR role properly
CREATE OR REPLACE FUNCTION public.create_user_login_details()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Determine access level based on role
  DECLARE
    user_access_level integer := 1;
  BEGIN
    CASE 
      WHEN NEW.role = 'elimisha_admin' OR NEW.role = 'edufam_admin' THEN
        user_access_level := 5;
      WHEN NEW.role = 'school_owner' THEN
        user_access_level := 4;
      WHEN NEW.role = 'principal' THEN
        user_access_level := 3;
      WHEN NEW.role = 'teacher' OR NEW.role = 'hr' THEN
        user_access_level := 2;
      ELSE
        user_access_level := 1;
    END CASE;

    -- Insert login details
    INSERT INTO public.user_login_details (
      user_id, 
      role, 
      access_level,
      employee_id,
      department
    )
    VALUES (
      NEW.id,
      NEW.role,
      user_access_level,
      CASE 
        WHEN NEW.role != 'parent' THEN 'EMP' || EXTRACT(EPOCH FROM now())::TEXT
        ELSE NULL
      END,
      CASE 
        WHEN NEW.role = 'teacher' THEN 'Academic'
        WHEN NEW.role = 'principal' THEN 'Administration'
        WHEN NEW.role = 'school_owner' THEN 'Management'
        WHEN NEW.role = 'finance_officer' THEN 'Finance'
        WHEN NEW.role = 'hr' THEN 'Human Resources'
        ELSE NULL
      END
    );
    
    RETURN NEW;
  END;
END;
$function$;