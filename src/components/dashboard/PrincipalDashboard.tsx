
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useNavigation } from '@/contexts/NavigationContext';
import AddTeacherModal from '../modals/AddTeacherModal';
import AddParentModal from '../modals/AddParentModal';
import AddClassModal from '../modals/AddClassModal';
import AddSubjectModal from '../modals/AddSubjectModal';
import SubjectAssignmentModal from '../modals/SubjectAssignmentModal';
import PrincipalDashboardLoading from "./PrincipalDashboardLoading";
import PrincipalDashboardErrorCard from "./PrincipalDashboardErrorCard";
import RoleGuard from '@/components/common/RoleGuard';
import QuickActionsCard from './principal/QuickActionsCard';
import RecentActivitiesPanel from './principal/RecentActivitiesPanel';
import PrincipalAnalyticsCharts from './principal/PrincipalAnalyticsCharts';
import GradeApprovalDashboard from '@/components/grading/GradeApprovalDashboard';
import PrincipalGradingModule from '@/components/grading/PrincipalGradingModule';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { usePrincipalDashboardModals } from '@/hooks/usePrincipalDashboardModals';
import BulkGradingQuickAction from './principal/BulkGradingQuickAction';
import BulkGradingModal from '../grading/BulkGradingModal';
import PrincipalAttendanceCard from './principal/PrincipalAttendanceCard';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Award, FileText, Users, BookOpen, Calendar, BarChart3 } from 'lucide-react';
import { usePrincipalAnalyticsData } from '@/hooks/usePrincipalAnalyticsData';

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isReady } = useSchoolScopedData();
  const { setActiveSection } = useNavigation();

  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'grading'>('overview');

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

  // New modal states
  const [subjectAssignmentOpen, setSubjectAssignmentOpen] = useState(false);

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
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        {/* Tab Navigation */}
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => setActiveTab('overview')}
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard Overview
              </Button>
              <Button 
                onClick={() => setActiveTab('grading')}
                variant={activeTab === 'grading' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Award className="h-4 w-4" />
                Grading Management
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTab === 'overview' ? (
          <>
            {/* Key Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Classes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <QuickActionsCard
              onAddTeacher={() => setAddTeacherOpen(true)}
              onAddParent={() => setAddParentOpen(true)}
              onAddClass={() => setAddClassOpen(true)}
              onAddSubject={() => setAddSubjectOpen(true)}
              onSubjectAssignment={() => setSubjectAssignmentOpen(true)}
            />

            {/* Bulk Grading Quick Action */}
            <BulkGradingQuickAction onOpenBulkGrade={() => setBulkGradingOpen(true)} />

            {/* Analytics Charts Section */}
            <PrincipalAnalyticsCharts />

            {/* Activities and Operational Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RecentActivitiesPanel recentActivities={recentActivities} />
              </div>
              <div className="lg:col-span-1">
                <PrincipalAttendanceCard />
              </div>
              <div className="lg:col-span-1">
                <FinancialOverviewReadOnly />
              </div>
            </div>

            {/* Quick Navigation Hub */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  School Management Hub
                </CardTitle>
                <p className="text-gray-600 text-sm">Quick access to key management areas</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                    onClick={() => setActiveSection('school-management')}
                  >
                    <Users className="h-6 w-6 text-blue-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">Manage Staff</div>
                      <div className="text-xs text-gray-500">Teachers & Assignments</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-3 hover:bg-green-50 hover:border-green-200 transition-all duration-200"
                    onClick={() => setActiveSection('timetable')}
                  >
                    <Calendar className="h-6 w-6 text-green-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">Timetable</div>
                      <div className="text-xs text-gray-500">Schedule Management</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-3 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200"
                    onClick={() => setActiveTab('grading')}
                  >
                    <Award className="h-6 w-6 text-purple-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">Grades</div>
                      <div className="text-xs text-gray-500">Academic Performance</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-3 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200"
                    onClick={() => setActiveSection('reports')}
                  >
                    <FileText className="h-6 w-6 text-orange-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">Reports</div>
                      <div className="text-xs text-gray-500">Academic & Financial</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grade Approval Section */}
            <GradeApprovalDashboard />
          </>
        ) : (
          /* Grading Management Tab */
          <PrincipalGradingModule />
        )}

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

        <SubjectAssignmentModal
          open={subjectAssignmentOpen}
          onClose={() => setSubjectAssignmentOpen(false)}
          onAssignmentCreated={handleEntityCreated}
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
