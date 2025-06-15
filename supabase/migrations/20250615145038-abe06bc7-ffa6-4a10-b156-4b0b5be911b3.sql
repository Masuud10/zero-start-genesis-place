
-- Drop existing policies to prevent conflicts, then create new ones.

-- =================================================================
-- ATTENDANCE TABLE POLICIES
-- =================================================================
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view attendance based on role" ON public.attendance;
CREATE POLICY "Allow users to view attendance based on role" ON public.attendance
  FOR SELECT
  USING (
    (get_current_user_role() = 'edufam_admin') OR
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')) OR
    (get_current_user_role() = 'parent' AND student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Allow teachers and principals to manage attendance" ON public.attendance;
CREATE POLICY "Allow teachers and principals to manage attendance" ON public.attendance
  FOR ALL
  USING (
    school_id = get_current_user_school_id() AND get_current_user_role() IN ('principal', 'teacher')
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND get_current_user_role() IN ('principal', 'teacher')
  );

-- =================================================================
-- FEES TABLE POLICIES
-- =================================================================
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view fees based on role" ON public.fees;
CREATE POLICY "Allow users to view fees based on role" ON public.fees
  FOR SELECT
  USING (
    (get_current_user_role() = 'edufam_admin') OR
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('principal', 'school_owner', 'finance_officer')) OR
    (get_current_user_role() = 'parent' AND student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Allow finance officers to manage fees" ON public.fees;
CREATE POLICY "Allow finance officers to manage fees" ON public.fees
  FOR ALL
  USING (
    school_id = get_current_user_school_id() AND get_current_user_role() = 'finance_officer'
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND get_current_user_role() = 'finance_officer'
  );

-- =================================================================
-- FINANCIAL TRANSACTIONS TABLE POLICIES
-- =================================================================
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view transactions based on role" ON public.financial_transactions;
CREATE POLICY "Allow users to view transactions based on role" ON public.financial_transactions
  FOR SELECT
  USING (
    (get_current_user_role() = 'edufam_admin') OR
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('principal', 'school_owner', 'finance_officer')) OR
    (get_current_user_role() = 'parent' AND (
      student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()) OR
      fee_id IN (SELECT id FROM public.fees WHERE student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()))
    ))
  );

DROP POLICY IF EXISTS "Allow finance officers to manage transactions" ON public.financial_transactions;
CREATE POLICY "Allow finance officers to manage transactions" ON public.financial_transactions
  FOR ALL
  USING (
    school_id = get_current_user_school_id() AND get_current_user_role() = 'finance_officer'
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND get_current_user_role() = 'finance_officer'
  );

-- =================================================================
-- GRADES TABLE POLICIES
-- =================================================================
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view grades based on role" ON public.grades;
CREATE POLICY "Allow users to view grades based on role" ON public.grades
  FOR SELECT
  USING (
    (get_current_user_role() = 'edufam_admin') OR
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('principal', 'school_owner', 'teacher')) OR
    (get_current_user_role() = 'parent' AND student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Allow teachers to manage grades" ON public.grades;
CREATE POLICY "Allow teachers to manage grades" ON public.grades
  FOR ALL
  USING (
    school_id = get_current_user_school_id() AND get_current_user_role() = 'teacher'
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND get_current_user_role() = 'teacher'
  );

