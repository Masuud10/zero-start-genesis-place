-- Database Integrity Audit Fixes
-- This migration addresses critical security, performance, and data integrity issues

-- ============================================================================
-- 1. SECURITY FIXES: Remove SECURITY DEFINER from functions that don't need it
-- ============================================================================

-- Fix analytics functions to use SECURITY INVOKER instead of SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_school_analytics(p_school_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result JSONB;
  student_count INTEGER;
  teacher_count INTEGER;
  class_count INTEGER;
  total_fees DECIMAL(10,2);
  collected_fees DECIMAL(10,2);
  attendance_rate DECIMAL(5,2);
  avg_grade DECIMAL(5,2);
  current_user_school_id UUID;
BEGIN
  -- Get current user's school for security check
  SELECT public.get_current_user_school_id() INTO current_user_school_id;
  
  -- Security check: Only allow access to own school or admin access
  IF current_user_school_id != p_school_id AND 
     public.get_current_user_role() NOT IN ('elimisha_admin', 'edufam_admin') THEN
    RAISE EXCEPTION 'Access denied: You can only view analytics for your own school';
  END IF;

  -- Get basic counts
  SELECT COUNT(*) INTO student_count
  FROM public.students 
  WHERE school_id = p_school_id AND is_active = true;
  
  SELECT COUNT(*) INTO teacher_count
  FROM public.profiles 
  WHERE school_id = p_school_id AND role = 'teacher';
  
  SELECT COUNT(*) INTO class_count
  FROM public.classes 
  WHERE school_id = p_school_id;
  
  -- Get fee statistics
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(paid_amount), 0)
  INTO total_fees, collected_fees
  FROM public.fees 
  WHERE school_id = p_school_id;
  
  -- Get attendance rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*))
      ELSE 0 
    END
  INTO attendance_rate
  FROM public.attendance 
  WHERE school_id = p_school_id;
  
  -- Get average grade
  SELECT COALESCE(AVG(score), 0)
  INTO avg_grade
  FROM public.grades g
  JOIN public.students s ON g.student_id = s.id
  WHERE s.school_id = p_school_id;
  
  -- Build result
  result := jsonb_build_object(
    'school_id', p_school_id,
    'student_count', student_count,
    'teacher_count', teacher_count,
    'class_count', class_count,
    'total_fees', total_fees,
    'collected_fees', collected_fees,
    'outstanding_fees', total_fees - collected_fees,
    'collection_rate', CASE WHEN total_fees > 0 THEN (collected_fees * 100.0 / total_fees) ELSE 0 END,
    'attendance_rate', attendance_rate,
    'average_grade', avg_grade,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- Fix system analytics function
CREATE OR REPLACE FUNCTION public.get_system_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result JSONB;
  total_schools INTEGER;
  total_students INTEGER;
  total_teachers INTEGER;
  total_classes INTEGER;
  total_fees DECIMAL(10,2);
  total_collected DECIMAL(10,2);
  active_schools INTEGER;
  inactive_schools INTEGER;
  current_user_role TEXT;
BEGIN
  -- Security check: Only admin users can access system analytics
  current_user_role := public.get_current_user_role();
  IF current_user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    RAISE EXCEPTION 'Access denied: Only admin users can access system analytics';
  END IF;

  -- Get system-wide counts
  SELECT COUNT(*) INTO total_schools FROM public.schools;
  SELECT COUNT(*) INTO active_schools FROM public.schools WHERE status = 'active';
  SELECT COUNT(*) INTO inactive_schools FROM public.schools WHERE status = 'inactive';
  
  SELECT COUNT(*) INTO total_students 
  FROM public.students WHERE is_active = true;
  
  SELECT COUNT(*) INTO total_teachers 
  FROM public.profiles WHERE role = 'teacher';
  
  SELECT COUNT(*) INTO total_classes FROM public.classes;
  
  -- Get fee statistics
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(paid_amount), 0)
  INTO total_fees, total_collected
  FROM public.fees;
  
  -- Build result
  result := jsonb_build_object(
    'total_schools', total_schools,
    'active_schools', active_schools,
    'inactive_schools', inactive_schools,
    'total_students', total_students,
    'total_teachers', total_teachers,
    'total_classes', total_classes,
    'total_fees', total_fees,
    'total_collected', total_collected,
    'total_outstanding', total_fees - total_collected,
    'system_collection_rate', CASE WHEN total_fees > 0 THEN (total_collected * 100.0 / total_fees) ELSE 0 END,
    'average_students_per_school', CASE WHEN total_schools > 0 THEN (total_students * 1.0 / total_schools) ELSE 0 END,
    'average_classes_per_school', CASE WHEN total_schools > 0 THEN (total_classes * 1.0 / total_schools) ELSE 0 END,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- ============================================================================
-- 2. DATA INTEGRITY FIXES: Add NOT NULL constraints to critical columns
-- ============================================================================

-- Add NOT NULL constraint to profiles.role (critical security column)
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL;

-- Add NOT NULL constraint to profiles.email (critical for authentication)
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL;

-- Add NOT NULL constraint to students.name
ALTER TABLE public.students 
ALTER COLUMN name SET NOT NULL;

-- Add NOT NULL constraint to classes.name
ALTER TABLE public.classes 
ALTER COLUMN name SET NOT NULL;

-- Add NOT NULL constraint to subjects.name
ALTER TABLE public.subjects 
ALTER COLUMN name SET NOT NULL;

-- Add NOT NULL constraint to schools.name
ALTER TABLE public.schools 
ALTER COLUMN name SET NOT NULL;

-- Add NOT NULL constraint to grades.student_id
ALTER TABLE public.grades 
ALTER COLUMN student_id SET NOT NULL;

-- Add NOT NULL constraint to grades.subject_id
ALTER TABLE public.grades 
ALTER COLUMN subject_id SET NOT NULL;

-- Add NOT NULL constraint to attendance.student_id
ALTER TABLE public.attendance 
ALTER COLUMN student_id SET NOT NULL;

-- Add NOT NULL constraint to attendance.date
ALTER TABLE public.attendance 
ALTER COLUMN date SET NOT NULL;

-- ============================================================================
-- 3. PERFORMANCE FIXES: Add missing indexes for common query patterns
-- ============================================================================

-- Add index for grades by term and exam_type (common filtering)
CREATE INDEX IF NOT EXISTS idx_grades_term_exam_type ON public.grades(term, exam_type);

-- Add index for grades by submitted_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_grades_submitted_at ON public.grades(submitted_at DESC);

-- Add index for attendance by date range queries
CREATE INDEX IF NOT EXISTS idx_attendance_date_range ON public.attendance(date DESC);

-- Add index for fees by due_date (for overdue queries)
CREATE INDEX IF NOT EXISTS idx_fees_due_date_status ON public.fees(due_date, status);

-- Add index for parent_students by both parent and student (for bidirectional lookups)
CREATE INDEX IF NOT EXISTS idx_parent_students_bidirectional ON public.parent_students(parent_id, student_id);

-- Add index for subject_teacher_assignments by teacher and subject
CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_teacher_subject ON public.subject_teacher_assignments(teacher_id, subject_id);

-- Add index for academic terms by school and order
CREATE INDEX IF NOT EXISTS idx_academic_terms_school_order ON public.academic_terms(school_id, term_order);

-- Add index for academic years by school and status
CREATE INDEX IF NOT EXISTS idx_academic_years_school_status ON public.academic_years(school_id, status);

-- ============================================================================
-- 4. LOGICAL FIXES: Add check constraints to prevent invalid data
-- ============================================================================

-- Add check constraint to ensure grades.score is between 0 and max_score
ALTER TABLE public.grades 
ADD CONSTRAINT check_grade_score_range 
CHECK (score >= 0 AND score <= max_score);

-- Add check constraint to ensure grades.percentage is between 0 and 100
ALTER TABLE public.grades 
ADD CONSTRAINT check_grade_percentage_range 
CHECK (percentage >= 0 AND percentage <= 100);

-- Add check constraint to ensure fees.paid_amount doesn't exceed amount
ALTER TABLE public.fees 
ADD CONSTRAINT check_fees_paid_amount 
CHECK (paid_amount <= amount);

-- Add check constraint to ensure attendance.status is valid
ALTER TABLE public.attendance 
ADD CONSTRAINT check_attendance_status 
CHECK (status IN ('present', 'absent', 'late', 'excused'));

-- Add check constraint to ensure profiles.status is valid
ALTER TABLE public.profiles 
ADD CONSTRAINT check_profiles_status 
CHECK (status IN ('active', 'inactive', 'suspended'));

-- Add check constraint to ensure schools.status is valid
ALTER TABLE public.schools 
ADD CONSTRAINT check_schools_status 
CHECK (status IN ('active', 'inactive', 'pending'));

-- ============================================================================
-- 5. FOREIGN KEY FIXES: Ensure referential integrity
-- ============================================================================

-- Add foreign key constraint for grades.class_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_grades_class_id' 
    AND table_name = 'grades'
  ) THEN
    ALTER TABLE public.grades 
    ADD CONSTRAINT fk_grades_class_id 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for grades.term_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_grades_term_id' 
    AND table_name = 'grades'
  ) THEN
    ALTER TABLE public.grades 
    ADD CONSTRAINT fk_grades_term_id 
    FOREIGN KEY (term_id) REFERENCES public.academic_terms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for grades.academic_year_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_grades_academic_year_id' 
    AND table_name = 'grades'
  ) THEN
    ALTER TABLE public.grades 
    ADD CONSTRAINT fk_grades_academic_year_id 
    FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 6. FUNCTION FIXES: Fix ambiguous column references
