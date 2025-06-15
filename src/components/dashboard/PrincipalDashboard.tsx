import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import AddTeacherModal from '../modals/AddTeacherModal';
import AddParentModal from '../modals/AddParentModal';
import AddClassModal from '../modals/AddClassModal';
import PrincipalStatsCards from "./principal/PrincipalStatsCards";
import PrincipalWelcomeHeader from "./principal/PrincipalWelcomeHeader";
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

      // Define queries separately to help TypeScript with type inference
      const studentsQuery = supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('school_id', targetSchoolId)
        .eq('is_active', true);

      const teachersQuery = supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('school_id', targetSchoolId)
        .eq('role', 'teacher');
      
      const subjectsQuery = supabase
        .from('subjects')
        .select('id', { count: 'exact' })
        .eq('school_id', targetSchoolId);

      const classesQuery = supabase
        .from('classes')
        .select('id', { count: 'exact' })
        .eq('school_id', targetSchoolId);

      const parentsQuery = supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('school_id', targetSchoolId)
        .eq('role', 'parent');

      const auditLogsQuery = supabase
        .from('security_audit_logs')
        .select('id, created_at, action, resource, metadata, user_id, profiles(name)')
        .eq('school_id', targetSchoolId)
        .eq('success', true)
        .in('action', ['create', 'update'])
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch data in parallel for speed
      const [
        studentsResult,
        teachersResult,
        subjectsResult,
        classesResult,
        parentsResult,
        auditLogsResult
      ] = await Promise.allSettled([
        studentsQuery,
        teachersQuery,
        subjectsQuery,
        classesQuery,
        parentsQuery,
        auditLogsQuery,
      ] as const);

      const studentsCount =
        studentsResult.status === 'fulfilled' ? (studentsResult.value?.count || 0) : 0;
      const teachersCount =
        teachersResult.status === 'fulfilled' ? (teachersResult.value?.count || 0) : 0;
      const subjectsCount =
        subjectsResult.status === 'fulfilled' ? (subjectsResult.value?.count || 0) : 0;
      const classesCount =
        classesResult.status === 'fulfilled' ? (classesResult.value?.count || 0) : 0;
      const parentsCount =
        parentsResult.status === 'fulfilled' ? (parentsResult.value?.count || 0) : 0;

      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalSubjects: subjectsCount,
        totalClasses: classesCount,
        totalParents: parentsCount
      });

      // Parse recent activities from audit logs
      let activities: any[] = [];
      if (auditLogsResult.status === 'fulfilled' && auditLogsResult.value.data) {
        const logs = auditLogsResult.value.data as any[];
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

    setLoadingEntities(true);
    setErrorEntities(null);

    const classesQuery = supabase.from('classes').select('id, name, created_at').eq('school_id', effectiveSchoolId).order('name');
    const subjectsQuery = supabase.from('subjects').select('id, name, code, created_at').eq('school_id', effectiveSchoolId).order('name');
    const teachersQuery = supabase.from('profiles').select('id, name, email').eq('school_id', effectiveSchoolId).eq('role', 'teacher').order('name');
    const parentsQuery = supabase.from('profiles').select('id, name, email').eq('school_id', effectiveSchoolId).eq('role', 'parent').order('name');

    Promise.allSettled([
      classesQuery,
      subjectsQuery,
      teachersQuery,
      parentsQuery,
    ] as const).then(([classesRes, subjectsRes, teachersRes, parentsRes]) => {
      setClassList(classesRes.status === "fulfilled" ? classesRes.value.data || [] : []);
      setSubjectList(subjectsRes.status === "fulfilled" ? subjectsRes.value.data || [] : []);
      setTeacherList(teachersRes.status === "fulfilled" ? teachersRes.value.data || [] : []);
      setParentList(parentsRes.status === "fulfilled" ? parentsRes.value.data || [] : []);
      setErrorEntities(
        [classesRes, subjectsRes, teachersRes, parentsRes].find(r => r.status === "rejected")
          ? "Failed to load some entities." : null
      );
    }).catch(() => {
      setErrorEntities("Failed to load entities.");
    }).finally(() => setLoadingEntities(false));
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
        {/* Welcome and user header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <PrincipalWelcomeHeader user={user} />
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-500 font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
              })}
            </div>
            <div className="flex items-center space-x-2 bg-white/60 rounded-lg px-2 py-1 border border-white/40 mt-1">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">{user?.name?.[0] || "U"}</span>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-gray-900 text-xs">{user?.email?.split('@')[0]}</div>
                <div className="text-gray-500 text-[10px]">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </RoleGuard>
  );
};

export default PrincipalDashboard;
