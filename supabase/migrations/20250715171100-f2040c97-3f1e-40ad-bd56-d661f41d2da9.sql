-- Phase 1: Fix Critical "Access Denied" Error for School Owners
-- Update RLS policies to allow school owners to access their own school's data

-- First, let's create a helper function to check if current user owns a school
CREATE OR REPLACE FUNCTION public.get_current_user_owned_school_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT id FROM public.schools WHERE owner_id = auth.uid() LIMIT 1;
$$;

-- Update RLS policies for school owners on key analytics tables

-- Students table - allow school owners to see students from their school
DROP POLICY IF EXISTS "School owners can view their school students" ON public.students;
CREATE POLICY "School owners can view their school students" ON public.students
  FOR SELECT
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (school_id = get_current_user_school_id()) OR
    (school_id = get_current_user_owned_school_id())
  );

-- Classes table - allow school owners to see classes from their school  
DROP POLICY IF EXISTS "School owners can view their school classes" ON public.classes;
CREATE POLICY "School owners can view their school classes" ON public.classes
  FOR SELECT 
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (school_id = get_current_user_school_id()) OR
    (school_id = get_current_user_owned_school_id())
  );

-- Attendance table - allow school owners to see attendance from their school
DROP POLICY IF EXISTS "School owners can view their school attendance" ON public.attendance;
CREATE POLICY "School owners can view their school attendance" ON public.attendance
  FOR SELECT
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (school_id = get_current_user_school_id()) OR
    (school_id = get_current_user_owned_school_id())
  );

-- Grades table - allow school owners to see grades from their school
DROP POLICY IF EXISTS "School owners can view their school grades" ON public.grades;
CREATE POLICY "School owners can view their school grades" ON public.grades
  FOR SELECT
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = grades.student_id 
      AND (s.school_id = get_current_user_school_id() OR s.school_id = get_current_user_owned_school_id())
    ))
  );

-- Fees table - allow school owners to see fees from their school
DROP POLICY IF EXISTS "School owners can view their school fees" ON public.fees;
CREATE POLICY "School owners can view their school fees" ON public.fees
  FOR SELECT
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (school_id = get_current_user_school_id()) OR
    (school_id = get_current_user_owned_school_id())
  );

-- School expenses - allow school owners to see expenses from their school
DROP POLICY IF EXISTS "School owners can view their school expenses" ON public.school_expenses;
CREATE POLICY "School owners can view their school expenses" ON public.school_expenses
  FOR SELECT
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (school_id = get_current_user_school_id()) OR
    (school_id = get_current_user_owned_school_id())
  );

-- School analytics tables - allow school owners to see analytics from their school
DROP POLICY IF EXISTS "School owners can view their school analytics" ON public.school_analytics;
CREATE POLICY "School owners can view their school analytics" ON public.school_analytics
  FOR SELECT
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (school_id = get_current_user_school_id()) OR
    (school_id = get_current_user_owned_school_id())
  );

DROP POLICY IF EXISTS "School owners can view their class analytics" ON public.class_analytics;
CREATE POLICY "School owners can view their class analytics" ON public.class_analytics
  FOR SELECT
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (school_id = get_current_user_school_id()) OR
    (school_id = get_current_user_owned_school_id())
  );

DROP POLICY IF EXISTS "School owners can view their student analytics" ON public.student_analytics;
CREATE POLICY "School owners can view their student analytics" ON public.student_analytics
  FOR SELECT
  USING (
    (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) OR
    (school_id = get_current_user_school_id()) OR
    (school_id = get_current_user_owned_school_id())
  );