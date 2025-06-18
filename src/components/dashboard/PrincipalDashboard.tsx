
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useNavigation } from '@/contexts/NavigationContext';
import AddTeacherModal from '../modals/AddTeacherModal';
import AddParentModal from '../modals/AddParentModal';
import AddClassModal from '../modals/AddClassModal';
import AddSubjectModal from '../modals/AddSubjectModal';
import PrincipalStatsCards from "./principal/PrincipalStatsCards";
import PrincipalDashboardLoading from "./PrincipalDashboardLoading";
import PrincipalDashboardErrorCard from "./PrincipalDashboardErrorCard";
import RoleGuard from '@/components/common/RoleGuard';
import QuickActionsCard from './principal/QuickActionsCard';
import RecentActivitiesPanel from './principal/RecentActivitiesPanel';
import PrincipalAnalyticsCharts from './principal/PrincipalAnalyticsCharts';
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
      <div className="space-y-8 p-6">
        {/* Statistics Cards */}
        <PrincipalStatsCards stats={stats} />

        {/* Quick Actions and Key Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Performance Metrics */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Active Teachers</span>
                <span className="text-lg font-bold text-green-600">{stats.totalTeachers}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Total Classes</span>
                <span className="text-lg font-bold text-blue-600">{stats.totalClasses}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Subjects Offered</span>
                <span className="text-lg font-bold text-purple-600">{stats.totalSubjects}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Parent Contacts</span>
                <span className="text-lg font-bold text-orange-600">{stats.totalParents}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <QuickActionsCard
              onAddTeacher={() => setAddTeacherOpen(true)}
              onAddParent={() => setAddParentOpen(true)}
              onAddClass={() => setAddClassOpen(true)}
              onAddSubject={() => setAddSubjectOpen(true)}
            />
          </div>
        </div>

        {/* Bulk Grading Quick Action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BulkGradingQuickAction onOpenBulkGrade={() => setBulkGradingOpen(true)} />
          
          {/* School Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                School Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Student Enrollment</span>
                  <span className="font-semibold">{stats.totalStudents} Students</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Faculty Strength</span>
                  <span className="font-semibold">{stats.totalTeachers} Teachers</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Academic Programs</span>
                  <span className="font-semibold">{stats.totalSubjects} Subjects</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Class Divisions</span>
                  <span className="font-semibold">{stats.totalClasses} Classes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics and Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PrincipalAnalyticsCharts />
          <RecentActivitiesPanel recentActivities={recentActivities} />
        </div>

        {/* Operational Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PrincipalAttendanceCard />
          <FinancialOverviewReadOnly />
        </div>

        {/* Quick Navigation Hub */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              School Management Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => setActiveSection('school-management')}
              >
                <Users className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">Manage Staff</div>
                  <div className="text-xs text-muted-foreground">Teachers & Assignments</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-200 transition-colors"
                onClick={() => setActiveSection('timetable')}
              >
                <Calendar className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">Timetable</div>
                  <div className="text-xs text-muted-foreground">Schedule Management</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                onClick={() => setActiveSection('grades')}
              >
                <Award className="h-6 w-6 text-purple-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">Grades</div>
                  <div className="text-xs text-muted-foreground">Academic Performance</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                onClick={() => setActiveSection('reports')}
              >
                <FileText className="h-6 w-6 text-orange-600" />
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
