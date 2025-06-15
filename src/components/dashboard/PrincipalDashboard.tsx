
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import AddTeacherModal from '../modals/AddTeacherModal';
import AddParentModal from '../modals/AddParentModal';
import AddClassModal from '../modals/AddClassModal';
import AddSubjectModal from '../modals/AddSubjectModal';
import PrincipalStatsCards from "./principal/PrincipalStatsCards";
import PrincipalDashboardLoading from "./PrincipalDashboardLoading";
import PrincipalDashboardErrorCard from "./PrincipalDashboardErrorCard";
import RoleGuard from '@/components/common/RoleGuard';
import ReportActionsPanel from './principal/ReportActionsPanel';
import EntityPreviewPanels from './principal/EntityPreviewPanels';
import QuickActionsCard from './principal/QuickActionsCard';
import RecentActivitiesPanel from './principal/RecentActivitiesPanel';
import PrincipalManagementPanel from "./principal/PrincipalManagementPanel";
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { usePrincipalDashboardModals } from '@/hooks/usePrincipalDashboardModals';
import BulkGradingQuickAction from './principal/BulkGradingQuickAction';
import BulkGradingModal from '../modals/BulkGradingModal';
import AcademicSettings from './principal/AcademicSettings';

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isReady } = useSchoolScopedData();

  const [reloadKey, setReloadKey] = useState(0);
  const [downloadingReport, setDownloadingReport] = useState(false);

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
    return <PrincipalDashboardErrorCard error={error} onRetry={() => schoolId && fetchSchoolData(schoolId)} />;
  }

  return (
    <RoleGuard allowedRoles={['principal']} requireSchoolAssignment={true}>
      <div className="space-y-6">
        {/* Statistics cards */}
        <PrincipalStatsCards stats={stats} />
        
        {/* Academic Period Settings */}
        <AcademicSettings />

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


        <RecentActivitiesPanel recentActivities={recentActivities} />

        {/* Management panels for classes, subjects, teachers, students */}
        <PrincipalManagementPanel />

        {/* Entity preview panels for showing classes/subjects/teachers/parents */}
        <EntityPreviewPanels
          classList={classList}
          subjectList={subjectList}
          teacherList={teacherList}
          parentList={parentList}
          stats={stats}
          loading={loadingEntities}
          error={errorEntities}
          onAddSubject={() => setAddSubjectOpen(true)}
        />

        {/* Reports */}
        <ReportActionsPanel
          downloadingReport={downloadingReport}
          setDownloadingReport={setDownloadingReport}
          user={user}
          schoolId={schoolId}
          toast={toast}
        />

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
