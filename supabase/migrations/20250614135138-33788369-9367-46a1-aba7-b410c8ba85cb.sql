
-- First, let's ensure all tables have proper foreign key constraints for multi-tenancy
-- Add missing foreign key constraints that might be missing

-- Ensure profiles table has proper foreign key to schools
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS fk_profiles_school_id;

ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- Ensure students table has proper foreign keys
ALTER TABLE public.students 
DROP CONSTRAINT IF EXISTS fk_students_school_id,
DROP CONSTRAINT IF EXISTS fk_students_class_id,
DROP CONSTRAINT IF EXISTS fk_students_parent_id;

ALTER TABLE public.students 
ADD CONSTRAINT fk_students_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_students_class_id 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_students_parent_id 
FOREIGN KEY (parent_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure classes table has proper foreign keys
ALTER TABLE public.classes 
DROP CONSTRAINT IF EXISTS fk_classes_school_id,
DROP CONSTRAINT IF EXISTS fk_classes_teacher_id;

ALTER TABLE public.classes 
ADD CONSTRAINT fk_classes_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_classes_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure subjects table has proper foreign keys
ALTER TABLE public.subjects 
DROP CONSTRAINT IF EXISTS fk_subjects_school_id,
DROP CONSTRAINT IF EXISTS fk_subjects_class_id,
DROP CONSTRAINT IF EXISTS fk_subjects_teacher_id;

ALTER TABLE public.subjects 
ADD CONSTRAINT fk_subjects_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_subjects_class_id 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_subjects_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure grades table has proper foreign keys
ALTER TABLE public.grades 
DROP CONSTRAINT IF EXISTS fk_grades_student_id,
DROP CONSTRAINT IF EXISTS fk_grades_subject_id,
DROP CONSTRAINT IF EXISTS fk_grades_class_id,
DROP CONSTRAINT IF EXISTS fk_grades_submitted_by,
DROP CONSTRAINT IF EXISTS fk_grades_reviewed_by;

ALTER TABLE public.grades 
ADD CONSTRAINT fk_grades_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_grades_subject_id 
FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_grades_class_id 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_grades_submitted_by 
FOREIGN KEY (submitted_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_grades_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure attendance table has proper foreign keys
ALTER TABLE public.attendance 
DROP CONSTRAINT IF EXISTS fk_attendance_student_id,
DROP CONSTRAINT IF EXISTS fk_attendance_class_id,
DROP CONSTRAINT IF EXISTS fk_attendance_submitted_by;

ALTER TABLE public.attendance 
ADD CONSTRAINT fk_attendance_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_attendance_class_id 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_attendance_submitted_by 
FOREIGN KEY (submitted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure fees table has proper foreign keys
ALTER TABLE public.fees 
DROP CONSTRAINT IF EXISTS fk_fees_student_id;

ALTER TABLE public.fees 
ADD CONSTRAINT fk_fees_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- Update RLS policies to ensure complete school isolation
DROP POLICY IF EXISTS "Multi-tenant profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant students access" ON public.students;
DROP POLICY IF EXISTS "Multi-tenant classes access" ON public.classes;
DROP POLICY IF EXISTS "Multi-tenant subjects access" ON public.subjects;
DROP POLICY IF EXISTS "Multi-tenant grades access" ON public.grades;
DROP POLICY IF EXISTS "Multi-tenant attendance access" ON public.attendance;
DROP POLICY IF EXISTS "Multi-tenant fees access" ON public.fees;
DROP POLICY IF EXISTS "Schools access policy" ON public.schools;

-- Create comprehensive RLS policies for complete multi-tenancy
CREATE POLICY "Multi-tenant profiles access" ON public.profiles
FOR ALL USING (
  -- Users can access their own profile
  auth.uid() = id OR 
  -- Users can access profiles in their school (if they have a school)
  (school_id IS NOT NULL AND school_id = public.get_current_user_school_id()) OR
  -- System admins can access all profiles
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Multi-tenant students access" ON public.students
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Multi-tenant classes access" ON public.classes
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Multi-tenant subjects access" ON public.subjects
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Multi-tenant grades access" ON public.grades
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Multi-tenant attendance access" ON public.attendance
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Multi-tenant fees access" ON public.fees
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Schools access policy" ON public.schools
FOR ALL USING (
  -- System admins can access all schools
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School users can only access their own school
  id = public.get_current_user_school_id()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Clear any existing dummy data (only if it exists)
-- This will cascade to related tables due to foreign key constraints
DELETE FROM public.schools WHERE name LIKE '%Demo%' OR name LIKE '%Test%' OR name LIKE '%Sample%';
DELETE FROM public.profiles WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%sample%';

-- Update the create_admin_user function to ensure proper school linking
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email text, 
  user_password text, 
  user_name text, 
  user_role text DEFAULT 'parent'::text, 
  user_school_id uuid DEFAULT NULL::uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_user_id uuid;
  current_user_role text;
  current_user_school_id uuid;
BEGIN
  -- Get current user's role and school for permission checking
  SELECT role, school_id INTO current_user_role, current_user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Validate role
  IF user_role NOT IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('error', 'Invalid role specified');
  END IF;

  -- Check if current user has permission to create users
  IF current_user_role NOT IN ('elimisha_admin', 'edufam_admin', 'school_owner', 'principal') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions to create users');
  END IF;

  -- Enforce multi-tenant restrictions
  IF current_user_role IN ('school_owner', 'principal') THEN
    -- School-level admins can only create users in their own school
    IF user_school_id IS NULL OR user_school_id != current_user_school_id THEN
      user_school_id := current_user_school_id;
    END IF;
    
    -- School-level admins cannot create system admins
    IF user_role IN ('elimisha_admin', 'edufam_admin') THEN
      RETURN jsonb_build_object('error', 'Cannot create system admin users');
    END IF;
  ELSIF current_user_role IN ('elimisha_admin', 'edufam_admin') THEN
    -- System admins can create users for any school
    -- But school_id is required for non-admin roles
    IF user_role NOT IN ('elimisha_admin', 'edufam_admin') AND user_school_id IS NULL THEN
      RETURN jsonb_build_object('error', 'School assignment required for this role');
    END IF;
  END IF;

  -- Verify school exists if school_id is provided
  IF user_school_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.schools WHERE id = user_school_id) THEN
      RETURN jsonb_build_object('error', 'Invalid school ID specified');
    END IF;
  END IF;

  -- Check if user already exists
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'User with this email already exists');
  END IF;

  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();

  -- Insert into auth.users (bypass normal signup flow)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    role,
    aud
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'name', user_name, 
      'role', user_role, 
      'school_id', user_school_id,
      'created_by_admin', true
    ),
    'authenticated',
    'authenticated'
  );

  -- Insert into profiles with proper school linking
  INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
  VALUES (new_user_id, user_email, user_name, user_role, user_school_id, now(), now());

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'school_id', user_school_id,
    'message', 'User created successfully and linked to school'
  );

EXCEPTION WHEN OTHERS THEN
  -- Log the actual error for debugging
  RAISE LOG 'create_admin_user error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to create user: ' || SQLERRM);
END;
$function$;
