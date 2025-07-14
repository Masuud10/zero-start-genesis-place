-- VERIFICATION SCRIPT FOR SYSTEM ANALYTICS DATA INTEGRITY FIXES
-- Run this in your Supabase SQL Editor to verify the fixes work correctly

-- ============================================================================
-- PHASE 1: VERIFY USER ANALYTICS ACCURACY
-- ============================================================================

-- Check total active users (should only count active users)
SELECT 
  'User Analytics Verification' as test_name,
  COUNT(*) as total_users_in_table,
  COUNT(*) FILTER (WHERE status = 'active') as active_users_only,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_users,
  COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users
FROM public.profiles;

-- Check new users this month (should use proper date filtering)
SELECT 
  'New Users This Month' as test_name,
  COUNT(*) as new_users_this_month,
  date_trunc('month', CURRENT_DATE) as month_start,
  date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' as month_end
FROM public.profiles 
WHERE status = 'active'
  AND created_at >= date_trunc('month', CURRENT_DATE)
  AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';

-- Check user role distribution (should only include active users)
SELECT 
  'User Role Distribution' as test_name,
  role,
  COUNT(*) as count,
  ROUND((COUNT(*) * 100.0) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM public.profiles 
WHERE status = 'active'
GROUP BY role
ORDER BY count DESC;

-- ============================================================================
-- PHASE 2: VERIFY SCHOOL ANALYTICS ACCURACY
-- ============================================================================

-- Check total active schools (should only count active schools)
SELECT 
  'School Analytics Verification' as test_name,
  COUNT(*) as total_schools_in_table,
  COUNT(*) FILTER (WHERE status = 'active') as active_schools_only,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_schools,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_schools
FROM public.schools;

-- Check new schools this month (should use proper date filtering)
SELECT 
  'New Schools This Month' as test_name,
  COUNT(*) as new_schools_this_month,
  date_trunc('month', CURRENT_DATE) as month_start,
  date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' as month_end
FROM public.schools 
WHERE status = 'active'
  AND created_at >= date_trunc('month', CURRENT_DATE)
  AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';

-- ============================================================================
-- PHASE 3: VERIFY BILLING ANALYTICS ACCURACY
-- ============================================================================

-- Check total revenue (should only count successful payments)
SELECT 
  'Billing Analytics Verification' as test_name,
  COUNT(*) as total_fees_in_table,
  COUNT(*) FILTER (WHERE status = 'paid') as paid_fees_only,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_fees,
  COUNT(*) FILTER (WHERE status = 'partial') as partial_fees,
  COUNT(*) FILTER (WHERE status = 'overdue') as overdue_fees
FROM public.fees;

-- Check monthly revenue (should use precise date filtering)
SELECT 
  'Monthly Revenue Verification' as test_name,
  COALESCE(SUM(paid_amount), 0) as monthly_revenue,
  date_trunc('month', CURRENT_DATE) as month_start,
  date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as month_end
FROM public.fees 
WHERE status = 'paid'
  AND created_at >= date_trunc('month', CURRENT_DATE)
  AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';

-- Check revenue growth rate (compare current vs previous month)
WITH current_month AS (
  SELECT COALESCE(SUM(paid_amount), 0) as revenue
  FROM public.fees 
  WHERE status = 'paid'
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
),
previous_month AS (
  SELECT COALESCE(SUM(paid_amount), 0) as revenue
  FROM public.fees 
  WHERE status = 'paid'
    AND created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
    AND created_at < date_trunc('month', CURRENT_DATE)
)
SELECT 
  'Revenue Growth Rate' as test_name,
  cm.revenue as current_month_revenue,
  pm.revenue as previous_month_revenue,
  CASE 
    WHEN pm.revenue > 0 THEN 
      ROUND(((cm.revenue - pm.revenue) / pm.revenue) * 100, 2)
    ELSE 0 
  END as growth_rate_percentage
FROM current_month cm, previous_month pm;

-- ============================================================================
-- PHASE 4: VERIFY ACTIVITY ANALYTICS ACCURACY
-- ============================================================================

-- Check grades count (should only count released grades)
SELECT 
  'Grades Analytics Verification' as test_name,
  COUNT(*) as total_grades_in_table,
  COUNT(*) FILTER (WHERE status = 'released') as released_grades_only,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_grades,
  COUNT(*) FILTER (WHERE status = 'submitted') as submitted_grades,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_grades
FROM public.grades;

-- Check attendance count (should only count valid records)
SELECT 
  'Attendance Analytics Verification' as test_name,
  COUNT(*) as total_attendance_in_table,
  COUNT(*) FILTER (WHERE status IS NOT NULL) as valid_attendance_only,
  COUNT(*) FILTER (WHERE status = 'present') as present_count,
  COUNT(*) FILTER (WHERE status = 'absent') as absent_count,
  COUNT(*) FILTER (WHERE status = 'late') as late_count,
  COUNT(*) FILTER (WHERE status = 'excused') as excused_count
FROM public.attendance;

-- Check announcements count (should only count active announcements)
SELECT 
  'Announcements Analytics Verification' as test_name,
  COUNT(*) as total_announcements_in_table,
  COUNT(*) FILTER (WHERE is_active = true) as active_announcements_only,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_announcements
FROM public.announcements;

-- ============================================================================
-- PHASE 5: TEST THE NEW ACCURATE FUNCTIONS
-- ============================================================================

-- Test the new accurate user analytics function
SELECT 
  'Testing Accurate User Analytics Function' as test_name,
  public.get_accurate_user_analytics() as result;

-- Test the new accurate school analytics function
SELECT 
  'Testing Accurate School Analytics Function' as test_name,
  public.get_accurate_school_analytics() as result;

-- Test the new accurate billing analytics function
SELECT 
  'Testing Accurate Billing Analytics Function' as test_name,
  public.get_accurate_billing_analytics() as result;

-- Test the new accurate activity analytics function
SELECT 
  'Testing Accurate Activity Analytics Function' as test_name,
  public.get_accurate_activity_analytics() as result;

-- Test the comprehensive system analytics function
SELECT 
  'Testing Comprehensive System Analytics Function' as test_name,
  public.get_system_analytics_accurate('{"dateRange": "30d"}'::jsonb) as result;

-- ============================================================================
-- PHASE 6: COMPARE OLD VS NEW RESULTS
-- ============================================================================

-- Compare user counts (old method vs new method)
SELECT 
  'User Count Comparison' as comparison_type,
  (SELECT COUNT(*) FROM public.profiles) as old_total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE status = 'active') as new_active_users_only,
  (SELECT COUNT(*) FROM public.profiles WHERE status = 'active') - (SELECT COUNT(*) FROM public.profiles) as difference;

