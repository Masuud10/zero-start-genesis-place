
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

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCurrentSchoolId, validateSchoolAccess } = useSchoolScopedData();
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

  // Handler to refetch dashboard data after modal success
  const handleUserCreated = () => {
    setReloadKey(k => k + 1);
    console.log('[DEBUG] handleUserCreated: reloadKey incremented');
  };

  if (error && !loading) {
    console.warn('[DEBUG] Rendering error state:', error);
    return (
      <PrincipalDashboardErrorCard error={error} onRetry={fetchSchoolData} />
    );
  }

  if (loading) {
    console.info('[DEBUG] Rendering loading state');
    return <PrincipalDashboardLoading />;
  }

  console.log('[DEBUG] Rendering overview with stats:', stats);

  return (
    <div className="space-y-6">
      <ReportDownloadPanel />
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
        onTeacherCreated={handleUserCreated}
      />
      <AddParentModal
        open={addParentOpen}
        onClose={() => { setAddParentOpen(false); console.log('[DEBUG] AddParentModal close'); }}
        onParentCreated={handleUserCreated}
      />
    </div>
  );
};

export default PrincipalDashboard;
