
-- Drop existing views first to avoid conflicts
DROP VIEW IF EXISTS public.school_grades_summary CASCADE;
DROP VIEW IF EXISTS public.school_attendance_summary CASCADE;
DROP VIEW IF EXISTS public.school_finance_summary CASCADE;

-- Create comprehensive analytics views for Schools Analytics
CREATE OR REPLACE VIEW public.school_grades_summary AS
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

CREATE OR REPLACE VIEW public.school_attendance_summary AS
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

CREATE OR REPLACE VIEW public.school_finance_summary AS
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

-- Enable RLS on the views
ALTER VIEW public.school_grades_summary SET (security_barrier = true);
ALTER VIEW public.school_attendance_summary SET (security_barrier = true);
ALTER VIEW public.school_finance_summary SET (security_barrier = true);

-- Update existing policies to ensure Edufam Admin has proper access
DROP POLICY IF EXISTS "Multi-tenant profiles access" ON public.profiles;
CREATE POLICY "Multi-tenant profiles access" ON public.profiles
FOR ALL USING (
  auth.uid() = id OR 
  (school_id IS NOT NULL AND school_id = public.get_current_user_school_id()) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Ensure schools table has proper RLS for Edufam Admin
DROP POLICY IF EXISTS "Schools access policy" ON public.schools;
CREATE POLICY "Schools access policy" ON public.schools
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  id = public.get_current_user_school_id()
);

-- Grant necessary permissions
GRANT SELECT ON public.school_grades_summary TO authenticated;
GRANT SELECT ON public.school_attendance_summary TO authenticated;
GRANT SELECT ON public.school_finance_summary TO authenticated;
