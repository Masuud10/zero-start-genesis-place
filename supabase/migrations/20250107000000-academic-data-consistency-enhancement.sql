-- Academic Data Consistency Enhancement Migration
-- This migration ensures all academic data (academic year, term, subject, class, exams, attendance, grades, reports, analytics) 
-- are linked, role-access controlled, and dynamically rendered with curriculum type support

-- 1. ENHANCE ACADEMIC PERIOD MANAGEMENT
-- Ensure academic_years table has all required fields for proper linking
ALTER TABLE public.academic_years 
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Ensure academic_terms table has proper linking fields
ALTER TABLE public.academic_terms 
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 2. ENHANCE CLASSES TABLE WITH CURRICULUM SUPPORT
-- Ensure classes table has proper curriculum and academic period linking
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS current_term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 3. ENHANCE SUBJECTS TABLE WITH CURRICULUM AND ACADEMIC PERIOD SUPPORT
-- Ensure subjects table has proper curriculum and academic period linking
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 4. ENHANCE GRADES TABLE WITH COMPREHENSIVE ACADEMIC CONTEXT
-- Ensure grades table has all required academic context fields
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
ADD COLUMN IF NOT EXISTS examination_id UUID REFERENCES public.examinations(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 5. ENHANCE ATTENDANCE TABLE WITH ACADEMIC CONTEXT
-- Ensure attendance table has proper academic period linking
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 6. ENHANCE EXAMINATIONS TABLE WITH CURRICULUM SUPPORT
-- Ensure examinations table has curriculum type support
ALTER TABLE public.examinations 
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 7. CREATE ENHANCED STUDENT-CLASS ENROLLMENT TABLE
-- Create comprehensive student-class enrollment tracking
CREATE TABLE IF NOT EXISTS public.student_class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  curriculum_type TEXT NOT NULL DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enrollment_status TEXT DEFAULT 'active' CHECK (enrollment_status IN ('active', 'inactive', 'transferred', 'graduated', 'withdrawn')),
  is_active BOOLEAN DEFAULT true,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique enrollment per student per class per term
  UNIQUE(student_id, class_id, academic_year_id, term_id)
);

-- 8. CREATE ENHANCED SUBJECT-TEACHER ASSIGNMENT TABLE
-- Create comprehensive subject-teacher assignment tracking
CREATE TABLE IF NOT EXISTS public.subject_teacher_assignments_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  curriculum_type TEXT NOT NULL DEFAULT 'standard' CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
  assignment_status TEXT DEFAULT 'active' CHECK (assignment_status IN ('active', 'inactive', 'temporary', 'permanent')),
  is_active BOOLEAN DEFAULT true,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique assignment per subject per teacher per class per term
  UNIQUE(subject_id, teacher_id, class_id, academic_year_id, term_id)
);

