
-- Drop existing views with SECURITY DEFINER issues
DROP VIEW IF EXISTS public.school_grades_summary CASCADE;
DROP VIEW IF EXISTS public.school_attendance_summary CASCADE;
DROP VIEW IF EXISTS public.school_finance_summary CASCADE;

-- Recreate school_grades_summary WITHOUT SECURITY DEFINER
CREATE VIEW public.school_grades_summary AS
SELECT 
  s.id as school_id,
  s.name as school_name,
  COUNT(g.id) as grades_count,
  COALESCE(AVG(g.score), 0) as average_grade,
  COALESCE(AVG(g.percentage), 0) as average_percentage
FROM public.schools s
LEFT JOIN public.students st ON st.school_id = s.id
LEFT JOIN public.grades g ON g.student_id = st.id AND g.score IS NOT NULL
GROUP BY s.id, s.name;

-- Recreate school_attendance_summary WITHOUT SECURITY DEFINER
CREATE VIEW public.school_attendance_summary AS
SELECT 
  s.id as school_id,
  s.name as school_name,
  COUNT(a.id) as attendance_count,
  COALESCE(
    (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0) / 
    NULLIF(COUNT(a.id), 0), 
    0
  ) as attendance_rate
FROM public.schools s
LEFT JOIN public.students st ON st.school_id = s.id
LEFT JOIN public.attendance a ON a.student_id = st.id
GROUP BY s.id, s.name;

-- Recreate school_finance_summary WITHOUT SECURITY DEFINER
CREATE VIEW public.school_finance_summary AS
SELECT 
  s.id as school_id,
  s.name as school_name,
  COALESCE(SUM(ft.amount), 0) as total_collected,
  COUNT(ft.id) as transactions_count,
  COALESCE(SUM(f.amount - COALESCE(f.paid_amount, 0)), 0) as outstanding_fees
FROM public.schools s
LEFT JOIN public.students st ON st.school_id = s.id
LEFT JOIN public.financial_transactions ft ON ft.school_id = s.id AND ft.transaction_type = 'payment'
LEFT JOIN public.fees f ON f.student_id = st.id
GROUP BY s.id, s.name;

-- Ensure RLS is enabled on all base tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Create/Update RLS policies for multi-tenant access

-- Schools policy (edufam_admin can see all, others only their school)
DROP POLICY IF EXISTS "Multi-tenant schools access" ON public.schools;
CREATE POLICY "Multi-tenant schools access" ON public.schools
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  id = public.get_current_user_school_id()
);

-- Students policy
DROP POLICY IF EXISTS "Multi-tenant students access" ON public.students;
CREATE POLICY "Multi-tenant students access" ON public.students
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

-- Grades policy
DROP POLICY IF EXISTS "Multi-tenant grades access" ON public.grades;
CREATE POLICY "Multi-tenant grades access" ON public.grades
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

-- Attendance policy
DROP POLICY IF EXISTS "Multi-tenant attendance access" ON public.attendance;
CREATE POLICY "Multi-tenant attendance access" ON public.attendance
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

-- Financial transactions policy
DROP POLICY IF EXISTS "Multi-tenant financial_transactions access" ON public.financial_transactions;
CREATE POLICY "Multi-tenant financial_transactions access" ON public.financial_transactions
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

-- Fees policy
DROP POLICY IF EXISTS "Multi-tenant fees access" ON public.fees;
CREATE POLICY "Multi-tenant fees access" ON public.fees
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

-- Grant necessary permissions to authenticated users
GRANT SELECT ON public.school_grades_summary TO authenticated;
GRANT SELECT ON public.school_attendance_summary TO authenticated;
GRANT SELECT ON public.school_finance_summary TO authenticated;
