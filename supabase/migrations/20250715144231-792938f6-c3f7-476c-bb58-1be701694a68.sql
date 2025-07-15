-- PHASE 1: CRITICAL PARENT DASHBOARD SECURITY FIXES
-- =======================================================

-- 1. CREATE PARENT AUTHORIZATION FUNCTIONS (Security)
-- ===================================================

CREATE OR REPLACE FUNCTION public.is_parent_authorized_for_student(p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_students 
    WHERE parent_id = auth.uid() 
    AND student_id = p_student_id
  ) OR 
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin');
$$;

COMMENT ON FUNCTION public.is_parent_authorized_for_student(uuid) IS 
'Security function to verify parent access to specific student data';

-- 2. ADD MISSING PERFORMANCE INDEXES FOR PARENT QUERIES
-- ====================================================

-- Parent-student relationship optimization
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_student_composite 
ON public.parent_students(parent_id, student_id, school_id, is_primary_contact) 
WHERE parent_id IS NOT NULL;

-- Grades table optimization for parent queries
CREATE INDEX IF NOT EXISTS idx_grades_parent_access 
ON public.grades(student_id, status, created_at DESC) 
WHERE status = 'released';

-- Attendance optimization for parent access
CREATE INDEX IF NOT EXISTS idx_attendance_parent_access 
ON public.attendance(student_id, date DESC, status) 
WHERE student_id IS NOT NULL;

-- Fees optimization for parent access  
CREATE INDEX IF NOT EXISTS idx_fees_parent_access 
ON public.fees(student_id, status, due_date DESC) 
WHERE student_id IS NOT NULL;

-- 3. CONSOLIDATE AND SECURE RLS POLICIES FOR PARENTS
-- =================================================

-- GRADES TABLE: Remove conflicting policies and create comprehensive parent policy
DROP POLICY IF EXISTS "Allow users to view grades based on role" ON public.grades;
DROP POLICY IF EXISTS "Teachers can manage grades for their assigned subjects" ON public.grades;

-- Create comprehensive grades access policy
CREATE POLICY "Comprehensive grades access with parent support" ON public.grades
FOR ALL USING (
  -- Admin access
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School-based access for staff
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')) OR
  -- SECURE parent access to their children's released grades ONLY
  (public.get_current_user_role() = 'parent' AND status = 'released' AND public.is_parent_authorized_for_student(student_id))
)
WITH CHECK (
  -- Admin can modify anything
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School staff can modify in their school only
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer'))
  -- Parents CANNOT modify grades (read-only access)
);

-- ATTENDANCE TABLE: Enhance parent access security
DROP POLICY IF EXISTS "Allow users to view attendance based on role" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance for their classes" ON public.attendance;

CREATE POLICY "Comprehensive attendance access with parent support" ON public.attendance
FOR ALL USING (
  -- Admin access
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School-based access for staff
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')) OR
  -- SECURE parent access to their children's attendance ONLY
  (public.get_current_user_role() = 'parent' AND public.is_parent_authorized_for_student(student_id))
)
WITH CHECK (
  -- Admin can modify anything
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School staff can modify in their school only
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer'))
  -- Parents CANNOT modify attendance (read-only access)
);

-- FEES TABLE: Enhance parent access security (already has some parent policies, but consolidating)
DROP POLICY IF EXISTS "Allow users to view fees based on role" ON public.fees;

CREATE POLICY "Comprehensive fees access with parent support" ON public.fees
FOR ALL USING (
  -- Admin access
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School-based access for staff
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'finance_officer')) OR
  -- SECURE parent access to their children's fees ONLY
  (public.get_current_user_role() = 'parent' AND public.is_parent_authorized_for_student(student_id))
)
WITH CHECK (
  -- Admin can modify anything
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School staff can modify in their school only
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'finance_officer'))
  -- Parents CANNOT modify fees (read-only access)
);

-- STUDENTS TABLE: Enhance parent access security
DROP POLICY IF EXISTS "Students multi-tenant access" ON public.students;

CREATE POLICY "Comprehensive students access with parent support" ON public.students
FOR ALL USING (
  -- Admin access
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School-based access for staff
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')) OR
  -- SECURE parent access to their children ONLY (both direct and junction table)
  (public.get_current_user_role() = 'parent' AND (parent_id = auth.uid() OR public.is_parent_authorized_for_student(id)))
)
WITH CHECK (
  -- Admin can modify anything
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School staff can modify in their school only
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer'))
  -- Parents CANNOT modify student records
);

-- 4. ADD SECURITY AUDIT LOGGING FOR PARENT ACCESS
-- ===============================================

CREATE OR REPLACE FUNCTION public.log_parent_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log parent access attempts for security monitoring
  IF public.get_current_user_role() = 'parent' THEN
    PERFORM public.log_security_event(
      'parent_data_access',
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      true,
      NULL,
      jsonb_build_object(
        'operation', TG_OP,
        'table', TG_TABLE_NAME,
        'student_id', COALESCE(NEW.student_id, OLD.student_id),
        'access_time', now()
      )
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit triggers to parent-accessible tables
DROP TRIGGER IF EXISTS parent_access_audit_grades ON public.grades;
CREATE TRIGGER parent_access_audit_grades
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.log_parent_access();

DROP TRIGGER IF EXISTS parent_access_audit_attendance ON public.attendance;
CREATE TRIGGER parent_access_audit_attendance
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.log_parent_access();

DROP TRIGGER IF EXISTS parent_access_audit_fees ON public.fees;
CREATE TRIGGER parent_access_audit_fees
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.fees
  FOR EACH ROW EXECUTE FUNCTION public.log_parent_access();

-- Add comments for documentation
COMMENT ON POLICY "Comprehensive grades access with parent support" ON public.grades IS 
'Allows parents to view ONLY released grades for their children, staff to access grades in their school, and admins full access';

COMMENT ON POLICY "Comprehensive attendance access with parent support" ON public.attendance IS 
'Allows parents to view attendance for their children only, staff to manage attendance in their school, and admins full access';

COMMENT ON POLICY "Comprehensive fees access with parent support" ON public.fees IS 
'Allows parents to view fees for their children only, staff to manage fees in their school, and admins full access';

COMMENT ON POLICY "Comprehensive students access with parent support" ON public.students IS 
'Allows parents to view their children only, staff to manage students in their school, and admins full access';