import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useNavigation } from '@/contexts/NavigationContext';
import AddTeacherModal from '../modals/AddTeacherModal';
import AddParentModal from '../modals/AddParentModal';
import AddClassModal from '../modals/AddClassModal';
import AddSubjectModal from '../modals/AddSubjectModal';
import PrincipalDashboardLoading from "./PrincipalDashboardLoading";
import PrincipalDashboardErrorCard from "./PrincipalDashboardErrorCard";
import RoleGuard from '@/components/common/RoleGuard';
import QuickActionsCard from './principal/QuickActionsCard';
import RecentActivitiesPanel from './principal/RecentActivitiesPanel';
import PrincipalAnalyticsCharts from './principal/PrincipalAnalyticsCharts';
import EnhancedKeyMetrics from './principal/EnhancedKeyMetrics';
import GradeApprovalDashboard from '@/components/grading/GradeApprovalDashboard';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { usePrincipalDashboardModals } from '@/hooks/usePrincipalDashboardModals';
import BulkGradingQuickAction from './principal/BulkGradingQuickAction';
import BulkGradingModal from '../grading/BulkGradingModal';
import PrincipalAttendanceCard from './principal/PrincipalAttendanceCard';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Award, FileText, TrendingUp, Users, BookOpen, Calendar, BarChart3 } from 'lucide-react';
import { usePrincipalAnalyticsData } from '@/hooks/usePrincipalAnalyticsData';

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isReady } = useSchoolScopedData();
  const { setActiveSection } = useNavigation();

  const [reloadKey, setReloadKey] = useState(0);

  const {
    stats,
    recentActivities,
    loading,
    error,
    schoolId,
    fetchSchoolData,
  } = usePrincipalDashboardData(reloadKey);

  const { data: analyticsData } = usePrincipalAnalyticsData();

  const {
    classList,
    subjectList,
    teacherList,
    parentList,
    loadingEntities,
    errorEntities,
  } = usePrincipalEntityLists(reloadKey);

  const {
    addTeacherOpen,
    setAddTeacherOpen,
    addParentOpen,
    setAddParentOpen,
    addClassOpen,
    setAddClassOpen,
    addSubjectOpen,
    setAddSubjectOpen,
    bulkGradingOpen,
    setBulkGradingOpen,
  } = usePrincipalDashboardModals();

  if (!isReady || loading) return <PrincipalDashboardLoading />;
  if (error) return <PrincipalDashboardErrorCard error={error} onRetry={() => fetchSchoolData(schoolId || '')} />;

  const handleEntityCreated = () => {
    setReloadKey(prev => prev + 1);
    if (schoolId) {
      fetchSchoolData(schoolId);
    }
  };

  return (
    <RoleGuard allowedRoles={['principal']} requireSchoolAssignment>
      <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
        {/* Enhanced Key Performance Metrics */}
        <EnhancedKeyMetrics stats={stats} analyticsData={analyticsData} />

        {/* Quick Actions and School Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <QuickActionsCard
              onAddTeacher={() => setAddTeacherOpen(true)}
              onAddParent={() => setAddParentOpen(true)}
              onAddClass={() => setAddClassOpen(true)}
              onAddSubject={() => setAddSubjectOpen(true)}
            />
          </div>

          {/* School Overview Card */}
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-2xl">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                School Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Student Enrollment</span>
                  <span className="font-bold text-indigo-600">{stats.totalStudents} Students</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Faculty Strength</span>
                  <span className="font-bold text-green-600">{stats.totalTeachers} Teachers</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Academic Programs</span>
                  <span className="font-bold text-purple-600">{stats.totalSubjects} Subjects</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600">Class Divisions</span>
                  <span className="font-bold text-orange-600">{stats.totalClasses} Classes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Grading Quick Action */}
        <BulkGradingQuickAction onOpenBulkGrade={() => setBulkGradingOpen(true)} />

        {/* Analytics Charts Section */}
        <PrincipalAnalyticsCharts />

        {/* Activities and Operational Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivitiesPanel recentActivities={recentActivities} />
          <div className="space-y-6">
            <PrincipalAttendanceCard />
            <FinancialOverviewReadOnly />
          </div>
        </div>

        {/* Quick Navigation Hub */}
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              School Management Hub
            </CardTitle>
            <p className="text-gray-300 text-sm mt-1">Quick access to key management areas</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
                onClick={() => setActiveSection('school-management')}
              >
                <Users className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="font-medium text-sm">Manage Staff</div>
                  <div className="text-xs text-muted-foreground">Teachers & Assignments</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-3 hover:bg-green-50 hover:border-green-200 transition-all duration-200 group"
                onClick={() => setActiveSection('timetable')}
              >
                <Calendar className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="font-medium text-sm">Timetable</div>
                  <div className="text-xs text-muted-foreground">Schedule Management</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-3 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 group"
                onClick={() => setActiveSection('grades')}
              >
                <Award className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="font-medium text-sm">Grades</div>
                  <div className="text-xs text-muted-foreground">Academic Performance</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-3 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 group"
                onClick={() => setActiveSection('reports')}
              >
                <FileText className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="font-medium text-sm">Reports</div>
                  <div className="text-xs text-muted-foreground">Academic & Financial</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grade Approval Section */}
        <GradeApprovalDashboard />

        {/* Modals */}
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

        <BulkGradingModal
          open={bulkGradingOpen}
          onClose={() => setBulkGradingOpen(false)}
          classList={classList}
          subjectList={subjectList}
        />
      </div>
    </RoleGuard>
  );
};

export default PrincipalDashboard;
