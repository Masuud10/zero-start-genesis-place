import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import AddTeacherModal from '../modals/AddTeacherModal';
import AddParentModal from '../modals/AddParentModal';
import AddClassModal from '../modals/AddClassModal';
import AddSubjectModal from '../modals/AddSubjectModal';
import PrincipalStatsCards from "./principal/PrincipalStatsCards";
import { Button } from '@/components/ui/button';
import PrincipalDashboardLoading from "./PrincipalDashboardLoading";
import PrincipalDashboardErrorCard from "./PrincipalDashboardErrorCard";
import RoleGuard from '@/components/common/RoleGuard';
import ReportActionsPanel from './principal/ReportActionsPanel';
import EntityPreviewPanels from './principal/EntityPreviewPanels';
import QuickActionsCard from './principal/QuickActionsCard';
import RecentActivitiesPanel from './principal/RecentActivitiesPanel';
import PrincipalManagementPanel from "./principal/PrincipalManagementPanel";

// Add missing types for clarity
type StatsType = {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  totalParents: number;
};

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCurrentSchoolId, validateSchoolAccess, isReady } = useSchoolScopedData();

  // Main stats for dashboard cards
  const [stats, setStats] = useState<StatsType>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0,
    totalParents: 0
  });

  // Recent activities, entity previews, and error/loading state
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Modal open/close
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addParentOpen, setAddParentOpen] = useState(false);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);

  // Used to reload data on entity change
  const [reloadKey, setReloadKey] = useState(0);

  // Entity preview lists
  const [classList, setClassList] = useState<any[]>([]);
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [teacherList, setTeacherList] = useState<any[]>([]);
  const [parentList, setParentList] = useState<any[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [errorEntities, setErrorEntities] = useState<string | null>(null);

  // Gather school id from context/user
  const schoolId = getCurrentSchoolId();

  // ================= MAIN SCHOOL DATA (stats, activities) ==============
  useEffect(() => {
    // Always check both context and user for a school id
    const effectiveSchoolId = schoolId || user?.school_id;
    if (effectiveSchoolId) {
      fetchSchoolData(effectiveSchoolId);
    } else {
      setLoading(false);
      setError('No school assignment found. Please contact your administrator.');
    }
    // eslint-disable-next-line
  }, [schoolId, user?.school_id, reloadKey]);

  const fetchSchoolData = async (targetSchoolId: string) => {
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
          return 0; // Gracefully fail
        }
        return count || 0;
      };

      // Define queries separately
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
      
      // Fetch counts and logs in parallel using Promise.allSettled for robustness
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

      // Parse recent activities from audit logs
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
  };

  // ================= PREVIEW ENTITIES (lists) ==============
  useEffect(() => {
    const effectiveSchoolId = schoolId || user?.school_id;
    if (!effectiveSchoolId) return;

    const fetchEntities = async () => {
        setLoadingEntities(true);
        setErrorEntities(null);

        try {
            const classesQuery = supabase.from('classes').select('id, name, created_at').eq('school_id', effectiveSchoolId).order('name');
            const subjectsQuery = supabase.from('subjects').select('id, name, code, created_at').eq('school_id', effectiveSchoolId).order('name');
            const teachersQuery = supabase.from('profiles').select('id, name, email').eq('school_id', effectiveSchoolId).eq('role', 'teacher').order('name');
            const parentsQuery = supabase.from('profiles').select('id, name, email').eq('school_id', effectiveSchoolId).eq('role', 'parent').order('name');

            const [
              classesRes,
              subjectsRes,
              teachersRes,
              parentsRes,
            ] = await Promise.all([classesQuery, subjectsQuery, teachersQuery, parentsQuery]);
            
            if (classesRes.error || subjectsRes.error || teachersRes.error || parentsRes.error) {
              console.error("Error fetching entities", {
                classes: classesRes.error,
                subjects: subjectsRes.error,
                teachers: teachersRes.error,
                parents: parentsRes.error,
              });
              setErrorEntities("Failed to load some entities.");
            }

            setClassList(classesRes.data || []);
            setSubjectList(subjectsRes.data || []);
            setTeacherList(teachersRes.data || []);
            setParentList(parentsRes.data || []);

        } catch (err: any) {
            console.error("Exception when fetching entities", err);
            setErrorEntities("Failed to load entities.");
        } finally {
            setLoadingEntities(false);
        }
    };
    
    fetchEntities();
    // eslint-disable-next-line
  }, [schoolId, user?.school_id, reloadKey]);

  // After any entity (add/edit), refresh data
  const handleEntityCreated = () => {
    setReloadKey(k => k + 1);
  };

  // ========== BUTTONS/MODALS are simple: always just toggle/open, so no fixes needed ==========

  // UX fixes for initial loading
  if (!isReady) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
        </div>
      </div>
    );
  }
  if (loading) {
    return <PrincipalDashboardLoading />;
  }
  if (error) {
    return <PrincipalDashboardErrorCard error={error} onRetry={() => fetchSchoolData(schoolId || user?.school_id)} />;
  }

  return (
    <RoleGuard allowedRoles={['principal']} requireSchoolAssignment={true}>
      <div className="space-y-6">
        {/* Welcome and user header removed as per request */}

        {/* Statistics cards */}
        <PrincipalStatsCards stats={stats} />
        
        {/* Quick action panel for adding parent/teacher/class */}
        <QuickActionsCard
          onAddParent={() => setAddParentOpen(true)}
          onAddTeacher={() => setAddTeacherOpen(true)}
          onAddClass={() => setAddClassOpen(true)}
        />

        <RecentActivitiesPanel recentActivities={recentActivities} />

        {/* Management panels for classes, subjects, teachers, students */}
        <PrincipalManagementPanel />

        {/* Entity preview panels for showing classes/subjects/teachers/parents */}
        <EntityPreviewPanels
          classList={classList}
          subjectList={subjectList}
          teacherList={teacherList}
          parentList={parentList}
          stats={stats}
          loading={loadingEntities}
          error={errorEntities}
          onAddSubject={() => setAddSubjectOpen(true)}
        />

        {/* Reports */}
        <ReportActionsPanel
          downloadingReport={downloadingReport}
          setDownloadingReport={setDownloadingReport}
          user={user}
          schoolId={schoolId}
          toast={toast}
        />

        {/* MODALS */}
        <AddTeacherModal
          open={addTeacherOpen}
          onClose={() => setAddTeacherOpen(false)}
          onTeacherCreated={handleEntityCreated}
        />
        <AddParentModal
          open={addParentOpen}
          onClose={() => setAddParentOpen(false)}
          onParentCreated={handleEntityCreated}
        />
        <AddClassModal
          open={addClassOpen}
          onClose={() => setAddClassOpen(false)}
          onClassCreated={handleEntityCreated}
        />
        <AddSubjectModal
          open={addSubjectOpen}
          onClose={() => setAddSubjectOpen(false)}
          onSubjectCreated={handleEntityCreated}
        />
      </div>
    </RoleGuard>
  );
};

export default PrincipalDashboard;
