-- Drop curriculum_type column from schools table
-- This removes the curriculum_type column completely from the schools table

-- First, drop any constraints related to curriculum_type
ALTER TABLE public.schools 
DROP CONSTRAINT IF EXISTS schools_curriculum_type_check;

-- Drop the column
ALTER TABLE public.schools 
DROP COLUMN IF EXISTS curriculum_type;

-- Drop the index if it exists
DROP INDEX IF EXISTS idx_schools_curriculum_type;

-- Update the create_comprehensive_school function to remove curriculum_type parameter
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
  principal_name text DEFAULT NULL::text,
  principal_email text DEFAULT NULL::text,
  principal_phone text DEFAULT NULL::text,
  mpesa_passkey text DEFAULT NULL::text
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

  -- Check if school name already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this name already exists');
  END IF;

  -- Check if registration number already exists (if provided)
  IF registration_number IS NOT NULL AND EXISTS (SELECT 1 FROM public.schools WHERE registration_number = registration_number) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school without curriculum_type
  INSERT INTO public.schools (
    name, email, phone, address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_name, now(), now()
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

  -- If principal details provided, create principal account
  IF principal_email IS NOT NULL AND principal_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      principal_email, 
      'TempPassword123!', -- Temporary password
      principal_name, 
      'principal', 
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
    IF create_user_result->>'success' = 'true' THEN
      principal_user_id := (create_user_result->>'user_id')::uuid;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'school_id', new_school_id,
    'owner_id', owner_user_id,
    'principal_id', principal_user_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_comprehensive_school error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create school: ' || SQLERRM);
END;
$function$; 