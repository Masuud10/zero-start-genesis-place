-- Fix ambiguous column reference in create_comprehensive_school function
CREATE OR REPLACE FUNCTION public.create_comprehensive_school(
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  school_type text DEFAULT 'primary'::text,
  term_structure text DEFAULT '3-term'::text,
  registration_number text DEFAULT NULL::text,
  year_established integer DEFAULT NULL::integer,
  logo_url text DEFAULT NULL::text,
  website_url text DEFAULT NULL::text,
  motto text DEFAULT NULL::text,
  slogan text DEFAULT NULL::text,
  owner_name text DEFAULT NULL::text,
  owner_email text DEFAULT NULL::text,
  owner_phone text DEFAULT NULL::text,
  owner_information text DEFAULT NULL::text,
  principal_name text DEFAULT NULL::text,
  principal_email text DEFAULT NULL::text,
  principal_contact text DEFAULT NULL::text,
  mpesa_paybill_number text DEFAULT NULL::text,
  mpesa_consumer_key text DEFAULT NULL::text,
  mpesa_consumer_secret text DEFAULT NULL::text,
  mpesa_passkey text DEFAULT NULL::text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  school_id uuid;
  owner_id uuid;
  principal_id uuid;
  current_user_role text;
BEGIN
  -- Check user role
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF current_user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions');
  END IF;

  -- Validate required fields
  IF school_name IS NULL OR school_email IS NULL OR school_phone IS NULL OR school_address IS NULL THEN
    RETURN jsonb_build_object('error', 'Missing required fields');
  END IF;

  -- Check for existing school name
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('error', 'School name already exists');
  END IF;

  -- Check for existing school email
  IF EXISTS (SELECT 1 FROM public.schools WHERE email = school_email) THEN
    RETURN jsonb_build_object('error', 'School email already exists');
  END IF;

  -- Check for existing registration number (properly qualified)
  IF registration_number IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.schools s WHERE s.registration_number = create_comprehensive_school.registration_number
  ) THEN
    RETURN jsonb_build_object('error', 'Registration number already exists');
  END IF;

  -- Create school
  INSERT INTO public.schools (
    name, email, phone, address, school_type, term_structure,
    registration_number, year_established, logo_url, website_url,
    motto, slogan, status, subscription_plan
  ) VALUES (
    school_name, school_email, school_phone, school_address,
    school_type, term_structure, registration_number, year_established,
    logo_url, website_url, motto, slogan, 'active', 'basic'
  ) RETURNING id INTO school_id;

  -- Create owner if details provided
  IF owner_name IS NOT NULL AND owner_email IS NOT NULL THEN
    SELECT user_id INTO owner_id
    FROM public.create_admin_user(
      owner_email,
      'TempPassword123!',
      owner_name,
      'school_owner',
      school_id
    );
    
    -- Update school with owner
    UPDATE public.schools 
    SET owner_id = owner_id
    WHERE id = school_id;
  END IF;

  -- Create principal if details provided
  IF principal_name IS NOT NULL AND principal_email IS NOT NULL THEN
    SELECT user_id INTO principal_id
    FROM public.create_admin_user(
      principal_email,
      'TempPassword123!',
      principal_name,
      'principal',
      school_id
    );
    
    -- Update school with principal
    UPDATE public.schools 
    SET principal_name = principal_name,
        principal_contact = principal_contact
    WHERE id = school_id;
  END IF;

  -- Create finance settings if MPESA details provided
  IF mpesa_paybill_number IS NOT NULL AND mpesa_consumer_key IS NOT NULL THEN
    INSERT INTO public.finance_settings (
      school_id, mpesa_enabled, mpesa_paybill_number,
      mpesa_consumer_key, mpesa_consumer_secret, mpesa_passkey
    ) VALUES (
      school_id, true, mpesa_paybill_number,
      mpesa_consumer_key, mpesa_consumer_secret, mpesa_passkey
    );
  END IF;

  -- Create default academic year
  INSERT INTO public.academic_years (
    school_id, year_name, start_date, end_date, is_current
  ) VALUES (
    school_id,
    EXTRACT(YEAR FROM CURRENT_DATE)::text,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'school_id', school_id,
    'owner_id', owner_id,
    'principal_id', principal_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_comprehensive_school error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to create school: ' || SQLERRM);
END;
$$;