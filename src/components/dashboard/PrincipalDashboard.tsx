
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Award, FileText, User } from 'lucide-react';

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
  } = usePrincipalDashboardModals();

  const [bulkGradingOpen, setBulkGradingOpen] = useState(false);

  const handleEntityCreated = () => {
    setReloadKey(k => k + 1);
    toast({
      title: "Success",
      description: "Entity created successfully",
    });
  };

  const handleRetry = () => {
    if (schoolId) {
      fetchSchoolData(schoolId);
    } else {
      setReloadKey(k => k + 1);
    }
  };

  if (!isReady) {
    return <PrincipalDashboardLoading />;
  }
  
  if (loading) {
    return <PrincipalDashboardLoading />;
  }
  
  if (error) {
    return <PrincipalDashboardErrorCard error={error} onRetry={handleRetry} />;
  }

  return (
    <RoleGuard allowedRoles={['principal']} requireSchoolAssignment={true}>
      <div className="space-y-6">
        {/* Statistics cards */}
        <PrincipalStatsCards stats={stats} />

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('school-registration')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">School Details</h3>
                  <p className="text-xs text-gray-600">Manage school info</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('certificates')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Certificates</h3>
                  <p className="text-xs text-gray-600">Generate certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('reports')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Reports</h3>
                  <p className="text-xs text-gray-600">Generate reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('profile')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">My Profile</h3>
                  <p className="text-xs text-gray-600">Update profile</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="bg-white/90 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">School Performance Analytics</h2>
          <PrincipalAnalyticsCharts />
        </div>

        {/* Grade Approval Dashboard - Principal's key responsibility */}
        <div className="bg-white/90 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Grade Management & Approval</h2>
          <GradeApprovalDashboard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick action panel for adding parent/teacher/class */}
          <QuickActionsCard
            onAddParent={() => setAddParentOpen(true)}
            onAddTeacher={() => setAddTeacherOpen(true)}
            onAddClass={() => setAddClassOpen(true)}
          />
          {/* Bulk Grading Action */}
          <BulkGradingQuickAction onOpenBulkGrade={() => setBulkGradingOpen(true)} />
        </div>

        {/* Financial Overview - Read Only (without Add Expense button) */}
        <FinancialOverviewReadOnly />

        {/* Timetable Management Card */}
        <PrincipalTimetableCard />

        {/* Attendance Management Card */}
        <PrincipalAttendanceCard />

        <RecentActivitiesPanel recentActivities={recentActivities} />

        {/* MODALS */}
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
        {bulkGradingOpen && <BulkGradingModal onClose={() => setBulkGradingOpen(false)} />}
      </div>
    </RoleGuard>
  );
};

export default PrincipalDashboard;
