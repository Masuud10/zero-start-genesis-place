
-- First, let's ensure we have proper indexes and constraints for multi-tenancy
-- Add missing foreign key constraints for school_id references

-- Update profiles table to ensure school_id references are proper
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- Update students table 
ALTER TABLE public.students 
ADD CONSTRAINT fk_students_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;

-- Update classes table
ALTER TABLE public.classes 
ADD CONSTRAINT fk_classes_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;

-- Update subjects table
ALTER TABLE public.subjects 
ADD CONSTRAINT fk_subjects_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;

-- Add school_id to missing tables for complete data isolation

-- Add school_id to announcements if not exists (already exists, but ensure it's there)
-- ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- Add school_id to messages for school-level message isolation
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- Add school_id to support_tickets if not exists (already exists)
-- ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- Add school_id to timetables if not exists (already exists)
-- ALTER TABLE public.timetables ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- Create indexes for better performance on school_id columns
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON public.subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_school_id ON public.messages(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON public.announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_school_id ON public.support_tickets(school_id);
CREATE INDEX IF NOT EXISTS idx_timetables_school_id ON public.timetables(school_id);

-- Update RLS policies for multi-tenancy

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "School users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Students school access" ON public.students;
DROP POLICY IF EXISTS "Classes school access" ON public.classes;
DROP POLICY IF EXISTS "Subjects school access" ON public.subjects;
DROP POLICY IF EXISTS "Messages access" ON public.messages;
DROP POLICY IF EXISTS "Announcements school access" ON public.announcements;
DROP POLICY IF EXISTS "Support tickets school access" ON public.support_tickets;
DROP POLICY IF EXISTS "Timetables school access" ON public.timetables;
DROP POLICY IF EXISTS "Timetable slots access" ON public.timetable_slots;

-- Create comprehensive multi-tenant RLS policies

-- Profiles: Users can view their own profile and others in their school
CREATE POLICY "Multi-tenant profiles access" ON public.profiles
FOR ALL USING (
  auth.uid() = id OR 
  (school_id IS NOT NULL AND school_id = public.get_current_user_school_id()) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Students: Only accessible within the same school
CREATE POLICY "Multi-tenant students access" ON public.students
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Classes: Only accessible within the same school
CREATE POLICY "Multi-tenant classes access" ON public.classes
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Subjects: Only accessible within the same school
CREATE POLICY "Multi-tenant subjects access" ON public.subjects
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Messages: School-specific access
CREATE POLICY "Multi-tenant messages access" ON public.messages
FOR ALL USING (
  sender_id = auth.uid() OR 
  receiver_id = auth.uid() OR
  (school_id IS NOT NULL AND school_id = public.get_current_user_school_id()) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Announcements: School-specific or global
CREATE POLICY "Multi-tenant announcements access" ON public.announcements
FOR ALL USING (
  is_global = true OR
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Support tickets: School-specific access
CREATE POLICY "Multi-tenant support tickets access" ON public.support_tickets
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Timetables: School-specific access
CREATE POLICY "Multi-tenant timetables access" ON public.timetables
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Timetable slots: Access through timetables
CREATE POLICY "Multi-tenant timetable slots access" ON public.timetable_slots
FOR ALL USING (
  timetable_id IN (
    SELECT id FROM public.timetables 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Grades: Only accessible for students in the same school
CREATE POLICY "Multi-tenant grades access" ON public.grades
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Attendance: Only accessible for students in the same school
CREATE POLICY "Multi-tenant attendance access" ON public.attendance
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Fees: Only accessible for students in the same school
CREATE POLICY "Multi-tenant fees access" ON public.fees
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- CBC Assessments: Only accessible for students in the same school
CREATE POLICY "Multi-tenant cbc assessments access" ON public.cbc_assessments
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Competency Progress: Only accessible for students in the same school
CREATE POLICY "Multi-tenant competency progress access" ON public.competency_progress
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Learner Portfolios: Only accessible for students in the same school
CREATE POLICY "Multi-tenant learner portfolios access" ON public.learner_portfolios
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Parent Engagements: Only accessible for students in the same school
CREATE POLICY "Multi-tenant parent engagements access" ON public.parent_engagements
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Update the handle_new_user function to properly handle school assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Determine role based on email patterns and metadata
  DECLARE
    user_role text;
    user_school_id uuid;
  BEGIN
    -- Get role and school from metadata first
    user_role := NEW.raw_user_meta_data->>'role';
    user_school_id := (NEW.raw_user_meta_data->>'school_id')::uuid;
    
    -- If no role in metadata, determine from email
    IF user_role IS NULL THEN
      IF NEW.email LIKE '%@elimisha.com' OR NEW.email = 'masuud@gmail.com' THEN
        user_role := 'elimisha_admin';
        user_school_id := NULL; -- Elimisha admins don't belong to specific schools
      ELSIF NEW.email LIKE '%admin%' THEN
        user_role := 'edufam_admin';
        user_school_id := NULL; -- EduFam admins don't belong to specific schools
      ELSIF NEW.email LIKE '%principal%' THEN
        user_role := 'principal';
      ELSIF NEW.email LIKE '%teacher%' THEN
        user_role := 'teacher';
      ELSIF NEW.email LIKE '%owner%' THEN
        user_role := 'school_owner';
      ELSIF NEW.email LIKE '%finance%' THEN
        user_role := 'finance_officer';
      ELSE
        user_role := 'parent'; -- Default role
      END IF;
    END IF;

    -- Insert profile with determined role and school
    INSERT INTO public.profiles (id, email, name, role, school_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      user_role,
      user_school_id
    );
    
    RETURN NEW;
  END;
END;
$function$;

-- Create a function to validate school isolation in triggers
CREATE OR REPLACE FUNCTION public.validate_school_isolation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- For non-admin users, ensure they can only create/modify records in their own school
  IF public.get_current_user_role() NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Check if the record has a school_id field
    IF TG_TABLE_NAME IN ('students', 'classes', 'subjects', 'messages', 'announcements', 'support_tickets', 'timetables') THEN
      -- For INSERT operations
      IF TG_OP = 'INSERT' THEN
        IF NEW.school_id IS DISTINCT FROM public.get_current_user_school_id() THEN
          RAISE EXCEPTION 'Access denied: Cannot create records for other schools';
        END IF;
      END IF;
      
      -- For UPDATE operations
      IF TG_OP = 'UPDATE' THEN
        IF OLD.school_id IS DISTINCT FROM public.get_current_user_school_id() 
           OR NEW.school_id IS DISTINCT FROM public.get_current_user_school_id() THEN
          RAISE EXCEPTION 'Access denied: Cannot modify records for other schools';
        END IF;
      END IF;
    END IF;
  END IF;
  
  -- Return the appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;
