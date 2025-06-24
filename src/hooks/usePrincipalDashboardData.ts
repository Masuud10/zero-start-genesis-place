
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

interface SupabaseQueryResult {
  data?: any;
  error?: any;
  count?: number | null;
}

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

  const fetchSchoolData = useCallback(async (targetSchoolId: string) => {
    if (!targetSchoolId) {
      setError('No school ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (validateSchoolAccess && !validateSchoolAccess(targetSchoolId)) {
        throw new Error('Access denied to school data');
      }

      console.log('📊 Fetching principal dashboard data for school:', targetSchoolId);

      // Create timeout for all queries with shorter duration
      const createTimeout = (ms: number) => new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout after ${ms}ms`)), ms)
      );

      // Batch all queries with proper error handling and shorter timeout
      const queries = [
        supabase.from('students').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('role', 'teacher'),
        supabase.from('subjects').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('is_active', true),
        supabase.from('classes').select('id', { count: 'exact' }).eq('school_id', targetSchoolId),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('role', 'parent'),
      ];

      const results = await Promise.allSettled(
        queries.map(query => Promise.race([query, createTimeout(6000)]))
      );

      // Process results with better error handling
      const statsData = {
        totalStudents: results[0]?.status === 'fulfilled' && (results[0].value as SupabaseQueryResult)?.count !== undefined ? (results[0].value as SupabaseQueryResult).count! : 0,
        totalTeachers: results[1]?.status === 'fulfilled' && (results[1].value as SupabaseQueryResult)?.count !== undefined ? (results[1].value as SupabaseQueryResult).count! : 0,
        totalSubjects: results[2]?.status === 'fulfilled' && (results[2].value as SupabaseQueryResult)?.count !== undefined ? (results[2].value as SupabaseQueryResult).count! : 0,
        totalClasses: results[3]?.status === 'fulfilled' && (results[3].value as SupabaseQueryResult)?.count !== undefined ? (results[3].value as SupabaseQueryResult).count! : 0,
        totalParents: results[4]?.status === 'fulfilled' && (results[4].value as SupabaseQueryResult)?.count !== undefined ? (results[4].value as SupabaseQueryResult).count! : 0
      };

      setStats(statsData);

      // Fetch recent activities with shorter timeout and better error handling
      try {
        const activitiesResult = await Promise.race([
          supabase
            .from('security_audit_logs')
            .select('id, created_at, action, resource, metadata, user_id')
            .eq('school_id', targetSchoolId)
            .eq('success', true)
            .in('action', ['create', 'update'])
            .order('created_at', { ascending: false })
            .limit(5),
          createTimeout(4000)
        ]) as SupabaseQueryResult;

        if (activitiesResult.error) {
          console.warn('📊 Activities fetch error:', activitiesResult.error);
          setRecentActivities([]);
        } else {
          let activities: any[] = [];
          if (activitiesResult.data && activitiesResult.data.length > 0) {
            // Get user names with proper type handling
            const validUserIds = activitiesResult.data
              .map((log: any) => log.user_id)
              .filter((id: any): id is string => typeof id === 'string' && Boolean(id));
            
            const uniqueUserIds: string[] = [...new Set(validUserIds)];
            let userNames: Record<string, string> = {};
            
            if (uniqueUserIds.length > 0) {
              try {
                const profilesResult = await Promise.race([
                  supabase.from('profiles').select('id, name').in('id', uniqueUserIds),
                  createTimeout(2000)
                ]) as SupabaseQueryResult;

                if (profilesResult.data) {
                  profilesResult.data.forEach((p: any) => {
                    if (p.id && p.name) {
                      userNames[p.id] = p.name;
                    }
                  });
                }
              } catch (userError) {
                console.warn('📊 Failed to fetch user names:', userError);
              }
            }

            activities = activitiesResult.data.map((log: any) => {
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
        }
      } catch (activitiesError) {
        console.warn('📊 Failed to fetch activities:', activitiesError);
        setRecentActivities([]);
      }

    } catch (err: any) {
      const detailedError = err.message || 'An unknown error occurred.';
      setError(`Failed to fetch school data. Reason: ${detailedError}`);
      console.error('📊 Principal dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [validateSchoolAccess]);

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
