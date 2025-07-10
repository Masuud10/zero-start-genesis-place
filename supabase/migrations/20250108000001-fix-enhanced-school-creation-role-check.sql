-- Fix the create_enhanced_school function to allow both edufam_admin and elimisha_admin roles
CREATE OR REPLACE FUNCTION public.create_enhanced_school(
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  registration_number text DEFAULT NULL::text,
  school_type text DEFAULT 'primary'::text,
  term_structure text DEFAULT '3-term'::text,
  year_established integer DEFAULT NULL::integer,
  max_students integer DEFAULT 1000,
  timezone text DEFAULT 'Africa/Nairobi'::text,
  logo_url text DEFAULT NULL::text,
  website_url text DEFAULT NULL::text,
  motto text DEFAULT NULL::text,
  slogan text DEFAULT NULL::text,
  owner_name text DEFAULT NULL::text,
  owner_email text DEFAULT NULL::text,
  owner_phone text DEFAULT NULL::text,
  owner_information text DEFAULT NULL::text,
  mpesa_enabled boolean DEFAULT false,
  mpesa_paybill_number text DEFAULT NULL::text,
  mpesa_business_name text DEFAULT NULL::text,
  mpesa_callback_url text DEFAULT NULL::text,
  mpesa_shortcode text DEFAULT NULL::text,
  mpesa_confirmation_key text DEFAULT NULL::text
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
  -- Check if current user is edufam_admin or elimisha_admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF current_user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only EduFam Admin or Elimisha Admin can create schools');
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

  -- Check if registration number already exists (if provided)
  IF registration_number IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.schools s WHERE s.registration_number = create_enhanced_school.registration_number
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school with enhanced data
  INSERT INTO public.schools (
    name, email, phone, address, 
    school_type, term_structure,
    registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, max_students, timezone,
    status, subscription_plan,
    created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address,
    school_type, term_structure,
    create_enhanced_school.registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, max_students, timezone,
    'active', 'basic',
    now(), now()
  ) RETURNING id INTO new_school_id;

  -- Create school owner if details provided
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_owner', 
      new_school_id
    ) INTO create_user_result;

    IF create_user_result->>'success' = 'true' THEN
      owner_user_id := (create_user_result->>'user_id')::uuid;
      
      -- Update school with owner_id
      UPDATE public.schools 
      SET owner_id = owner_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  -- Create finance settings with MPESA credentials if enabled
  IF mpesa_enabled AND (mpesa_paybill_number IS NOT NULL OR mpesa_business_name IS NOT NULL) THEN
    INSERT INTO public.finance_settings (
      school_id,
      mpesa_paybill_number,
      mpesa_business_name,
      mpesa_callback_url,
      mpesa_shortcode,
      mpesa_confirmation_key,
      late_fee_percentage,
      late_fee_grace_days,
      tax_rate,
      settings_data
    ) VALUES (
      new_school_id,
      mpesa_paybill_number,
      mpesa_business_name,
      mpesa_callback_url,
      mpesa_shortcode,
      mpesa_confirmation_key,
      0,
      7,
      0,
      jsonb_build_object(
        'currency', 'KES',
        'payment_methods', ARRAY['cash', 'mpesa'],
        'auto_generate_receipts', true,
        'send_payment_notifications', true,
        'allow_partial_payments', true,
        'require_payment_approval', false,
        'mpesa_enabled', mpesa_enabled
      )
    );
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