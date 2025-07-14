-- Fix the ambiguous registration_number column reference in create_enhanced_school function
CREATE OR REPLACE FUNCTION public.create_enhanced_school(
    school_name text,
    school_email text,
    school_phone text,
    school_address text,
    logo_url text DEFAULT NULL::text,
    website_url text DEFAULT NULL::text,
    motto text DEFAULT NULL::text,
    slogan text DEFAULT NULL::text,
    school_type text DEFAULT 'primary'::text,
    registration_number text DEFAULT NULL::text,
    year_established integer DEFAULT NULL::integer,
    term_structure text DEFAULT '3-term'::text,
    owner_information text DEFAULT NULL::text,
    owner_email text DEFAULT NULL::text,
    owner_name text DEFAULT NULL::text,
    owner_phone text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_school_id uuid;
  current_user_role text;
  owner_user_id uuid;
  create_user_result jsonb;
BEGIN
  -- Check if current user is edufam_admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF current_user_role != 'edufam_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only EduFam Admin can create schools');
  END IF;

  -- Validate required fields
  IF school_name IS NULL OR school_email IS NULL OR school_phone IS NULL OR school_address IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields: name, email, phone, and address');
  END IF;

  -- Check if school name already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this name already exists');
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE email = school_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this email already exists');
  END IF;

  -- Check if registration number already exists (if provided) - FIXED AMBIGUOUS REFERENCE
  IF create_enhanced_school.registration_number IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.schools s WHERE s.registration_number = create_enhanced_school.registration_number
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school WITHOUT curriculum_type column
  INSERT INTO public.schools (
    name, email, phone, address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, status, created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address, logo_url, website_url, motto, slogan,
    school_type, create_enhanced_school.registration_number, year_established, term_structure,
    owner_information, 'active', now(), now()
  ) RETURNING id INTO new_school_id;

  -- If owner details provided, create owner account
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_owner', 
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
    IF create_user_result->>'success' = 'true' THEN
      owner_user_id := (create_user_result->>'user_id')::uuid;
      
      -- Update school with owner_id
      UPDATE public.schools 
      SET owner_id = owner_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  -- Create default academic year for the school
  INSERT INTO public.academic_years (
    school_id,
    year_name,
    start_date,
    end_date,
    is_current,
    status,
    term_structure
  ) VALUES (
    new_school_id,
    EXTRACT(year FROM now())::text,
    (EXTRACT(year FROM now())::text || '-01-01')::date,
    (EXTRACT(year FROM now())::text || '-12-31')::date,
    true,
    'active',
    term_structure
  );

  RETURN jsonb_build_object(
    'success', true,
    'school_id', new_school_id,
    'owner_id', owner_user_id,
    'message', 'School created successfully with complete setup'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_enhanced_school error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create school: ' || SQLERRM);
END;
$function$;