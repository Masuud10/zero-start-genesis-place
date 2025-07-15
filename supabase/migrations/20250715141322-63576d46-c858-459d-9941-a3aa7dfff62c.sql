-- Phase 1 Critical Fixes: Database Integrity and Performance

-- Fix 1: Update role check constraint to include 'hr' role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin'));

-- Fix 2: Add critical missing indexes for performance
-- Index for frequently queried combinations in grades table
CREATE INDEX IF NOT EXISTS idx_grades_school_term_status 
ON public.grades (school_id, term, status) 
WHERE status IN ('released', 'approved');

-- Index for student performance queries
CREATE INDEX IF NOT EXISTS idx_grades_student_released 
ON public.grades (student_id, created_at DESC) 
WHERE status = 'released';

-- Index for class analytics queries
CREATE INDEX IF NOT EXISTS idx_students_class_active_count 
ON public.students (class_id, is_active) 
WHERE is_active = true;

-- Index for financial transaction analytics
CREATE INDEX IF NOT EXISTS idx_financial_trans_school_month 
ON public.financial_transactions (school_id, EXTRACT(year FROM created_at), EXTRACT(month FROM created_at));

-- Fix 3: Add performance index for profiles queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_role 
ON public.profiles (email, role) 
WHERE status = 'active';

-- Fix 4: Add constraints to ensure data integrity (gradual approach)
-- First, identify and fix any existing NULL values that shouldn't be NULL

-- Update any students without school_id (this should not happen but let's be safe)
UPDATE public.students 
SET school_id = (
    SELECT c.school_id 
    FROM public.classes c 
    WHERE c.id = students.class_id 
    LIMIT 1
) 
WHERE school_id IS NULL AND class_id IS NOT NULL;

-- Update any classes without school_id
UPDATE public.classes 
SET school_id = (
    SELECT p.school_id 
    FROM public.profiles p 
    WHERE p.id = classes.teacher_id 
    AND p.school_id IS NOT NULL 
    LIMIT 1
) 
WHERE school_id IS NULL AND teacher_id IS NOT NULL;

-- Update any subjects without school_id
UPDATE public.subjects 
SET school_id = (
    SELECT c.school_id 
    FROM public.classes c 
    WHERE c.id = subjects.class_id 
    LIMIT 1
) 
WHERE school_id IS NULL AND class_id IS NOT NULL;

-- Add NOT NULL constraints where they are critical
-- Note: We'll do this gradually to avoid breaking existing data

-- Fix 5: Clean up function duplicates - keep only the latest comprehensive school function
DROP FUNCTION IF EXISTS public.create_comprehensive_school(text, text, text, text, text, text, text, text, text, text, integer, text, text, text, text, text, text, text, text);

-- Recreate the comprehensive school function with proper validation
CREATE OR REPLACE FUNCTION public.create_comprehensive_school(
    school_name text, 
    school_email text, 
    school_phone text, 
    school_address text, 
    logo_url text DEFAULT NULL, 
    website_url text DEFAULT NULL, 
    motto text DEFAULT NULL, 
    slogan text DEFAULT NULL, 
    school_type text DEFAULT 'primary', 
    registration_number text DEFAULT NULL, 
    year_established integer DEFAULT NULL, 
    term_structure text DEFAULT '3-term', 
    owner_information text DEFAULT NULL, 
    owner_email text DEFAULT NULL, 
    owner_name text DEFAULT NULL, 
    owner_phone text DEFAULT NULL, 
    principal_name text DEFAULT NULL, 
    principal_contact text DEFAULT NULL, 
    principal_email text DEFAULT NULL, 
    mpesa_paybill_number text DEFAULT NULL, 
    mpesa_consumer_key text DEFAULT NULL, 
    mpesa_consumer_secret text DEFAULT NULL, 
    mpesa_passkey text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  new_school_id uuid;
  current_user_role text;
  owner_user_id uuid;
  principal_user_id uuid;
  create_user_result jsonb;
BEGIN
  -- Validate current user permissions
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

  -- Check for existing school with same name or email
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this name already exists');
  END IF;

  IF EXISTS (SELECT 1 FROM public.schools WHERE email = school_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this email already exists');
  END IF;

  -- Check registration number uniqueness
  IF registration_number IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.schools s WHERE s.registration_number = registration_number
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school
  INSERT INTO public.schools (
    name, email, phone, address, 
    school_type, term_structure,
    registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, status,
    created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address,
    school_type, term_structure,
    registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, 'active',
    now(), now()
  ) RETURNING id INTO new_school_id;

  -- Create school owner if details provided
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!',
      owner_name, 
      'school_owner', 
      new_school_id
    ) INTO create_user_result;

    IF create_user_result->>'success' = 'true' THEN
      owner_user_id := (create_user_result->>'user_id')::uuid;
      UPDATE public.schools SET owner_id = owner_user_id WHERE id = new_school_id;
    END IF;
  END IF;

  -- Create principal if details provided (different from owner)
  IF principal_email IS NOT NULL AND principal_name IS NOT NULL AND 
     (principal_email != owner_email OR owner_email IS NULL) THEN
    SELECT public.create_admin_user(
      principal_email, 
      'TempPassword123!',
      principal_name, 
      'principal', 
      new_school_id
    ) INTO create_user_result;

    IF create_user_result->>'success' = 'true' THEN
      principal_user_id := (create_user_result->>'user_id')::uuid;
    END IF;
  END IF;

  -- Create default academic year
  INSERT INTO public.academic_years (
    school_id, year_name, start_date, end_date,
    is_current, status, term_structure
  ) VALUES (
    new_school_id,
    EXTRACT(year FROM now())::text,
    (EXTRACT(year FROM now())::text || '-01-01')::date,
    (EXTRACT(year FROM now())::text || '-12-31')::date,
    true, 'active', term_structure
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
$$;