-- Fix Dashboard Performance - Add Missing Indexes
-- This migration addresses the slow dashboard queries causing timeouts

-- 1. Add composite index for the fees query that's causing timeout
-- The query: SELECT amount, paid_amount, status FROM fees WHERE school_id = '...' LIMIT 1000;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_school_id_amount_paid_status 
ON public.fees(school_id, amount, paid_amount, status) 
WHERE school_id IS NOT NULL;

-- 2. Add partial index for active students count query
-- The query: SELECT COUNT(*) FROM students WHERE school_id = '...' AND is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_id_active_count 
ON public.students(school_id) 
WHERE is_active = true;

-- 3. Add index for student_fees table which is also queried
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_fees_school_id_status 
ON public.student_fees(school_id, status) 
WHERE school_id IS NOT NULL;

-- 4. Add index for financial transactions (used in some finance queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_transactions_school_id_payment_method 
ON public.financial_transactions(school_id, payment_method) 
WHERE school_id IS NOT NULL;

-- 5. Add index for profiles table (used in dashboard stats)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_school_id_role_active 
ON public.profiles(school_id, role) 
WHERE status = 'active';

-- 6. Add index for classes table (used in dashboard stats)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classes_school_id_active 
ON public.classes(school_id) 
WHERE is_active = true;

-- 7. Add index for subjects table (used in dashboard stats)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subjects_school_id_active 
ON public.subjects(school_id) 
WHERE is_active = true;

-- 8. Add index for attendance table (used in some dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_school_id_date 
ON public.attendance(school_id, date) 
WHERE school_id IS NOT NULL;

-- 9. Add index for grades table (used in dashboard analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_school_id_status_created 
ON public.grades(school_id, status, created_at DESC) 
WHERE school_id IS NOT NULL;

-- 10. Add index for parent_students table (used in parent dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parent_students_parent_id_school 
ON public.parent_students(parent_id, school_id) 
WHERE parent_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_fees_school_id_amount_paid_status IS 'Optimizes dashboard fees query with school_id filter';
COMMENT ON INDEX idx_students_school_id_active_count IS 'Optimizes active students count query for dashboard';
COMMENT ON INDEX idx_student_fees_school_id_status IS 'Optimizes student fees queries by school and status';
COMMENT ON INDEX idx_financial_transactions_school_id_payment_method IS 'Optimizes financial transaction queries by school and payment method';
COMMENT ON INDEX idx_profiles_school_id_role_active IS 'Optimizes active user queries by school and role';
COMMENT ON INDEX idx_classes_school_id_active IS 'Optimizes active classes queries by school';
COMMENT ON INDEX idx_subjects_school_id_active IS 'Optimizes active subjects queries by school';
COMMENT ON INDEX idx_attendance_school_id_date IS 'Optimizes attendance queries by school and date';
COMMENT ON INDEX idx_grades_school_id_status_created IS 'Optimizes grades queries by school, status and creation date';
COMMENT ON INDEX idx_parent_students_parent_id_school IS 'Optimizes parent-student relationship queries';

-- Update table statistics to help query planner
ANALYZE public.fees;
ANALYZE public.students;
ANALYZE public.student_fees;
ANALYZE public.financial_transactions;
ANALYZE public.profiles;
ANALYZE public.classes;
ANALYZE public.subjects;
ANALYZE public.attendance;
ANALYZE public.grades;
ANALYZE public.parent_students;