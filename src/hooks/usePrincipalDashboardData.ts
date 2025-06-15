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

      // Fetch counts separately to avoid complex Promise.allSettled typing issues
      const studentsCount = await fetchCount(
        supabase.from('students').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('is_active', true)
      );
      
      const teachersCount = await fetchCount(
        supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('role', 'teacher')
      );
      
      const subjectsCount = await fetchCount(
        supabase.from('subjects').select('id', { count: 'exact' }).eq('school_id', targetSchoolId)
      );
      
      const classesCount = await fetchCount(
        supabase.from('classes').select('id', { count: 'exact' }).eq('school_id', targetSchoolId)
      );
      
      const parentsCount = await fetchCount(
        supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', targetSchoolId).eq('role', 'parent')
      );

      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalSubjects: subjectsCount,
        totalClasses: classesCount,
        totalParents: parentsCount
      });

      // Fetch audit logs with school_id to fix the bug and simplify logic
      const { data: rawAuditLogs, error: auditLogsError } = await supabase
        .from('security_audit_logs')
        .select('id, created_at, action, resource, metadata, user_id')
        .eq('school_id', targetSchoolId) // This is the crucial fix
        .eq('success', true)
        .in('action', ['create', 'update'])
        .order('created_at', { ascending: false })
        .limit(5);

      let activities: any[] = [];
      if (auditLogsError) {
        console.error("Failed to fetch audit logs:", auditLogsError.message);
      } else if (rawAuditLogs) {
        // To avoid TS type instantiation error, we process userIds in a less complex way
        const userIds: string[] = [];
        for (const log of rawAuditLogs) {
          if (log.user_id && !userIds.includes(log.user_id)) {
            userIds.push(log.user_id);
          }
        }
        
        let userNames: Record<string, string> = {};
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds);

          if (profilesError) {
            console.error("Failed to fetch user profiles for audit logs:", profilesError.message);
          } else if (profilesData){
            profilesData.forEach(p => {
              userNames[p.id] = p.name;
            });
          }
        }

        activities = rawAuditLogs.map((log: any) => {
          const userName = log.user_id ? userNames[log.user_id] || 'A user' : 'A user';
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
