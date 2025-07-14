-- Fix System Analytics Data Integrity Issues
-- This migration addresses critical data accuracy problems in the System Analytics feature

-- ============================================================================
-- PHASE 1: CREATE ACCURATE ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get accurate user analytics with proper filtering
CREATE OR REPLACE FUNCTION public.get_accurate_user_analytics(
  p_school_id UUID DEFAULT NULL,
  p_date_range TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_users INTEGER;
  active_users INTEGER;
  new_users_this_month INTEGER;
  user_role_distribution JSONB;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Calculate date range
  CASE p_date_range
    WHEN '7d' THEN start_date := CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN start_date := CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN start_date := CURRENT_DATE - INTERVAL '90 days'
    WHEN '1y' THEN start_date := CURRENT_DATE - INTERVAL '1 year'
    ELSE start_date := CURRENT_DATE - INTERVAL '30 days'
  END CASE;
  end_date := CURRENT_DATE;

  -- Get total active users (FIXED: Only count active users)
  SELECT COUNT(DISTINCT id) INTO total_users
  FROM public.profiles 
  WHERE status = 'active'
    AND (p_school_id IS NULL OR school_id = p_school_id);

  -- Get active users (same as total since we're filtering by active status)
  active_users := total_users;

  -- Get new users this month (FIXED: Proper date filtering)
  SELECT COUNT(DISTINCT id) INTO new_users_this_month
  FROM public.profiles 
  WHERE status = 'active'
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    AND (p_school_id IS NULL OR school_id = p_school_id);

  -- Get user role distribution (FIXED: Only active users)
  SELECT jsonb_object_agg(role, count) INTO user_role_distribution
  FROM (
    SELECT role, COUNT(DISTINCT id) as count
    FROM public.profiles 
    WHERE status = 'active'
      AND (p_school_id IS NULL OR school_id = p_school_id)
    GROUP BY role
  ) role_counts;

  -- Build result
  result := jsonb_build_object(
    'totalUsers', total_users,
    'activeUsers', active_users,
    'newUsersThisMonth', new_users_this_month,
    'userRoleDistribution', user_role_distribution,
    'lastUpdated', now()
  );

  RETURN result;
END;
$$;

-- Function to get accurate school analytics with proper filtering
CREATE OR REPLACE FUNCTION public.get_accurate_school_analytics(
  p_date_range TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_schools INTEGER;
  active_schools INTEGER;
  new_schools_this_month INTEGER;
  schools_by_status JSONB;
BEGIN
  -- Get total active schools (FIXED: Only count active schools)
  SELECT COUNT(DISTINCT id) INTO total_schools
  FROM public.schools 
  WHERE status = 'active';

  -- Get active schools (same as total since we're filtering by active status)
  active_schools := total_schools;

  -- Get new schools this month (FIXED: Proper date filtering)
  SELECT COUNT(DISTINCT id) INTO new_schools_this_month
  FROM public.schools 
  WHERE status = 'active'
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';

  -- Get schools by status (FIXED: Only active schools)
  SELECT jsonb_object_agg(status, count) INTO schools_by_status
  FROM (
    SELECT status, COUNT(DISTINCT id) as count
    FROM public.schools 
    WHERE status = 'active'
    GROUP BY status
  ) status_counts;

  -- Build result
  result := jsonb_build_object(
    'totalSchools', total_schools,
    'activeSchools', active_schools,
    'newSchoolsThisMonth', new_schools_this_month,
    'schoolsByStatus', schools_by_status,
    'lastUpdated', now()
  );

  RETURN result;
END;
$$;

-- Function to get accurate billing analytics with proper date filtering
CREATE OR REPLACE FUNCTION public.get_accurate_billing_analytics(
  p_school_id UUID DEFAULT NULL,
  p_date_range TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_revenue DECIMAL(10,2);
  monthly_revenue DECIMAL(10,2);
  revenue_growth_rate DECIMAL(5,2);
  start_date DATE;
  end_date DATE;
  current_month_start DATE;
  current_month_end DATE;
  previous_month_start DATE;
  previous_month_end DATE;
BEGIN
  -- Calculate date ranges
  CASE p_date_range
    WHEN '7d' THEN start_date := CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN start_date := CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN start_date := CURRENT_DATE - INTERVAL '90 days'
    WHEN '1y' THEN start_date := CURRENT_DATE - INTERVAL '1 year'
    ELSE start_date := CURRENT_DATE - INTERVAL '30 days'
  END CASE;
  end_date := CURRENT_DATE;

  current_month_start := date_trunc('month', CURRENT_DATE);
  current_month_end := current_month_start + INTERVAL '1 month' - INTERVAL '1 day';
  previous_month_start := current_month_start - INTERVAL '1 month';
  previous_month_end := current_month_start - INTERVAL '1 day';

  -- Get total revenue (FIXED: Only successful payments with proper date filtering)
  SELECT COALESCE(SUM(paid_amount), 0) INTO total_revenue
  FROM public.fees 
  WHERE status = 'paid'
    AND created_at >= start_date
    AND created_at <= end_date
    AND (p_school_id IS NULL OR school_id = p_school_id);

  -- Get monthly revenue (FIXED: Precise current month filtering)
  SELECT COALESCE(SUM(paid_amount), 0) INTO monthly_revenue
  FROM public.fees 
  WHERE status = 'paid'
    AND created_at >= current_month_start
    AND created_at <= current_month_end
    AND (p_school_id IS NULL OR school_id = p_school_id);

  -- Calculate revenue growth rate (FIXED: Compare current month vs previous month)
  SELECT 
    CASE 
      WHEN previous_month_revenue > 0 THEN 
        ((monthly_revenue - previous_month_revenue) / previous_month_revenue) * 100
      ELSE 0 
    END INTO revenue_growth_rate
  FROM (
    SELECT COALESCE(SUM(paid_amount), 0) as previous_month_revenue
    FROM public.fees 
    WHERE status = 'paid'
      AND created_at >= previous_month_start
      AND created_at <= previous_month_end
      AND (p_school_id IS NULL OR school_id = p_school_id)
  ) prev_month;

  -- Build result
  result := jsonb_build_object(
    'totalRevenue', total_revenue,
    'monthlyRevenue', monthly_revenue,
    'revenueGrowthRate', revenue_growth_rate,
    'lastUpdated', now()
  );

  RETURN result;
END;
$$;

-- Function to get accurate activity analytics with proper filtering
CREATE OR REPLACE FUNCTION public.get_accurate_activity_analytics(
  p_school_id UUID DEFAULT NULL,
  p_date_range TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  grades_count INTEGER;
  attendance_count INTEGER;
  announcements_count INTEGER;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Calculate date range
  CASE p_date_range
    WHEN '7d' THEN start_date := CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN start_date := CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN start_date := CURRENT_DATE - INTERVAL '90 days'
    WHEN '1y' THEN start_date := CURRENT_DATE - INTERVAL '1 year'
    ELSE start_date := CURRENT_DATE - INTERVAL '30 days'
  END CASE;
  end_date := CURRENT_DATE;

  -- Get grades count (FIXED: Only released grades)
  SELECT COUNT(DISTINCT g.id) INTO grades_count
  FROM public.grades g
  WHERE g.status = 'released'
    AND g.created_at >= start_date
    AND g.created_at <= end_date
    AND (p_school_id IS NULL OR g.school_id = p_school_id);

  -- Get attendance count (FIXED: Only valid attendance records)
  SELECT COUNT(DISTINCT a.id) INTO attendance_count
  FROM public.attendance a
  WHERE a.status IS NOT NULL
    AND a.date >= start_date
    AND a.date <= end_date
    AND (p_school_id IS NULL OR a.school_id = p_school_id);

  -- Get announcements count (FIXED: Only active announcements)
  SELECT COUNT(DISTINCT ann.id) INTO announcements_count
  FROM public.announcements ann
  WHERE ann.is_active = true
    AND ann.created_at >= start_date
    AND ann.created_at <= end_date
    AND (p_school_id IS NULL OR ann.school_id = p_school_id);

  -- Build result
  result := jsonb_build_object(
    'gradesCount', grades_count,
    'attendanceCount', attendance_count,
    'announcementsCount', announcements_count,
    'featureUsage', jsonb_build_array(
      jsonb_build_object('feature', 'Grade Management', 'usage', grades_count, 'color', '#3b82f6'),
      jsonb_build_object('feature', 'Attendance Tracking', 'usage', attendance_count, 'color', '#10b981'),
      jsonb_build_object('feature', 'Announcements', 'usage', announcements_count, 'color', '#f59e0b')
    ),
    'lastUpdated', now()
  );

  RETURN result;
END;
$$;

-- ============================================================================
-- PHASE 2: CREATE COMPREHENSIVE SYSTEM ANALYTICS FUNCTION
-- ============================================================================

-- Main function to get all system analytics with accurate data
CREATE OR REPLACE FUNCTION public.get_system_analytics_accurate(
  p_filters JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_analytics JSONB;
  school_analytics JSONB;
  billing_analytics JSONB;
  activity_analytics JSONB;
  school_id UUID;
  date_range TEXT;
  user_role TEXT;
BEGIN
  -- Extract filters
  school_id := (p_filters->>'schoolId')::UUID;
  date_range := COALESCE(p_filters->>'dateRange', '30d');
  user_role := p_filters->>'userRole';

  -- Security check: Only admin users can access system analytics
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    RAISE EXCEPTION 'Access denied: Only admin users can access system analytics';
  END IF;

  -- Get all analytics data
  SELECT public.get_accurate_user_analytics(school_id, date_range) INTO user_analytics;
  SELECT public.get_accurate_school_analytics(date_range) INTO school_analytics;
  SELECT public.get_accurate_billing_analytics(school_id, date_range) INTO billing_analytics;
  SELECT public.get_accurate_activity_analytics(school_id, date_range) INTO activity_analytics;

  -- Combine all analytics
  result := user_analytics || school_analytics || billing_analytics || activity_analytics || 
            jsonb_build_object(
              'lastUpdated', now(),
              'dataFreshness', 'accurate',
              'filters', p_filters
            );

  RETURN result;
END;
$$;

-- ============================================================================
-- PHASE 3: ADD DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Ensure profiles table has proper status constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS check_profiles_status_valid 
CHECK (status IN ('active', 'inactive', 'suspended'));

-- Ensure schools table has proper status constraints
ALTER TABLE public.schools 
ADD CONSTRAINT IF NOT EXISTS check_schools_status_valid 
CHECK (status IN ('active', 'inactive', 'pending'));

-- Ensure fees table has proper status constraints
ALTER TABLE public.fees 
ADD CONSTRAINT IF NOT EXISTS check_fees_status_valid 
CHECK (status IN ('pending', 'paid', 'partial', 'overdue'));

-- Ensure grades table has proper status constraints
ALTER TABLE public.grades 
ADD CONSTRAINT IF NOT EXISTS check_grades_status_valid 
CHECK (status IN ('draft', 'submitted', 'approved', 'released'));

-- Ensure attendance table has proper status constraints
ALTER TABLE public.attendance 
ADD CONSTRAINT IF NOT EXISTS check_attendance_status_valid 
CHECK (status IN ('present', 'absent', 'late', 'excused'));

-- ============================================================================
-- PHASE 4: ADD PERFORMANCE INDEXES FOR ANALYTICS QUERIES
-- ============================================================================

-- Indexes for user analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_status_school_role 
ON public.profiles(status, school_id, role) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at_status 
ON public.profiles(created_at, status) 
WHERE status = 'active';

-- Indexes for school analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schools_status_created 
ON public.schools(status, created_at) 
WHERE status = 'active';

-- Indexes for billing analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_status_created_school 
ON public.fees(status, created_at, school_id) 
WHERE status = 'paid';

-- Indexes for activity analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_status_created_school 
ON public.grades(status, created_at, school_id) 
WHERE status = 'released';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_date_school 
ON public.attendance(date, school_id) 
WHERE status IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_active_created_school 
ON public.announcements(is_active, created_at, school_id) 
WHERE is_active = true;

-- ============================================================================
-- PHASE 5: UPDATE TABLE STATISTICS
-- ============================================================================

-- Update statistics for better query planning
ANALYZE public.profiles;
ANALYZE public.schools;
ANALYZE public.fees;
ANALYZE public.grades;
ANALYZE public.attendance;
ANALYZE public.announcements;

-- ============================================================================
-- PHASE 6: GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.get_accurate_user_analytics(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_accurate_school_analytics(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_accurate_billing_analytics(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_accurate_activity_analytics(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_analytics_accurate(JSONB) TO authenticated;

-- ============================================================================
-- PHASE 7: CREATE RLS POLICIES FOR ANALYTICS FUNCTIONS
-- ============================================================================

-- Policy for system analytics access (only admins)
CREATE POLICY "Admin access to system analytics" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('elimisha_admin', 'edufam_admin')
  )
);

-- ============================================================================
-- PHASE 8: VERIFICATION QUERIES
-- ============================================================================

-- These queries can be run to verify the fixes work correctly:

/*
-- Test user analytics accuracy
SELECT public.get_accurate_user_analytics();

-- Test school analytics accuracy  
SELECT public.get_accurate_school_analytics();

-- Test billing analytics accuracy
SELECT public.get_accurate_billing_analytics();

-- Test complete system analytics
SELECT public.get_system_analytics_accurate('{"dateRange": "30d"}'::jsonb);

-- Verify active user count
SELECT COUNT(*) as active_users FROM public.profiles WHERE status = 'active';

-- Verify active school count
SELECT COUNT(*) as active_schools FROM public.schools WHERE status = 'active';

-- Verify paid fees this month
SELECT SUM(paid_amount) as monthly_revenue 
FROM public.fees 
WHERE status = 'paid' 
  AND created_at >= date_trunc('month', CURRENT_DATE)
  AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
*/ 