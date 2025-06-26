
-- Ensure schools table has all necessary fields for comprehensive registration
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_type text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS curriculum_type text DEFAULT 'cbc',
ADD COLUMN IF NOT EXISTS term_structure text DEFAULT '3-term',
ADD COLUMN IF NOT EXISTS owner_information text,
ADD COLUMN IF NOT EXISTS principal_name text,
ADD COLUMN IF NOT EXISTS principal_contact text,
ADD COLUMN IF NOT EXISTS principal_email text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS max_students integer DEFAULT 1000,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Africa/Nairobi';

-- Create or update the enhanced school creation function
CREATE OR REPLACE FUNCTION public.create_comprehensive_school(
  -- Basic Information
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  
  -- School Details  
  school_type text DEFAULT 'primary',
  curriculum_type text DEFAULT 'cbc',
  term_structure text DEFAULT '3-term',
  registration_number text DEFAULT NULL,
  year_established integer DEFAULT NULL,
  
  -- Branding
  logo_url text DEFAULT NULL,
  website_url text DEFAULT NULL,
  motto text DEFAULT NULL,
  slogan text DEFAULT NULL,
  
  -- Owner Information
  owner_name text DEFAULT NULL,
  owner_email text DEFAULT NULL,
  owner_phone text DEFAULT NULL,
  owner_information text DEFAULT NULL,
  
  -- Principal Information
  principal_name text DEFAULT NULL,
  principal_email text DEFAULT NULL,
  principal_contact text DEFAULT NULL,
  
  -- MPESA Configuration
  mpesa_paybill_number text DEFAULT NULL,
  mpesa_consumer_key text DEFAULT NULL,
  mpesa_consumer_secret text DEFAULT NULL,
  mpesa_passkey text DEFAULT NULL
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
  principal_user_id uuid;
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

  -- Check if registration number already exists (if provided)
  IF registration_number IS NOT NULL AND EXISTS (SELECT 1 FROM public.schools WHERE registration_number = registration_number) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school with comprehensive data
  INSERT INTO public.schools (
    name, email, phone, address, 
    school_type, curriculum_type, term_structure,
    registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, principal_name, principal_contact, principal_email,
    status, subscription_plan, max_students, timezone,
    created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address,
    school_type, curriculum_type, term_structure,
    registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, principal_name, principal_contact, principal_email,
    'active', 'basic', 1000, 'Africa/Nairobi',
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

  -- Create principal if details provided (different from owner)
  IF principal_email IS NOT NULL AND principal_name IS NOT NULL AND 
     (principal_email != owner_email OR owner_email IS NULL) THEN
    SELECT public.create_admin_user(
      principal_email, 
      'TempPassword123!', -- Temporary password
      principal_name, 
      'principal', 
      new_school_id
    ) INTO create_user_result;

    IF create_user_result->>'success' = 'true' THEN
      principal_user_id := (create_user_result->>'user_id')::uuid;
      
      -- Update school with principal_id
      UPDATE public.schools 
      SET principal_id = principal_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  -- Create finance settings with MPESA credentials if provided
  IF mpesa_paybill_number IS NOT NULL OR mpesa_consumer_key IS NOT NULL THEN
    INSERT INTO public.finance_settings (
      school_id,
      mpesa_paybill_number,
      mpesa_consumer_key,
      mpesa_consumer_secret,
      mpesa_passkey,
      late_fee_percentage,
      late_fee_grace_days,
      tax_rate,
      settings_data
    ) VALUES (
      new_school_id,
      mpesa_paybill_number,
      mpesa_consumer_key,
      mpesa_consumer_secret,
      mpesa_passkey,
      0,
      7,
      0,
      jsonb_build_object(
        'currency', 'KES',
        'payment_methods', ARRAY['cash', 'mpesa'],
        'auto_generate_receipts', true,
        'send_payment_notifications', true,
        'allow_partial_payments', true,
        'require_payment_approval', false
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
    'principal_id', principal_user_id,
    'message', 'School created successfully with complete setup'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_comprehensive_school error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create school: ' || SQLERRM);
END;
$function$;

-- Ensure RLS policies are properly configured for multi-tenant isolation
-- Update existing RLS policies to be more restrictive

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Schools are viewable by authenticated users" ON public.schools;
DROP POLICY IF EXISTS "Schools can be created by admins" ON public.schools;
DROP POLICY IF EXISTS "Schools can be updated by admins and owners" ON public.schools;

-- Create comprehensive RLS policies for schools
CREATE POLICY "edufam_admins_can_view_all_schools" ON public.schools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

CREATE POLICY "school_users_can_view_their_school" ON public.schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() 
      AND school_id IS NOT NULL
    )
  );

CREATE POLICY "only_edufam_admins_can_create_schools" ON public.schools
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

CREATE POLICY "admins_and_owners_can_update_schools" ON public.schools
  FOR UPDATE USING (
    -- EduFam admins can update any school
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
    OR
    -- School owners/principals can update their own school
    (
      id IN (
        SELECT school_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('school_owner', 'principal')
        AND school_id IS NOT NULL
      )
    )
  );

-- Ensure finance_settings table has proper RLS
ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "finance_settings_school_isolation" ON public.finance_settings;
CREATE POLICY "finance_settings_school_isolation" ON public.finance_settings
  FOR ALL USING (
    -- EduFam admins can access all settings
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
    OR
    -- School users can only access their school's settings
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() 
      AND school_id IS NOT NULL
    )
  );

-- Ensure academic_years table has proper RLS
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "academic_years_school_isolation" ON public.academic_years;
CREATE POLICY "academic_years_school_isolation" ON public.academic_years
  FOR ALL USING (
    -- EduFam admins can access all academic years
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
    OR
    -- School users can only access their school's academic years
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() 
      AND school_id IS NOT NULL
    )
  );