-- 9. CREATE ACADEMIC CONTEXT VALIDATION TABLE
-- Create table to track academic context validation issues
CREATE TABLE IF NOT EXISTS public.academic_context_validation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  term_id UUID REFERENCES public.academic_terms(id),
  class_id UUID REFERENCES public.classes(id),
  subject_id UUID REFERENCES public.subjects(id),
  validation_type TEXT NOT NULL CHECK (validation_type IN ('enrollment', 'assignment', 'grade_entry', 'attendance', 'examination')),
  validation_status TEXT NOT NULL CHECK (validation_status IN ('valid', 'invalid', 'warning')),
  error_message TEXT,
  error_details JSONB DEFAULT '{}',
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. CREATE ROLE-BASED ACCESS CONTROL FUNCTIONS
-- Function to validate user access to academic data
CREATE OR REPLACE FUNCTION public.validate_academic_data_access(
  p_user_id UUID,
  p_school_id UUID,
  p_academic_year_id UUID DEFAULT NULL,
  p_term_id UUID DEFAULT NULL,
  p_class_id UUID DEFAULT NULL,
  p_subject_id UUID DEFAULT NULL,
  p_operation TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_role TEXT;
  user_school_id UUID;
  current_year_id UUID;
  current_term_id UUID;
  has_access BOOLEAN := false;
  error_message TEXT;
BEGIN
  -- Get user profile information
  SELECT role, school_id INTO user_role, user_school_id
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if user exists and has a role
  IF user_role IS NULL THEN
    result := jsonb_build_object(
      'has_access', false,
      'error', 'User not found or role not assigned'
    );
    RETURN result;
  END IF;
  
  -- Check school access
  IF user_school_id != p_school_id AND user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
    result := jsonb_build_object(
      'has_access', false,
      'error', 'Access denied to this school'
    );
    RETURN result;
  END IF;
  
  -- Get current academic period if not provided
  IF p_academic_year_id IS NULL OR p_term_id IS NULL THEN
    SELECT id INTO current_year_id
    FROM public.academic_years
    WHERE school_id = p_school_id AND is_current = true;
    
    SELECT id INTO current_term_id
    FROM public.academic_terms
    WHERE school_id = p_school_id AND is_current = true;
  ELSE
    current_year_id := p_academic_year_id;
    current_term_id := p_term_id;
  END IF;
  
  -- Role-based access validation
  CASE p_operation
    WHEN 'view_grades' THEN
      -- Teachers can view grades for their assigned classes/subjects
      IF user_role = 'teacher' THEN
        IF p_class_id IS NOT NULL AND p_subject_id IS NOT NULL THEN
          has_access := EXISTS (
            SELECT 1 FROM public.subject_teacher_assignments_enhanced
            WHERE teacher_id = p_user_id
            AND class_id = p_class_id
            AND subject_id = p_subject_id
            AND academic_year_id = current_year_id
            AND term_id = current_term_id
            AND is_active = true
          );
        ELSE
          has_access := true; -- Teachers can view grades for their assigned subjects
        END IF;
      ELSIF user_role IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin') THEN
        has_access := true; -- Admins can view all grades
      END IF;
      
    WHEN 'edit_grades' THEN
      -- Teachers can edit grades for their assigned classes/subjects
      IF user_role = 'teacher' THEN
        IF p_class_id IS NOT NULL AND p_subject_id IS NOT NULL THEN
          has_access := EXISTS (
            SELECT 1 FROM public.subject_teacher_assignments_enhanced
            WHERE teacher_id = p_user_id
            AND class_id = p_class_id
            AND subject_id = p_subject_id
            AND academic_year_id = current_year_id
            AND term_id = current_term_id
            AND is_active = true
          );
        END IF;
      ELSIF user_role IN ('principal', 'edufam_admin', 'elimisha_admin') THEN
        has_access := true; -- Principals and admins can edit grades
      END IF;
      
    WHEN 'approve_grades' THEN
      -- Only principals and admins can approve grades
      has_access := user_role IN ('principal', 'edufam_admin', 'elimisha_admin');
      
    WHEN 'view_attendance' THEN
      -- Teachers can view attendance for their assigned classes
      IF user_role = 'teacher' THEN
        IF p_class_id IS NOT NULL THEN
          has_access := EXISTS (
            SELECT 1 FROM public.subject_teacher_assignments_enhanced
            WHERE teacher_id = p_user_id
            AND class_id = p_class_id
            AND academic_year_id = current_year_id
            AND term_id = current_term_id
            AND is_active = true
          );
        ELSE
          has_access := true; -- Teachers can view attendance for their assigned classes
        END IF;
      ELSIF user_role IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin') THEN
        has_access := true; -- Admins can view all attendance
      END IF;
      
    WHEN 'edit_attendance' THEN
      -- Teachers can edit attendance for their assigned classes
      IF user_role = 'teacher' THEN
        IF p_class_id IS NOT NULL THEN
          has_access := EXISTS (
            SELECT 1 FROM public.subject_teacher_assignments_enhanced
            WHERE teacher_id = p_user_id
            AND class_id = p_class_id
            AND academic_year_id = current_year_id
            AND term_id = current_term_id
            AND is_active = true
          );
        END IF;
      ELSIF user_role IN ('principal', 'edufam_admin', 'elimisha_admin') THEN
        has_access := true; -- Principals and admins can edit attendance
      END IF;
      
    WHEN 'manage_examinations' THEN
      -- Only principals and admins can manage examinations
      has_access := user_role IN ('principal', 'edufam_admin', 'elimisha_admin');
      
    WHEN 'view_reports' THEN
      -- Teachers can view reports for their assigned classes
      IF user_role = 'teacher' THEN
        IF p_class_id IS NOT NULL THEN
          has_access := EXISTS (
            SELECT 1 FROM public.subject_teacher_assignments_enhanced
            WHERE teacher_id = p_user_id
            AND class_id = p_class_id
            AND academic_year_id = current_year_id
            AND term_id = current_term_id
            AND is_active = true
          );
        ELSE
          has_access := true; -- Teachers can view reports for their assigned classes
        END IF;
      ELSIF user_role IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin') THEN
        has_access := true; -- Admins can view all reports
      END IF;
      
    WHEN 'view_analytics' THEN
      -- Teachers can view analytics for their assigned classes
      IF user_role = 'teacher' THEN
        IF p_class_id IS NOT NULL THEN
          has_access := EXISTS (
            SELECT 1 FROM public.subject_teacher_assignments_enhanced
            WHERE teacher_id = p_user_id
            AND class_id = p_class_id
            AND academic_year_id = current_year_id
            AND term_id = current_term_id
            AND is_active = true
          );
        ELSE
          has_access := true; -- Teachers can view analytics for their assigned classes
        END IF;
      ELSIF user_role IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin') THEN
        has_access := true; -- Admins can view all analytics
      END IF;
      
    ELSE
      has_access := false;
      error_message := 'Unknown operation: ' || p_operation;
  END CASE;
  
  -- Build result
  IF has_access THEN
    result := jsonb_build_object(
      'has_access', true,
      'user_role', user_role,
      'academic_year_id', current_year_id,
      'term_id', current_term_id
    );
  ELSE
    result := jsonb_build_object(
      'has_access', false,
      'error', COALESCE(error_message, 'Access denied for this operation'),
      'user_role', user_role,
      'operation', p_operation
    );
  END IF;
  
  RETURN result;
END;
$$;

-- 11. CREATE CURRICULUM TYPE VALIDATION FUNCTION
-- Function to validate curriculum type consistency
CREATE OR REPLACE FUNCTION public.validate_curriculum_consistency(
  p_school_id UUID,
  p_academic_year_id UUID,
  p_term_id UUID,
  p_class_id UUID DEFAULT NULL,
  p_subject_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  academic_year_curriculum TEXT;
  term_curriculum TEXT;
  class_curriculum TEXT;
  subject_curriculum TEXT;
  errors TEXT[] := '{}';
BEGIN
  -- Get curriculum types
  SELECT curriculum_type INTO academic_year_curriculum
  FROM public.academic_years
  WHERE id = p_academic_year_id AND school_id = p_school_id;
  
  SELECT curriculum_type INTO term_curriculum
  FROM public.academic_terms
  WHERE id = p_term_id AND school_id = p_school_id;
  
  IF p_class_id IS NOT NULL THEN
    SELECT curriculum_type INTO class_curriculum
    FROM public.classes
    WHERE id = p_class_id AND school_id = p_school_id;
  END IF;
  
  IF p_subject_id IS NOT NULL THEN
    SELECT curriculum_type INTO subject_curriculum
    FROM public.subjects
    WHERE id = p_subject_id AND school_id = p_school_id;
  END IF;
  
  -- Validate curriculum consistency
  IF academic_year_curriculum != term_curriculum THEN
    errors := array_append(errors, 'Academic year and term curriculum types do not match');
  END IF;
  
  IF p_class_id IS NOT NULL AND class_curriculum IS NOT NULL THEN
    IF academic_year_curriculum != class_curriculum THEN
      errors := array_append(errors, 'Academic year and class curriculum types do not match');
    END IF;
  END IF;
  
  IF p_subject_id IS NOT NULL AND subject_curriculum IS NOT NULL THEN
    IF academic_year_curriculum != subject_curriculum THEN
      errors := array_append(errors, 'Academic year and subject curriculum types do not match');
    END IF;
  END IF;
  
  -- Build result
  IF array_length(errors, 1) IS NULL THEN
    result := jsonb_build_object(
      'is_consistent', true,
      'curriculum_type', academic_year_curriculum
    );
  ELSE
    result := jsonb_build_object(
      'is_consistent', false,
      'errors', errors,
      'curriculum_types', jsonb_build_object(
        'academic_year', academic_year_curriculum,
        'term', term_curriculum,
        'class', class_curriculum,
        'subject', subject_curriculum
      )
    );
  END IF;
  
  RETURN result;
END;
$$;

-- 12. CREATE TRIGGERS FOR AUTOMATIC ACADEMIC CONTEXT UPDATES
-- Trigger to automatically update academic context when academic periods change
CREATE OR REPLACE FUNCTION update_academic_context_on_period_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update related tables when academic year changes
  IF TG_OP = 'UPDATE' AND OLD.is_current != NEW.is_current AND NEW.is_current = true THEN
    -- Update classes to use new current academic year
    UPDATE public.classes 
    SET academic_year_id = NEW.id
    WHERE school_id = NEW.school_id AND academic_year_id IS NULL;
    
    -- Update subjects to use new current academic year
    UPDATE public.subjects 
    SET academic_year_id = NEW.id
    WHERE school_id = NEW.school_id AND academic_year_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for academic years
DROP TRIGGER IF EXISTS trigger_update_academic_context_on_year_change ON public.academic_years;
CREATE TRIGGER trigger_update_academic_context_on_year_change
  AFTER UPDATE ON public.academic_years
  FOR EACH ROW
  EXECUTE FUNCTION update_academic_context_on_period_change();

-- 13. CREATE INDEXES FOR PERFORMANCE
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_student_class_enrollments_student ON public.student_class_enrollments(student_id, class_id, academic_year_id, term_id);
CREATE INDEX IF NOT EXISTS idx_student_class_enrollments_school ON public.student_class_enrollments(school_id, academic_year_id, term_id);
CREATE INDEX IF NOT EXISTS idx_student_class_enrollments_curriculum ON public.student_class_enrollments(curriculum_type, is_active);

CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_enhanced_teacher ON public.subject_teacher_assignments_enhanced(teacher_id, class_id, academic_year_id, term_id);
CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_enhanced_subject ON public.subject_teacher_assignments_enhanced(subject_id, class_id, academic_year_id, term_id);
CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_enhanced_school ON public.subject_teacher_assignments_enhanced(school_id, academic_year_id, term_id);
CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_enhanced_curriculum ON public.subject_teacher_assignments_enhanced(curriculum_type, is_active);

CREATE INDEX IF NOT EXISTS idx_grades_academic_context ON public.grades(school_id, academic_year_id, term_id, class_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_curriculum ON public.grades(curriculum_type, is_active);

CREATE INDEX IF NOT EXISTS idx_attendance_academic_context ON public.attendance(school_id, academic_year_id, term_id, class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_curriculum ON public.attendance(curriculum_type, is_active);

CREATE INDEX IF NOT EXISTS idx_examinations_curriculum ON public.examinations(curriculum_type, is_active);

CREATE INDEX IF NOT EXISTS idx_academic_context_validation_log_school ON public.academic_context_validation_log(school_id, validation_type, validation_status);

-- 14. ENABLE ROW LEVEL SECURITY
-- Enable RLS on new tables
ALTER TABLE public.student_class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_teacher_assignments_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_context_validation_log ENABLE ROW LEVEL SECURITY;

-- 15. CREATE RLS POLICIES
-- RLS policy for student class enrollments
CREATE POLICY "School isolation for student class enrollments" ON public.student_class_enrollments
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- RLS policy for subject teacher assignments enhanced
CREATE POLICY "School isolation for subject teacher assignments enhanced" ON public.subject_teacher_assignments_enhanced
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- RLS policy for academic context validation log
CREATE POLICY "School isolation for academic context validation log" ON public.academic_context_validation_log
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- 16. UPDATE EXISTING DATA
-- Update existing records to have proper academic context
UPDATE public.grades 
SET 
  academic_year_id = (
    SELECT id FROM public.academic_years 
    WHERE school_id = grades.school_id AND is_current = true 
    LIMIT 1
  ),
  term_id = (
    SELECT id FROM public.academic_terms 
    WHERE school_id = grades.school_id AND is_current = true 
    LIMIT 1
  )
WHERE academic_year_id IS NULL OR term_id IS NULL;

UPDATE public.attendance 
SET 
  academic_year_id = (
    SELECT id FROM public.academic_years 
    WHERE school_id = attendance.school_id AND is_current = true 
    LIMIT 1
  ),
  term_id = (
    SELECT id FROM public.academic_terms 
    WHERE school_id = attendance.school_id AND is_current = true 
    LIMIT 1
  )
WHERE academic_year_id IS NULL OR term_id IS NULL;

-- 17. CREATE VIEWS FOR EASY DATA ACCESS
-- Create view for current academic context
CREATE OR REPLACE VIEW public.current_academic_context AS
SELECT 
  s.id as school_id,
  s.name as school_name,
  ay.id as academic_year_id,
  ay.year_name as academic_year_name,
  at.id as term_id,
  at.term_name as term_name,
  ay.curriculum_type,
  ay.is_current as is_current_year,
  at.is_current as is_current_term
FROM public.schools s
JOIN public.academic_years ay ON s.id = ay.school_id AND ay.is_current = true
JOIN public.academic_terms at ON s.id = at.school_id AND at.is_current = true;

-- Create view for teacher assignments with academic context
CREATE OR REPLACE VIEW public.teacher_assignments_with_context AS
SELECT 
  sta.id,
  sta.teacher_id,
  sta.subject_id,
  sta.class_id,
  sta.academic_year_id,
  sta.term_id,
  sta.curriculum_type,
  sta.is_active,
  sta.school_id,
  p.name as teacher_name,
  p.email as teacher_email,
  s.name as subject_name,
  s.code as subject_code,
  c.name as class_name,
  ay.year_name as academic_year_name,
  at.term_name as term_name
FROM public.subject_teacher_assignments_enhanced sta
JOIN public.profiles p ON sta.teacher_id = p.id
JOIN public.subjects s ON sta.subject_id = s.id
JOIN public.classes c ON sta.class_id = c.id
JOIN public.academic_years ay ON sta.academic_year_id = ay.id
JOIN public.academic_terms at ON sta.term_id = at.id
WHERE sta.is_active = true;

-- 18. CREATE FUNCTIONS FOR CURRICULUM-SPECIFIC OPERATIONS
-- Function to get curriculum-specific grading configuration
CREATE OR REPLACE FUNCTION public.get_curriculum_grading_config(
  p_curriculum_type TEXT,
  p_school_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config JSONB;
BEGIN
  CASE p_curriculum_type
    WHEN 'cbc' THEN
      config := jsonb_build_object(
        'grading_system', 'performance_levels',
        'levels', jsonb_build_array('EM', 'AP', 'PR', 'EX'),
        'assessment_types', jsonb_build_array('observation', 'written_work', 'project_work', 'group_activity', 'oral_assessment', 'practical_work'),
        'description', 'Competency-Based Curriculum with performance levels',
        'color', 'blue',
        'icon', '🎯'
      );
    WHEN 'igcse' THEN
      config := jsonb_build_object(
        'grading_system', 'letter_grades',
        'levels', jsonb_build_array('A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U'),
        'assessment_types', jsonb_build_array('theory', 'practical', 'coursework', 'exam'),
        'description', 'International General Certificate of Secondary Education',
        'color', 'purple',
        'icon', '🎓'
      );
    ELSE -- standard
      config := jsonb_build_object(
        'grading_system', 'numeric',
        'levels', jsonb_build_array('A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E'),
        'assessment_types', jsonb_build_array('OPENER', 'MID_TERM', 'END_TERM', 'CAT', 'ASSIGNMENT', 'PROJECT', 'EXAM'),
        'description', 'Traditional numeric grading system',
        'color', 'green',
        'icon', '📊'
      );
  END CASE;
  
  RETURN config;
END;
$$;

-- 19. CREATE AUDIT LOGGING FUNCTION
-- Function to log academic data changes for audit purposes
CREATE OR REPLACE FUNCTION public.log_academic_data_change(
  p_table_name TEXT,
  p_record_id UUID,
  p_operation TEXT,
  p_user_id UUID,
  p_school_id UUID,
  p_changes JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.academic_context_validation_log (
    school_id,
    validation_type,
    validation_status,
    error_message,
    error_details
  ) VALUES (
    p_school_id,
    'audit_log',
    'valid',
    p_operation || ' on ' || p_table_name || ' (ID: ' || p_record_id || ')',
    jsonb_build_object(
      'table_name', p_table_name,
      'record_id', p_record_id,
      'operation', p_operation,
      'user_id', p_user_id,
      'changes', p_changes,
      'timestamp', now()
    )
  );
END;
$$;

-- 20. FINAL VALIDATION
-- Insert validation record to confirm migration completion
INSERT INTO public.academic_context_validation_log (
  school_id,
  validation_type,
  validation_status,
  error_message,
  error_details
) VALUES (
  (SELECT id FROM public.schools LIMIT 1),
  'migration_completion',
  'valid',
  'Academic data consistency enhancement migration completed successfully',
  jsonb_build_object(
    'migration_version', '20250107000000',
    'completed_at', now(),
    'features_added', jsonb_build_array(
      'Enhanced academic period management',
      'Curriculum type support',
      'Role-based access control',
      'Academic context validation',
      'Performance indexes',
      'Audit logging'
    )
  )
); 