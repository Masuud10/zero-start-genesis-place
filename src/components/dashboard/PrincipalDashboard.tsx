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
import SmartTimetableGenerator from "@/components/timetable/SmartTimetableGenerator";
import SmartTimetableReview from "@/components/timetable/SmartTimetableReview";
import PrincipalManagementPanel from "./principal/PrincipalManagementPanel";

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
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  
  const [classList, setClassList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [parentList, setParentList] = useState([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [errorEntities, setErrorEntities] = useState<string | null>(null);

  const schoolId = getCurrentSchoolId();

  useEffect(() => {
    const effectiveSchoolId = schoolId || user?.school_id;
    if (effectiveSchoolId) {
      fetchSchoolData();
    } else {
      setLoading(false);
      setError('No school assignment found. Please contact your administrator.');
    }
  }, [schoolId, user?.school_id, reloadKey]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      const effectiveSchoolId = schoolId || user?.school_id;

      if (!effectiveSchoolId) {
        throw new Error('No school ID available for data fetch');
      }
      
      if (validateSchoolAccess && !validateSchoolAccess(effectiveSchoolId)) {
        throw new Error('Access denied to school data');
      }

      // Fetch all data in parallel
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

      const studentsCount = studentsResult.status === 'fulfilled' ? (studentsResult.value?.count || 0) : 0;
      const teachersCount = teachersResult.status === 'fulfilled' ? (teachersResult.value?.count || 0) : 0;
      const subjectsCount = subjectsResult.status === 'fulfilled' ? (subjectsResult.value?.count || 0) : 0;
      const classesCount = classesResult.status === 'fulfilled' ? (classesResult.value?.count || 0) : 0;

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
      }

      setRecentActivities(activities);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch school data');
      toast({
        title: "Error",
        description: `Failed to fetch school data: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    }).catch(() => {
      setErrorEntities("Failed to load entities.");
    }).finally(() => setLoadingEntities(false));
  }, [schoolId, user?.school_id, reloadKey]);

  const handleEntityCreated = () => {
    setReloadKey(k => k + 1);
  };

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
    return <PrincipalDashboardErrorCard error={error} onRetry={fetchSchoolData} />;
  }

  return (
    <RoleGuard allowedRoles={['principal']} requireSchoolAssignment={true}>
      <div className="space-y-6">
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

        <ReportActionsPanel
          downloadingReport={downloadingReport}
          setDownloadingReport={setDownloadingReport}
          user={user}
          schoolId={schoolId}
          toast={toast}
        />

        <PrincipalStatsCards stats={stats} />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setAddClassOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Class
          </Button>
          <Button variant="outline" onClick={() => setAddParentOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Parent
          </Button>
        </div>

        <QuickActionsCard
          onAddParent={() => setAddParentOpen(true)}
          onAddTeacher={() => setAddTeacherOpen(true)}
        />

        <RecentActivitiesPanel recentActivities={recentActivities} />

        {/* ======= 🧠 SMART TIMETABLE INTEGRATION ======= */}
        <SmartTimetableGenerator term={String(new Date().getFullYear())} onGenerationSuccess={handleEntityCreated} />
        <SmartTimetableReview term={String(new Date().getFullYear())} onPublish={handleEntityCreated} />

        {/* ======= 🧠 PRINCIPAL MANAGEMENT PANELS ======= */}
        <PrincipalManagementPanel />

        <EntityPreviewPanels
          classList={classList}
          subjectList={subjectList}
          teacherList={teacherList}
          parentList={parentList}
          stats={stats}
          loading={loadingEntities}
          error={errorEntities}
        />

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
