import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import ReportDownloadPanel from '@/components/reports/ReportDownloadPanel';
import AddTeacherModal from '../modals/AddTeacherModal';
import AddParentModal from '../modals/AddParentModal';
import PrincipalStatsCards from "./principal/PrincipalStatsCards";
import PrincipalQuickActions from "./principal/PrincipalQuickActions";
import AcademicReportPanel from "./principal/AcademicReportPanel";
import PrincipalWelcomeHeader from "./principal/PrincipalWelcomeHeader";
import RecentActivities from "./principal/RecentActivities";
import { Button } from '@/components/ui/button';
import PrincipalDashboardLoading from "./PrincipalDashboardLoading";
import PrincipalDashboardErrorCard from "./PrincipalDashboardErrorCard";
import { Badge } from '@/components/ui/badge';
import AddClassModal from '../modals/AddClassModal';
import RoleReportDownloadButton from '@/components/reports/RoleReportDownloadButton';
import RoleGuard from '@/components/common/RoleGuard';

// --- Helper preview functions and panel ---
const PreviewPanel = ({ title, items, total, renderItem, loading, error }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">{title}</CardTitle>
      <CardDescription>
        Total: {loading ? <span className="animate-pulse">…</span> : total}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="text-xs text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-xs text-red-600">{error}</div>
      ) : (
        <ul className="text-xs space-y-1">
          {items && items.length > 0
            ? items.slice(0, 5).map(renderItem)
            : <li>No items.</li>}
        </ul>
      )}
    </CardContent>
  </Card>
);

const renderClass = (cls) => (
  <li key={cls.id}>
    <span className="font-semibold">{cls.name}</span>{" "}
    <span className="text-gray-400 text-[10px]">{cls.id.slice(0, 6)}</span>
  </li>
);

const renderSubject = (subj) => (
  <li key={subj.id}>
    <span>{subj.name}</span>{" "}
    <span className="text-gray-400 text-[10px]">{subj.code}</span>
  </li>
);

