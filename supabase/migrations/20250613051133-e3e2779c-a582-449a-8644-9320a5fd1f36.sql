
-- Fixed version of the create_school function with proper JSONB handling
CREATE OR REPLACE FUNCTION public.create_school(
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  owner_email text DEFAULT NULL,
  owner_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_school_id uuid;
  current_user_role text;
  owner_user_id uuid;
  create_user_result jsonb;
BEGIN
  -- Check if current user is elimisha_admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF current_user_role != 'elimisha_admin' THEN
    RETURN jsonb_build_object('error', 'Only Elimisha Admin can create schools');
  END IF;

  -- Check if school name already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('error', 'School with this name already exists');
  END IF;

  -- Create the school
  INSERT INTO public.schools (name, email, phone, address, created_at, updated_at)
  VALUES (school_name, school_email, school_phone, school_address, now(), now())
  RETURNING id INTO new_school_id;

  -- If owner details provided, create owner account
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    -- Create school owner user
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_owner', 
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
    owner_user_id := (create_user_result->>'user_id')::uuid;

    -- Update school with owner_id if user creation was successful
    IF create_user_result->>'success' = 'true' THEN
      UPDATE public.schools 
      SET owner_id = owner_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'school_id', new_school_id,
    'owner_id', owner_user_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_school error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to create school: ' || SQLERRM);
END;
$function$;

-- Add trigger to automatically set school_id for new records
CREATE OR REPLACE FUNCTION public.auto_set_school_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    IF TG_TABLE_NAME IN ('students', 'classes', 'subjects', 'announcements', 'messages', 'support_tickets', 'timetables') THEN
      -- Set school_id if not already set
      IF NEW.school_id IS NULL THEN
        NEW.school_id := user_school_id;
      -- Prevent users from setting school_id to other schools
      ELSIF NEW.school_id != user_school_id THEN
        RAISE EXCEPTION 'Cannot create records for other schools';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS auto_set_school_id_trigger ON public.students;
DROP TRIGGER IF EXISTS auto_set_school_id_trigger ON public.classes;
DROP TRIGGER IF EXISTS auto_set_school_id_trigger ON public.subjects;
DROP TRIGGER IF EXISTS auto_set_school_id_trigger ON public.announcements;
DROP TRIGGER IF EXISTS auto_set_school_id_trigger ON public.messages;
DROP TRIGGER IF EXISTS auto_set_school_id_trigger ON public.support_tickets;
DROP TRIGGER IF EXISTS auto_set_school_id_trigger ON public.timetables;

-- Apply auto_set_school_id trigger to relevant tables
CREATE TRIGGER auto_set_school_id_students_trigger
  BEFORE INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_classes_trigger
  BEFORE INSERT ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_subjects_trigger
  BEFORE INSERT ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_announcements_trigger
  BEFORE INSERT ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_messages_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_support_tickets_trigger
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_timetables_trigger
  BEFORE INSERT ON public.timetables
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();
