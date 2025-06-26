
-- Create the missing auto_set_school_id_for_cbc function
CREATE OR REPLACE FUNCTION public.auto_set_school_id_for_cbc()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_school_id uuid;
  user_role text;
BEGIN
  -- Get current user's school_id and role
  SELECT school_id, role INTO user_school_id, user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  -- For non-admin users, automatically set school_id
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Set school_id if not already set
    IF NEW.school_id IS NULL THEN
      NEW.school_id := user_school_id;
    -- Prevent users from setting school_id to other schools
    ELSIF NEW.school_id != user_school_id THEN
      RAISE EXCEPTION 'Cannot create CBC records for other schools';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
