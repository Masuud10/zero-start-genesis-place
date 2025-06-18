
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
import PrincipalTimetableCard from './principal/PrincipalTimetableCard';
import PrincipalAttendanceCard from './principal/PrincipalAttendanceCard';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';
import TeacherSubjectAssignmentQuickAction from './principal/TeacherSubjectAssignmentQuickAction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Award, FileText, User, TrendingUp, Users, BookOpen } from 'lucide-react';

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
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome, Principal {user?.name || 'User'}
          </h1>
          <p className="text-lg text-gray-600">
            Manage your school's operations efficiently with EduFam
          </p>
        </div>

        {/* Statistics Cards */}
        <PrincipalStatsCards stats={stats} />

        {/* Key Performance Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Teachers</span>
                <span className="font-semibold">{stats.totalTeachers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Classes</span>
                <span className="font-semibold">{stats.totalClasses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subjects Offered</span>
                <span className="font-semibold">{stats.totalSubjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Parent Contacts</span>
                <span className="font-semibold">{stats.totalParents}</span>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <QuickActionsCard
              onAddTeacher={() => setAddTeacherOpen(true)}
              onAddParent={() => setAddParentOpen(true)}
              onAddClass={() => setAddClassOpen(true)}
              onAddSubject={() => setAddSubjectOpen(true)}
            />
          </div>
        </div>

        {/* Quick Actions and Assignment Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeacherSubjectAssignmentQuickAction />
          <BulkGradingQuickAction onOpenBulkGrade={() => setBulkGradingOpen(true)} />
        </div>

        {/* Class Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PrincipalAnalyticsCharts />
          <RecentActivitiesPanel recentActivities={recentActivities} />
        </div>

        {/* Operational Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PrincipalTimetableCard />
          <PrincipalAttendanceCard />
          <FinancialOverviewReadOnly />
        </div>

        {/* Quick Navigation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              School Management Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setActiveSection('school-management')}
              >
                <Users className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">Manage Staff</div>
                  <div className="text-xs text-muted-foreground">Teachers & Assignments</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setActiveSection('school-details')}
              >
                <Building2 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">School Details</div>
                  <div className="text-xs text-muted-foreground">Basic Information</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setActiveSection('certificates')}
              >
                <Award className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">Certificates</div>
                  <div className="text-xs text-muted-foreground">Generate & Manage</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setActiveSection('reports')}
              >
                <FileText className="h-6 w-6" />
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
