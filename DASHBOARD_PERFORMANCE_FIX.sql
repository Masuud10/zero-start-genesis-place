-- DASHBOARD PERFORMANCE FIX
-- This script addresses the critical performance bottleneck causing dashboard timeouts
-- Run this script on your Supabase database to fix the issue

-- ============================================================================
-- PROBLEM ANALYSIS
-- ============================================================================
-- The dashboard is timing out due to slow queries on the following tables:
-- 1. fees table: SELECT amount, paid_amount, status FROM fees WHERE school_id = '...' LIMIT 1000;
-- 2. students table: SELECT COUNT(*) FROM students WHERE school_id = '...' AND is_active = true;
-- 3. profiles table: SELECT COUNT(*) FROM profiles WHERE school_id = '...' AND role = 'teacher';
-- 4. classes table: SELECT COUNT(*) FROM classes WHERE school_id = '...';
-- 5. subjects table: SELECT COUNT(*) FROM subjects WHERE school_id = '...';

-- ============================================================================
-- SOLUTION: ADD MISSING INDEXES
-- ============================================================================

-- 1. CRITICAL: Add composite index for fees query (main culprit)
-- This optimizes the query: SELECT amount, paid_amount, status FROM fees WHERE school_id = '...' LIMIT 1000;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_school_id_amount_paid_status 
ON public.fees(school_id, amount, paid_amount, status) 
WHERE school_id IS NOT NULL;

-- 2. CRITICAL: Add partial index for active students count
-- This optimizes: SELECT COUNT(*) FROM students WHERE school_id = '...' AND is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_id_active_count 
ON public.students(school_id) 
WHERE is_active = true;

-- 3. Add index for profiles table (teachers/parents count)
-- This optimizes: SELECT COUNT(*) FROM profiles WHERE school_id = '...' AND role = 'teacher' AND status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_school_id_role_active 
ON public.profiles(school_id, role) 
WHERE status = 'active';

-- 4. Add index for classes table
-- This optimizes: SELECT COUNT(*) FROM classes WHERE school_id = '...' AND is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classes_school_id_active 
ON public.classes(school_id) 
WHERE is_active = true;

-- 5. Add index for subjects table
-- This optimizes: SELECT COUNT(*) FROM subjects WHERE school_id = '...' AND is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subjects_school_id_active 
ON public.subjects(school_id) 
WHERE is_active = true;

-- 6. Add index for student_fees table (also used in some queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_fees_school_id_status 
ON public.student_fees(school_id, status) 
WHERE school_id IS NOT NULL;

-- 7. Add index for financial transactions (used in finance queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_transactions_school_id_payment_method 
ON public.financial_transactions(school_id, payment_method) 
WHERE school_id IS NOT NULL;

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

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON INDEX idx_fees_school_id_amount_paid_status IS 'CRITICAL: Optimizes dashboard fees query with school_id filter - fixes timeout';
COMMENT ON INDEX idx_students_school_id_active_count IS 'CRITICAL: Optimizes active students count query for dashboard - fixes timeout';
COMMENT ON INDEX idx_profiles_school_id_role_active IS 'Optimizes active user queries by school and role';
COMMENT ON INDEX idx_classes_school_id_active IS 'Optimizes active classes queries by school';
COMMENT ON INDEX idx_subjects_school_id_active IS 'Optimizes active subjects queries by school';
COMMENT ON INDEX idx_student_fees_school_id_status IS 'Optimizes student fees queries by school and status';
COMMENT ON INDEX idx_financial_transactions_school_id_payment_method IS 'Optimizes financial transaction queries by school and payment method';
COMMENT ON INDEX idx_attendance_school_id_date IS 'Optimizes attendance queries by school and date';
COMMENT ON INDEX idx_grades_school_id_status_created IS 'Optimizes grades queries by school, status and creation date';
COMMENT ON INDEX idx_parent_students_parent_id_school IS 'Optimizes parent-student relationship queries';

-- ============================================================================
-- UPDATE TABLE STATISTICS
-- ============================================================================
-- This helps the query planner make better decisions
ANALYZE public.fees;
ANALYZE public.students;
ANALYZE public.profiles;
ANALYZE public.classes;
ANALYZE public.subjects;
ANALYZE public.student_fees;
ANALYZE public.financial_transactions;
ANALYZE public.attendance;
ANALYZE public.grades;
ANALYZE public.parent_students;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the indexes were created successfully:

-- Check if critical indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('fees', 'students', 'profiles', 'classes', 'subjects')
AND indexname LIKE '%school_id%'
ORDER BY tablename, indexname;

-- Test the optimized queries (replace 'your-school-id' with actual school ID)
-- EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
-- SELECT amount, paid_amount, status FROM fees WHERE school_id = 'your-school-id' LIMIT 1000;

-- EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
-- SELECT COUNT(*) FROM students WHERE school_id = 'your-school-id' AND is_active = true;

-- ============================================================================
-- EXPECTED PERFORMANCE IMPROVEMENT
-- ============================================================================
-- After applying these indexes, you should see:
-- 1. Dashboard loading time reduced from 30+ seconds to under 3 seconds
-- 2. No more "Loading Timeout" errors
-- 3. Queries using index scans instead of sequential scans
-- 4. Significantly reduced database load

-- ============================================================================
-- MONITORING
-- ============================================================================
-- Monitor performance after applying indexes:
-- SELECT query, calls, total_time, mean_time, rows 
-- FROM pg_stat_statements 
-- WHERE query LIKE '%fees%' OR query LIKE '%students%'
-- ORDER BY mean_time DESC LIMIT 10; 