const renderPerson = (person) => (
  <li key={person.id}>
    <span>{person.name}</span>{" "}
    <span className="text-gray-400 text-[10px]">{person.email}</span>
  </li>
);

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCurrentSchoolId, validateSchoolAccess, isReady } = useSchoolScopedData();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addParentOpen, setAddParentOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [classList, setClassList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [parentList, setParentList] = useState([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [errorEntities, setErrorEntities] = useState<string | null>(null);
  const [addClassOpen, setAddClassOpen] = useState(false);

  const schoolId = getCurrentSchoolId();

  // Debug: Dump top-level user and school
  console.log('[DEBUG] PrincipalDashboard mount:', {
    user,
    user_id: user?.id,
    user_role: user?.role,
    user_school_id: user?.school_id,
    currentSchoolId: schoolId,
    reloadKey,
  });

  const { getCurrentSchoolId, validateSchoolAccess, isReady } = useSchoolScopedData();

  useEffect(() => {
    console.log('[DEBUG] useEffect: start', { schoolId, user, reloadKey });
    const effectiveSchoolId = schoolId || user?.school_id;
    if (effectiveSchoolId) {
      console.log('[DEBUG] useEffect: Fetching data for school', effectiveSchoolId);
      fetchSchoolData();
    } else {
      setLoading(false);
      setError('No school assignment found. Please contact your administrator.');
      console.warn('[DEBUG] useEffect: No school assignment found. Effective School ID:', effectiveSchoolId);
    }
    // eslint-disable-next-line
  }, [schoolId, user?.school_id, reloadKey]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      const effectiveSchoolId = schoolId || user?.school_id;
      console.log('[DEBUG] fetchSchoolData called', { effectiveSchoolId, user });

      if (!effectiveSchoolId) {
        console.error('[DEBUG] fetchSchoolData: No school ID');
        throw new Error('No school ID available for data fetch');
      }
      if (validateSchoolAccess && !validateSchoolAccess(effectiveSchoolId)) {
        console.error('[DEBUG] fetchSchoolData: Access denied to school', effectiveSchoolId);
        throw new Error('Access denied to school data');
      }
      // Fetch all data in parallel
      console.log('[DEBUG] fetchSchoolData: beginning Supabase fetch');
      const [
        studentsResult,
        teachersResult,
        subjectsResult,
        classesResult,
        announcementsResult
      ] = await Promise.allSettled([
        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('school_id', effectiveSchoolId)
          .eq('is_active', true),
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('school_id', effectiveSchoolId)
          .eq('role', 'teacher'),
        supabase
          .from('subjects')
          .select('id', { count: 'exact' })
          .eq('school_id', effectiveSchoolId),
        supabase
          .from('classes')
          .select('id', { count: 'exact' })
          .eq('school_id', effectiveSchoolId),
        supabase
          .from('announcements')
          .select('id, title, created_at')
          .eq('school_id', effectiveSchoolId)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);
      // Log Supabase fetch results for debugging
      console.log('[DEBUG] Supabase fetch results:', {
        studentsResult,
        teachersResult,
        subjectsResult,
        classesResult,
        announcementsResult,
      });
      const studentsCount = studentsResult.status === 'fulfilled'
        ? (studentsResult.value?.count || 0)
        : (() => { console.warn('[DEBUG] Students fetch failed:', studentsResult.reason); return 0 })();
      const teachersCount = teachersResult.status === 'fulfilled'
        ? (teachersResult.value?.count || 0)
        : (() => { console.warn('[DEBUG] Teachers fetch failed:', teachersResult.reason); return 0 })();
      const subjectsCount = subjectsResult.status === 'fulfilled'
        ? (subjectsResult.value?.count || 0)
        : (() => { console.warn('[DEBUG] Subjects fetch failed:', subjectsResult.reason); return 0 })();
      const classesCount = classesResult.status === 'fulfilled'
        ? (classesResult.value?.count || 0)
        : (() => { console.warn('[DEBUG] Classes fetch failed:', classesResult.reason); return 0 })();

      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalSubjects: subjectsCount,
        totalClasses: classesCount
      });

      // Process announcements
      let activities = [];
      if (announcementsResult.status === 'fulfilled') {
        const data = announcementsResult.value.data || [];
        activities = data.map(announcement => ({
          id: announcement.id,
          type: 'announcement',
          description: `New announcement: ${announcement.title || 'Untitled'}`,
          timestamp: announcement.created_at
        }));
      } else {
        console.warn('[DEBUG] Announcements fetch failed', announcementsResult.reason);
      }

      setRecentActivities(activities);
      // Log stats set
      console.log('[DEBUG] Stats set:', {
        studentsCount, teachersCount, subjectsCount, classesCount, activities
      });
    } catch (error) {
      console.error('[DEBUG] fetchSchoolData ERROR:', error, error?.stack);
      setError(error.message || 'Failed to fetch school data');
      toast({
        title: "Error",
        description: `Failed to fetch school data: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('[DEBUG] fetchSchoolData: done');
    }
  };

  /* Add fetchEntities for listing classes/subjects/teachers/parents */
  useEffect(() => {
    const effectiveSchoolId = schoolId || user?.school_id;
    if (!effectiveSchoolId) return;
    setLoadingEntities(true);
    setErrorEntities(null);

    Promise.allSettled([
      supabase.from('classes').select('id, name, created_at').eq('school_id', effectiveSchoolId).order('name'),
      supabase.from('subjects').select('id, name, code, created_at').eq('school_id', effectiveSchoolId).order('name'),
      supabase.from('profiles').select('id, name, email').eq('school_id', effectiveSchoolId).eq('role', 'teacher').order('name'),
      supabase.from('profiles').select('id, name, email').eq('school_id', effectiveSchoolId).eq('role', 'parent').order('name')
    ]).then(([classesRes, subjectsRes, teachersRes, parentsRes]) => {
      setClassList(classesRes.status === "fulfilled" ? classesRes.value.data || [] : []);
      setSubjectList(subjectsRes.status === "fulfilled" ? subjectsRes.value.data || [] : []);
      setTeacherList(teachersRes.status === "fulfilled" ? teachersRes.value.data || [] : []);
      setParentList(parentsRes.status === "fulfilled" ? parentsRes.value.data || [] : []);
      setErrorEntities(
        [classesRes, subjectsRes, teachersRes, parentsRes].find(r => r.status === "rejected")
          ? "Failed to load some entities." : null
      );
    }).catch((err) => {
      setErrorEntities("Failed to load entities.");
    }).finally(() => setLoadingEntities(false));
  }, [schoolId, user?.school_id, reloadKey]);

  // Handler to refetch dashboard data after modal success
  const handleUserCreated = () => {
    setReloadKey(k => k + 1);
    console.log('[DEBUG] handleUserCreated: reloadKey incremented');
  };

  // Modified handleUserCreated to always reloadKey++ for any entity creation
  const handleEntityCreated = () => {
    setReloadKey(k => k + 1);
  };

  // Wait for scoped data to be ready
  if (!isReady) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse"><div className="h-6 bg-gray-300 rounded mb-2"></div></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['principal']} requireSchoolAssignment={true}>
      <div className="space-y-6">
        {/* Greeting/Profile/Date top-right layout */}
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
                <div className="font-semibold text-gray-900 text-xs">{user.email?.split('@')[0]}</div>
                <div className="text-gray-500 text-[10px]">{user.email}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Main dashboard content */}
        <ReportDownloadPanel />
        {/* Academic/Attendance Excel report download shortcuts for Principal */}
        <div className="mb-2 flex flex-col md:flex-row items-start md:items-center gap-2">
          <RoleReportDownloadButton
            type="grades"
            term={"" + (new Date().getFullYear())}
            label="Download Grades (Excel)"
          />
          <RoleReportDownloadButton
            type="attendance"
            term={"" + (new Date().getFullYear())}
            label="Download Attendance (Excel)"
          />
        </div>
        <AcademicReportPanel
          downloadingReport={downloadingReport}
          setDownloadingReport={setDownloadingReport}
          user={user}
          schoolId={schoolId}
          toast={toast}
        />
        <PrincipalWelcomeHeader user={user} />
        <PrincipalStatsCards stats={stats} />
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => { setAddParentOpen(true); console.log('[DEBUG] AddParentModal open'); }}>
            <Plus className="w-4 h-4 mr-1" />
            Add Parent
          </Button>
        </div>
        {/* Add Class Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setAddClassOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Class
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrincipalQuickActions
              onAddParent={() => { setAddParentOpen(true); console.log('[DEBUG] QuickActions: AddParentModal open'); }}
              onAddTeacher={() => { setAddTeacherOpen(true); console.log('[DEBUG] QuickActions: AddTeacherModal open'); }}
            />
          </CardContent>
        </Card>
        <RecentActivities recentActivities={recentActivities} />
        <AddTeacherModal
          open={addTeacherOpen}
          onClose={() => { setAddTeacherOpen(false); console.log('[DEBUG] AddTeacherModal close'); }}
          onTeacherCreated={handleEntityCreated}
        />
        <AddParentModal
          open={addParentOpen}
          onClose={() => { setAddParentOpen(false); console.log('[DEBUG] AddParentModal close'); }}
          onParentCreated={handleEntityCreated}
        />
        <AddClassModal
          open={addClassOpen}
          onClose={() => setAddClassOpen(false)}
          onClassCreated={handleEntityCreated}
        />
        {/* Entities Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PreviewPanel
            title="Classes"
            items={classList}
            total={stats.totalClasses}
            renderItem={renderClass}
            loading={loadingEntities}
            error={errorEntities}
          />
          <PreviewPanel
            title="Subjects"
            items={subjectList}
            total={stats.totalSubjects}
            renderItem={renderSubject}
            loading={loadingEntities}
            error={errorEntities}
          />
          <PreviewPanel
            title="Teachers"
            items={teacherList}
            total={stats.totalTeachers}
            renderItem={renderPerson}
            loading={loadingEntities}
            error={errorEntities}
          />
          <PreviewPanel
            title="Parents"
            items={parentList}
            total={parentList.length}
            renderItem={renderPerson}
            loading={loadingEntities}
            error={errorEntities}
          />
        </div>
      </div>
    </RoleGuard>
  );
};

export default PrincipalDashboard;
