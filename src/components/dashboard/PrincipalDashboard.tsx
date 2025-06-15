
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

  useEffect(() => {
    console.log('[PrincipalDashboard] useEffect triggered', { schoolId, userSchoolId: user?.school_id, reloadKey });
    const effectiveSchoolId = schoolId || user?.school_id;
    if (effectiveSchoolId) {
      fetchSchoolData();
    } else {
      setLoading(false);
      setError('No school assignment found. Please contact your administrator.');
    }
    // eslint-disable-next-line
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
      console.log('[PrincipalDashboard] Fetching school data for', effectiveSchoolId);
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
      const studentsCount = studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0;
      const teachersCount = teachersResult.status === 'fulfilled' ? (teachersResult.value.count || 0) : 0;
      const subjectsCount = subjectsResult.status === 'fulfilled' ? (subjectsResult.value.count || 0) : 0;
      const classesCount = classesResult.status === 'fulfilled' ? (classesResult.value.count || 0) : 0;

      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalSubjects: subjectsCount,
        totalClasses: classesCount
      });

      // Process announcements
      const announcements = announcementsResult.status === 'fulfilled' ? (announcementsResult.value.data || []) : [];
      const activities = announcements.map(announcement => ({
        id: announcement.id,
        type: 'announcement',
        description: `New announcement: ${announcement.title || 'Untitled'}`,
        timestamp: announcement.created_at
      }));

      setRecentActivities(activities);

      console.log('[PrincipalDashboard] Stats set:', { studentsCount, teachersCount, subjectsCount, classesCount });
      console.log('[PrincipalDashboard] Recent activities:', activities);
    } catch (error) {
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

  // Handler to refetch dashboard data after modal success
  const handleUserCreated = () => {
    setReloadKey(k => k + 1);
  };

  if (error && !loading) {
    console.log('[PrincipalDashboard] Rendering error:', error);
    return (
      <PrincipalDashboardErrorCard error={error} onRetry={fetchSchoolData} />
    );
  }

  if (loading) {
    console.log('[PrincipalDashboard] Rendering loading');
    return <PrincipalDashboardLoading />;
  }

  console.log('[PrincipalDashboard] Rendering overview with stats:', stats);

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
        <Button variant="outline" onClick={() => setAddParentOpen(true)}>
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
            onAddParent={() => setAddParentOpen(true)}
            onAddTeacher={() => setAddTeacherOpen(true)}
          />
        </CardContent>
      </Card>
      <RecentActivities recentActivities={recentActivities} />
      <AddTeacherModal
        open={addTeacherOpen}
        onClose={() => setAddTeacherOpen(false)}
        onTeacherCreated={handleUserCreated}
      />
      <AddParentModal
        open={addParentOpen}
        onClose={() => setAddParentOpen(false)}
        onParentCreated={handleUserCreated}
      />
    </div>
  );
};

export default PrincipalDashboard;