-- ============================================================================

-- Fix function with ambiguous column references
CREATE OR REPLACE FUNCTION public.get_class_analytics(p_class_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result JSONB;
  student_count INTEGER;
  avg_grade DECIMAL(5,2);
  attendance_rate DECIMAL(5,2);
  total_fees DECIMAL(10,2);
  collected_fees DECIMAL(10,2);
  class_name TEXT;
  school_name TEXT;
  current_user_school_id UUID;
BEGIN
  -- Get current user's school for security check
  SELECT public.get_current_user_school_id() INTO current_user_school_id;
  
  -- Get class and school info
  SELECT 
    c.name,
    s.name
  INTO class_name, school_name
  FROM public.classes c
  JOIN public.schools s ON c.school_id = s.id
  WHERE c.id = p_class_id;
  
  -- Security check: Only allow access to own school or admin access
  IF current_user_school_id != (SELECT school_id FROM public.classes WHERE id = p_class_id) AND 
     public.get_current_user_role() NOT IN ('elimisha_admin', 'edufam_admin') THEN
    RAISE EXCEPTION 'Access denied: You can only view analytics for your own school';
  END IF;
  
  -- Get student count
  SELECT COUNT(*) INTO student_count
  FROM public.students 
  WHERE class_id = p_class_id AND is_active = true;
  
  -- Get average grade (fixed ambiguous column reference)
  SELECT COALESCE(AVG(g.score), 0)
  INTO avg_grade
  FROM public.grades g
  JOIN public.students s ON g.student_id = s.id
  WHERE s.class_id = p_class_id;
  
  -- Get attendance rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*))
      ELSE 0 
    END
  INTO attendance_rate
  FROM public.attendance 
  WHERE class_id = p_class_id;
  
  -- Get fee statistics
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(paid_amount), 0)
  INTO total_fees, collected_fees
  FROM public.fees 
  WHERE class_id = p_class_id;
  
  -- Build result
  result := jsonb_build_object(
    'class_id', p_class_id,
    'class_name', class_name,
    'school_name', school_name,
    'student_count', student_count,
    'average_grade', avg_grade,
    'attendance_rate', attendance_rate,
    'total_fees', total_fees,
    'collected_fees', collected_fees,
    'outstanding_fees', total_fees - collected_fees,
    'collection_rate', CASE WHEN total_fees > 0 THEN (collected_fees * 100.0 / total_fees) ELSE 0 END,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- ============================================================================
-- 7. VIEW FIXES: Ensure all views use SECURITY INVOKER
-- ============================================================================

-- Set all views to use SECURITY INVOKER for proper RLS enforcement
ALTER VIEW public.comprehensive_report_data SET (security_invoker = true);
ALTER VIEW public.school_attendance_summary SET (security_invoker = true);
ALTER VIEW public.school_finance_summary SET (security_invoker = true);
ALTER VIEW public.school_grades_summary SET (security_invoker = true);

-- ============================================================================
-- 8. COMMENTS: Add documentation for the fixes
-- ============================================================================

COMMENT ON INDEX idx_grades_term_exam_type IS 'Optimizes grade queries filtered by term and exam type';
COMMENT ON INDEX idx_grades_submitted_at IS 'Optimizes grade queries sorted by submission date';
COMMENT ON INDEX idx_attendance_date_range IS 'Optimizes attendance queries by date range';
COMMENT ON INDEX idx_fees_due_date_status IS 'Optimizes fee queries for overdue payments';
COMMENT ON INDEX idx_parent_students_bidirectional IS 'Optimizes parent-student relationship queries';
COMMENT ON INDEX idx_subject_teacher_assignments_teacher_subject IS 'Optimizes teacher-subject assignment queries';

COMMENT ON CONSTRAINT check_grade_score_range ON public.grades IS 'Ensures grade scores are within valid range';
COMMENT ON CONSTRAINT check_grade_percentage_range ON public.grades IS 'Ensures grade percentages are between 0-100';
COMMENT ON CONSTRAINT check_fees_paid_amount ON public.fees IS 'Ensures paid amount never exceeds total amount';
COMMENT ON CONSTRAINT check_attendance_status ON public.attendance IS 'Ensures attendance status is valid';
COMMENT ON CONSTRAINT check_profiles_status ON public.profiles IS 'Ensures user status is valid';
COMMENT ON CONSTRAINT check_schools_status ON public.schools IS 'Ensures school status is valid'; 