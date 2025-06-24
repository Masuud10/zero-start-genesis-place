
import { useState, useEffect, useCallback } from 'react';
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

export const usePrincipalDashboardData = (reloadKey: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schoolId, isReady } = useSchoolScopedData();

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
      setError('No school assignment found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching principal dashboard data for school:', targetSchoolId);

      // Simplified sequential queries with better error handling
      const queries = [
        { name: 'students', query: supabase.from('students').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('is_active', true) },
        { name: 'teachers', query: supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('role', 'teacher') },
        { name: 'subjects', query: supabase.from('subjects').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('is_active', true) },
        { name: 'classes', query: supabase.from('classes').select('id', { count: 'exact' }).eq('school_id', targetSchoolId) },
        { name: 'parents', query: supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('role', 'parent') }
      ];

      const results: Record<string, number> = {};

      // Execute queries one by one for better error isolation
      for (const { name, query } of queries) {
        try {
          const { count, error: queryError } = await query;
          if (queryError) {
            console.warn(`📊 ${name} query failed:`, queryError);
            results[name] = 0;
          } else {
            results[name] = count || 0;
          }
        } catch (err) {
          console.warn(`📊 ${name} query exception:`, err);
          results[name] = 0;
        }
      }

      const statsData = {
        totalStudents: results.students,
        totalTeachers: results.teachers,
        totalSubjects: results.subjects,
        totalClasses: results.classes,
        totalParents: results.parents
      };

      setStats(statsData);
      console.log('📊 Principal stats updated:', statsData);

      // Fetch recent activities with simplified approach
      try {
        const { data: activitiesData } = await supabase
          .from('security_audit_logs')
          .select('id, created_at, action, resource, user_id')
          .eq('school_id', targetSchoolId)
          .eq('success', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activitiesData && activitiesData.length > 0) {
          const activities = activitiesData.map((log: any) => ({
            id: log.id,
            type: log.resource || 'system',
            description: `${log.action} ${log.resource || 'resource'}`,
            timestamp: log.created_at,
          }));
          setRecentActivities(activities);
        } else {
          setRecentActivities([]);
        }
      } catch (activitiesError) {
        console.warn('📊 Activities fetch failed:', activitiesError);
        setRecentActivities([]);
      }

    } catch (err: any) {
      console.error('📊 Principal dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      console.log('📊 School context not ready yet');
      return;
    }

    if (schoolId) {
      fetchSchoolData(schoolId);
    } else {
      setLoading(false);
      if (user?.role === 'principal') {
        setError('Your account needs to be assigned to a school. Please contact your administrator.');
      } else {
        setError('No school assignment found.');
      }
    }
  }, [schoolId, reloadKey, fetchSchoolData, isReady, user]);

  return { stats, recentActivities, loading, error, schoolId, fetchSchoolData };
};
