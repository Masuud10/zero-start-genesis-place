-- Fix Dashboard Performance - Add Missing Indexes
-- This migration addresses the slow dashboard queries causing timeouts

-- 1. Add composite index for the fees query that's causing timeout
CREATE INDEX IF NOT EXISTS idx_fees_school_id_amount_paid_status 
ON public.fees(school_id, amount, paid_amount, status) 
WHERE school_id IS NOT NULL;

-- 2. Add index for students table (basic school_id index)
CREATE INDEX IF NOT EXISTS idx_students_school_id 
ON public.students(school_id) 
WHERE school_id IS NOT NULL;

-- 3. Add index for student_fees table which is also queried
CREATE INDEX IF NOT EXISTS idx_student_fees_school_id_status 
ON public.student_fees(school_id, status) 
WHERE school_id IS NOT NULL;

-- 4. Add index for financial transactions (used in some finance queries)
CREATE INDEX IF NOT EXISTS idx_financial_transactions_school_id_payment_method 
ON public.financial_transactions(school_id, payment_method) 
WHERE school_id IS NOT NULL;

-- 5. Add index for profiles table (used in dashboard stats)
CREATE INDEX IF NOT EXISTS idx_profiles_school_id_role 
ON public.profiles(school_id, role) 
WHERE school_id IS NOT NULL;

-- 6. Add index for classes table (used in dashboard stats)
CREATE INDEX IF NOT EXISTS idx_classes_school_id 
ON public.classes(school_id) 
WHERE school_id IS NOT NULL;

-- 7. Add index for subjects table (used in dashboard stats)
CREATE INDEX IF NOT EXISTS idx_subjects_school_id 
ON public.subjects(school_id) 
WHERE school_id IS NOT NULL;

-- 8. Add index for attendance table (used in some dashboard queries)
CREATE INDEX IF NOT EXISTS idx_attendance_school_id_date 
ON public.attendance(school_id, date) 
WHERE school_id IS NOT NULL;

-- 9. Add index for grades table (used in dashboard analytics)
CREATE INDEX IF NOT EXISTS idx_grades_school_id_status_created 
ON public.grades(school_id, status, created_at DESC) 
WHERE school_id IS NOT NULL;

-- 10. Add index for parent_students table (used in parent dashboard)
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id_school 
ON public.parent_students(parent_id, school_id) 
WHERE parent_id IS NOT NULL;

-- Update table statistics to help query planner
ANALYZE public.fees;
ANALYZE public.students;
ANALYZE public.profiles;
ANALYZE public.classes;
ANALYZE public.subjects;
ANALYZE public.attendance;
ANALYZE public.grades;