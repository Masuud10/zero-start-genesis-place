import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BookOpen, TrendingUp, Plus, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

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

  const schoolId = getCurrentSchoolId();

  console.log('📊 PrincipalDashboard: Initializing for user:', {
    email: user?.email,
    role: user?.role,
    schoolId: schoolId,
    userSchoolId: user?.school_id
  });

  useEffect(() => {
    // Ensure we have proper access before loading data
    const effectiveSchoolId = schoolId || user?.school_id;
    
    if (effectiveSchoolId) {
      console.log('📊 PrincipalDashboard: Loading data for school:', effectiveSchoolId);
      fetchSchoolData();
    } else {
      console.warn('📊 PrincipalDashboard: No school ID available');
      setLoading(false);
      setError('No school assignment found. Please contact your administrator.');
    }
  }, [schoolId, user?.school_id]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const effectiveSchoolId = schoolId || user?.school_id;
      
      if (!effectiveSchoolId) {
        throw new Error('No school ID available for data fetch');
      }

      console.log('📊 PrincipalDashboard: Fetching data for school:', effectiveSchoolId);

      // Validate school access - fix the type error
      if (validateSchoolAccess && !validateSchoolAccess(effectiveSchoolId)) {
        throw new Error('Access denied to school data');
      }

      // Fetch all data in parallel with proper error handling
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

      // Process results and handle individual failures gracefully
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

      console.log('📊 PrincipalDashboard: Data loaded successfully:', {
        stats: { studentsCount, teachersCount, subjectsCount, classesCount },
        activitiesCount: activities.length
      });

      // Log any failed requests
      [studentsResult, teachersResult, subjectsResult, classesResult, announcementsResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`📊 PrincipalDashboard: Query ${index} failed:`, result.reason);
        }
      });

    } catch (error: any) {
      console.error('📊 PrincipalDashboard: Error fetching school data:', error);
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

  const handleDownloadAcademicReport = async () => {
    setDownloadingReport(true);
    try {
      // Assume schoolId from props/context, use current year/term (defaults if not found)
      const year = new Date().getFullYear();
      const term = 'T1'; // Could be improved by connecting to current term logic

      const payload = {
        reportType: "principal-academic",
        filters: {
          schoolId: schoolId || user?.school_id,
          year,
          term,
        },
        userInfo: {
          role: user?.role || "principal",
          userName: user?.name || "",
          userSchoolId: user?.school_id || "",
        },
      };

      // Call the Supabase Edge Function (must use full HTTP URL for fetch)
      const res = await fetch(
        "https://lmqyizrnuahkmwauonqr.functions.supabase.co/generate_report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Optional: pass auth if needed for internal analytics
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate report");
      }

      // Blob the file and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `principal_academic_report_${year}_${term}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast({
        title: "Report Downloaded",
        description: "Academic Performance PDF generated successfully.",
      });
    } catch (e: any) {
      toast({
        title: "Download Failed",
        description: e.message || "Failed to download report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  const statsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "Active students in school",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      description: "Teaching staff members",
      icon: GraduationCap,
      color: "text-green-600"
    },
    {
      title: "Total Subjects",
      value: stats.totalSubjects,
      description: "Subjects offered",
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      title: "Total Classes",
      value: stats.totalClasses,
      description: "Active class groups",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

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
          <Button onClick={fetchSchoolData} variant="outline">
            Try Again
          </Button>
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
      {/* Role-based Report Download Panel */}
      <div>
        <ReportDownloadPanel />
      </div>
      {/* NEW: Academic Performance Report Download UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-50 rounded-lg p-4 mb-2 border border-blue-100">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-blue-900 mb-1 flex items-center gap-2">
            Academic Performance Report (PDF){" "}
            <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Principal</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Download a PDF with class & subject grades, attendance, and summary statistics.
          </p>
          <p className="text-xs text-purple-700 mt-1">Note: Certificates generation will be coming soon!</p>
        </div>
        <Button
          className="flex items-center gap-2 mt-4 md:mt-0"
          onClick={handleDownloadAcademicReport}
          disabled={downloadingReport}
        >
          {downloadingReport ? (
            <>
              <svg className="w-4 h-4 animate-spin mr-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" fill="none" /></svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Download Academic Report
            </>
          )}
        </Button>
      </div>

      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Principal Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Principal'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-blue-50">
              <Users className="h-6 w-6" />
              <span>Manage Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-green-50">
              <GraduationCap className="h-6 w-6" />
              <span>Manage Teachers</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50">
              <Calendar className="h-6 w-6" />
              <span>View Timetable</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50">
              <MessageSquare className="h-6 w-6" />
              <span>Announcements</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Latest activities in your school
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">{activity.type}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent activities</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalDashboard;
