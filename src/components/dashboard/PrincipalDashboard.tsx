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
  const [stats, setStats] = useState<SchoolStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addParentOpen, setAddParentOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const schoolId = getCurrentSchoolId();

  useEffect(() => {
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

  // Handler to refetch dashboard data after modal success
  const handleUserCreated = () => {
    setReloadKey(k => k + 1);
  };

  // Error state
  if (error && !loading) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Principal Dashboard Error
          </CardTitle>
          <CardDescription>
            There was a problem loading your dashboard data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            className="px-4 py-2 border border-gray-300 rounded hover:bg-red-100"
            onClick={fetchSchoolData}
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Principal Dashboard</h2>
          <p className="text-gray-600">Loading your school data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