-- Compare school counts (old method vs new method)
SELECT 
  'School Count Comparison' as comparison_type,
  (SELECT COUNT(*) FROM public.schools) as old_total_schools,
  (SELECT COUNT(*) FROM public.schools WHERE status = 'active') as new_active_schools_only,
  (SELECT COUNT(*) FROM public.schools WHERE status = 'active') - (SELECT COUNT(*) FROM public.schools) as difference;

-- Compare revenue calculations (old method vs new method)
SELECT 
  'Revenue Comparison' as comparison_type,
  (SELECT COALESCE(SUM(paid_amount), 0) FROM public.fees) as old_total_revenue,
  (SELECT COALESCE(SUM(paid_amount), 0) FROM public.fees WHERE status = 'paid') as new_paid_revenue_only,
  (SELECT COALESCE(SUM(paid_amount), 0) FROM public.fees WHERE status = 'paid') - (SELECT COALESCE(SUM(paid_amount), 0) FROM public.fees) as difference;

-- ============================================================================
-- PHASE 7: PERFORMANCE VERIFICATION
-- ============================================================================

-- Check if the new indexes exist and are being used
SELECT 
  'Index Verification' as test_name,
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('profiles', 'schools', 'fees', 'grades', 'attendance', 'announcements')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check query performance with EXPLAIN
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(DISTINCT id) 
FROM public.profiles 
WHERE status = 'active';

EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(DISTINCT id) 
FROM public.schools 
WHERE status = 'active';

EXPLAIN (ANALYZE, BUFFERS) 
SELECT COALESCE(SUM(paid_amount), 0) 
FROM public.fees 
WHERE status = 'paid'
  AND created_at >= date_trunc('month', CURRENT_DATE)
  AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';

-- ============================================================================
-- PHASE 8: SUMMARY REPORT
-- ============================================================================

-- Generate a summary report of all verifications
SELECT 
  'SYSTEM ANALYTICS DATA INTEGRITY VERIFICATION SUMMARY' as report_title,
  now() as verification_timestamp;

-- Summary of key metrics
SELECT 
  'Key Metrics Summary' as section,
  (SELECT COUNT(*) FROM public.profiles WHERE status = 'active') as active_users,
  (SELECT COUNT(*) FROM public.schools WHERE status = 'active') as active_schools,
  (SELECT COALESCE(SUM(paid_amount), 0) FROM public.fees WHERE status = 'paid') as total_revenue,
  (SELECT COUNT(*) FROM public.grades WHERE status = 'released') as released_grades,
  (SELECT COUNT(*) FROM public.attendance WHERE status IS NOT NULL) as valid_attendance_records;

-- Data quality indicators
SELECT 
  'Data Quality Indicators' as section,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.profiles WHERE status IS NULL) = 0 THEN 'PASS'
    ELSE 'FAIL - Profiles with NULL status found'
  END as profiles_status_check,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.schools WHERE status IS NULL) = 0 THEN 'PASS'
    ELSE 'FAIL - Schools with NULL status found'
  END as schools_status_check,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.fees WHERE status IS NULL) = 0 THEN 'PASS'
    ELSE 'FAIL - Fees with NULL status found'
  END as fees_status_check;

-- ============================================================================
-- PHASE 9: RECOMMENDATIONS
-- ============================================================================

-- If any issues are found, provide recommendations
SELECT 
  'Recommendations' as section,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.profiles WHERE status IS NULL) > 0 
    THEN 'Update profiles with NULL status to active/inactive/suspended'
    ELSE 'No action needed for profiles'
  END as profiles_recommendation,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.schools WHERE status IS NULL) > 0 
    THEN 'Update schools with NULL status to active/inactive/pending'
    ELSE 'No action needed for schools'
  END as schools_recommendation,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.fees WHERE status IS NULL) > 0 
    THEN 'Update fees with NULL status to pending/paid/partial/overdue'
    ELSE 'No action needed for fees'
  END as fees_recommendation; 