
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

export type StatsType = {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  totalParents: number;
};

// Add caching to prevent continuous API requests
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const dashboardCache = new Map<string, { data: any; timestamp: number }>();

export const usePrincipalDashboardData = (reloadKey: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schoolId, validateSchoolAccess, isReady } = useSchoolScopedData();

  const [stats, setStats] = useState<StatsType>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0,
    totalParents: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize cache key to prevent unnecessary re-renders
  const cacheKey = useMemo(() => `dashboard-${schoolId}-${reloadKey}`, [schoolId, reloadKey]);

  const fetchSchoolData = useCallback(async (targetSchoolId: string) => {
    try {
      // Check cache first
      const cached = dashboardCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setStats(cached.data.stats);
        setRecentActivities(cached.data.activities);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      if (validateSchoolAccess && !validateSchoolAccess(targetSchoolId)) {
        throw new Error('Access denied to school data');
      }

      console.log('📊 Fetching principal dashboard data for school:', targetSchoolId);

      // Batch all queries together to reduce API calls with proper error handling
      const [
        studentsResult,
        teachersResult,
        subjectsResult,
        classesResult,
        parentsResult,
        auditLogsResult
      ] = await Promise.allSettled([
        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('school_id', targetSchoolId)
          .eq('is_active', true),
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('school_id', targetSchoolId)
          .eq('role', 'teacher'),
        supabase
          .from('subjects')
          .select('id', { count: 'exact' })
          .eq('school_id', targetSchoolId)
          .eq('is_active', true),
        supabase
          .from('classes')
          .select('id', { count: 'exact' })
          .eq('school_id', targetSchoolId),
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('school_id', targetSchoolId)
          .eq('role', 'parent'),
        supabase
          .from('security_audit_logs')
          .select('id, created_at, action, resource, metadata, user_id')
          .eq('school_id', targetSchoolId)
          .eq('success', true)
          .in('action', ['create', 'update'])
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Process results safely with proper error handling
      const statsData = {
        totalStudents: studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0,
        totalTeachers: teachersResult.status === 'fulfilled' ? (teachersResult.value.count || 0) : 0,
        totalSubjects: subjectsResult.status === 'fulfilled' ? (subjectsResult.value.count || 0) : 0,
        totalClasses: classesResult.status === 'fulfilled' ? (classesResult.value.count || 0) : 0,
        totalParents: parentsResult.status === 'fulfilled' ? (parentsResult.value.count || 0) : 0
      };

      setStats(statsData);

      // Process recent activities with improved error handling
      let activities: any[] = [];
      if (auditLogsResult.status === 'fulfilled' && auditLogsResult.value.data) {
        const rawAuditLogs = auditLogsResult.value.data;
        
        // Get user names for activities with proper validation
        const userIds = [...new Set(rawAuditLogs.map(log => log.user_id).filter(Boolean))];
        let userNames: Record<string, string> = {};
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds);

          if (profilesData) {
            profilesData.forEach(p => {
              if (p.id && p.name) {
                userNames[p.id] = p.name;
              }
            });
          }
        }

        activities = rawAuditLogs.map((log: any) => {
          const userName = log.user_id ? userNames[log.user_id] || 'A user' : 'A user';
          const actionVerb = log.action === 'create' ? 'created' : 'updated';
          const resourceName = log.resource ? log.resource.replace(/_/g, ' ') : 'resource';
          
          return {
            id: log.id,
            type: log.resource,
            description: `${userName} ${actionVerb} a ${resourceName}`,
            timestamp: log.created_at,
          };
        });
      }
      
      setRecentActivities(activities);

      // Cache the results
      dashboardCache.set(cacheKey, {
        data: { stats: statsData, activities },
        timestamp: Date.now()
      });

    } catch (err: any) {
      const detailedError = err.message || 'An unknown error occurred.';
      setError(`Failed to fetch school data. Reason: ${detailedError}`);
      console.error('📊 Principal dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [validateSchoolAccess, cacheKey]);

  useEffect(() => {
    // Wait for school scoped data to be ready
    if (!isReady) {
      return;
    }

    if (schoolId) {
      fetchSchoolData(schoolId);
    } else {
      setLoading(false);
      // Check if user exists and has proper role
      if (user?.role === 'principal') {
        setError('Your principal account needs to be assigned to a school. Please contact your administrator.');
      } else {
        setError('No school assignment found. Please contact your administrator.');
      }
    }
  }, [schoolId, reloadKey, fetchSchoolData, isReady, user]);

  return { stats, recentActivities, loading, error, schoolId, fetchSchoolData };
};
