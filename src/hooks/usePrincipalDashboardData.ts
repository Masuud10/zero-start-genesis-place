
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
  const { getCurrentSchoolId, validateSchoolAccess } = useSchoolScopedData();
  
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
  
  const schoolId = getCurrentSchoolId() || user?.school_id;

  const fetchSchoolData = useCallback(async (targetSchoolId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (validateSchoolAccess && !validateSchoolAccess(targetSchoolId)) {
        throw new Error('Access denied to school data');
      }
      
      const fetchCount = async (query: any) => {
        const { count, error } = await query;
        if (error) {
          console.error(`A count query failed: ${error.message}`);
          return 0;
        }
        return count || 0;
      };

      const studentsQuery = supabase.from('students').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('is_active', true);
      const teachersQuery = supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('role', 'teacher');
      const subjectsQuery = supabase.from('subjects').select('id', { count: 'exact' }).eq('school_id', targetSchoolId);
      const classesQuery = supabase.from('classes').select('id', { count: 'exact' }).eq('school_id', targetSchoolId);
      const parentsQuery = supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('role', 'parent');
      
      const auditLogsQuery = supabase
        .from('security_audit_logs')
        .select('id, created_at, action, resource, metadata, user_id, profiles(name)')
        .eq('school_id', targetSchoolId)
        .eq('success', true)
        .in('action', ['create', 'update'])
        .order('created_at', { ascending: false })
        .limit(5);
      
      const promises = [
        fetchCount(studentsQuery),
        fetchCount(teachersQuery),
        fetchCount(subjectsQuery),
        fetchCount(classesQuery),
        fetchCount(parentsQuery),
        auditLogsQuery,
      ] as const;
      
      const [
        studentsCountRes,
        teachersCountRes,
        subjectsCountRes,
        classesCountRes,
        parentsCountRes,
        auditLogsResultRes,
      ] = await Promise.allSettled(promises);

      const studentsCount = studentsCountRes.status === 'fulfilled' ? studentsCountRes.value : 0;
      const teachersCount = teachersCountRes.status === 'fulfilled' ? teachersCountRes.value : 0;
      const subjectsCount = subjectsCountRes.status === 'fulfilled' ? subjectsCountRes.value : 0;
      const classesCount = classesCountRes.status === 'fulfilled' ? classesCountRes.value : 0;
      const parentsCount = parentsCountRes.status === 'fulfilled' ? parentsCountRes.value : 0;

      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalSubjects: subjectsCount,
        totalClasses: classesCount,
        totalParents: parentsCount
      });

      let activities: any[] = [];
      if (auditLogsResultRes.status === 'fulfilled') {
        const auditLogsResult = auditLogsResultRes.value;
        if (auditLogsResult.error) {
          console.error("Failed to fetch audit logs:", auditLogsResult.error.message);
        } else if (auditLogsResult.data) {
          const logs = auditLogsResult.data as any[];
          activities = logs.map((log: any) => {
            const userName = log.profiles?.name || 'A user';
            const actionVerb = log.action === 'create' ? 'created' : 'updated';
            
            let entityName = '';
            if (log.metadata && typeof log.metadata === 'object') {
              if ('name' in log.metadata && log.metadata.name) {
                  entityName = `"${log.metadata.name}"`;
              } else if ('title' in log.metadata && log.metadata.title) {
                  entityName = `"${log.metadata.title}"`;
              }
            }

            const resourceName = log.resource.replace(/_/g, ' ');
            let description = `${userName} ${actionVerb} a ${resourceName}.`;
            if (entityName) {
              description = `${userName} ${actionVerb} the ${resourceName} ${entityName}.`;
            }

            return {
              id: log.id,
              type: log.resource,
              description: description,
              timestamp: log.created_at,
            };
          });
        }
      } else {
        console.error("Failed to fetch audit logs:", auditLogsResultRes.reason);
      }
      setRecentActivities(activities);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch school data');
      toast({
        title: "Error",
        description: `Failed to fetch school data: ${err.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, validateSchoolAccess]);

  useEffect(() => {
    if (schoolId) {
      fetchSchoolData(schoolId);
    } else {
      setLoading(false);
      setError('No school assignment found. Please contact your administrator.');
    }
  }, [schoolId, reloadKey, fetchSchoolData]);

  return { stats, recentActivities, loading, error, schoolId, fetchSchoolData };
};
