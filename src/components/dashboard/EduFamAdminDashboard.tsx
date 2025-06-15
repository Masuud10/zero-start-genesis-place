
import React, { useState } from 'react';
import { useAdminSchoolsData } from '@/hooks/useAdminSchoolsData';
import { useAdminUsersData } from '@/hooks/useAdminUsersData';
import { calculateUserStats } from '@/utils/calculateUserStats';
import SystemOverviewCards from './edufam-admin/SystemOverviewCards';
import AdministrativeHub from './edufam-admin/AdministrativeHub';
import RecentSchoolsSection from './edufam-admin/RecentSchoolsSection';
import UserRoleBreakdown from './edufam-admin/UserRoleBreakdown';
import ErrorDisplay from './admin/ErrorDisplay';
import SystemHealthStatusCard from "@/components/analytics/SystemHealthStatusCard";
import RoleReportDownloadButton from '@/components/reports/RoleReportDownloadButton';
import DashboardModals from './DashboardModals';

interface EduFamAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const EduFamAdminDashboard = ({ onModalOpen }: EduFamAdminDashboardProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const {
    data: schoolsData = [],
    isLoading: schoolsLoading,
    error: schoolsError,
    refetch: refetchSchools,
    isRefetching: schoolsRefetching,
  } = useAdminSchoolsData(refreshKey);

  const {
    data: usersData = [],
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
    isRefetching: usersRefetching,
  } = useAdminUsersData(refreshKey);

  const handleUserCreated = () => {
    console.log('👥 EduFamAdmin: User created, refreshing data');
    setRefreshKey((prev) => prev + 1);
  };

  const handleModalOpen = (modalType: string) => {
    console.log('[EduFamAdminDashboard] handleModalOpen called with:', modalType);
    setActiveModal(modalType);
    if (onModalOpen) onModalOpen(modalType);
  };

  const handleModalClose = () => {
    console.log('[EduFamAdminDashboard] handleModalClose');
    setActiveModal(null);
  };

  const handleDataChangedInModal = () => {
    console.log('[EduFamAdminDashboard] Data changed in modal, refreshing dashboard');
    setRefreshKey((prev) => prev + 1);
    setActiveModal(null);
  };

  const handleRetryAll = () => {
    console.log('🔄 EduFamAdmin: Retrying all data fetch');
    setRefreshKey((prev) => prev + 1);
    refetchSchools();
    refetchUsers();
  };

  const handleRetrySchools = () => {
    console.log('🏫 EduFamAdmin: Retrying schools fetch');
    refetchSchools();
  };

  const userStats = React.useMemo(() => calculateUserStats(usersData), [usersData]);

  // Place report download buttons at the top for Admins
  const renderReportDownloads = () => (
    <div className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-2">
      <RoleReportDownloadButton
        type="grades"
        term={"" + (new Date().getFullYear())}
        label="Download All School Grades (Excel)"
      />
      <RoleReportDownloadButton
        type="attendance"
        term={"" + (new Date().getFullYear())}
        label="Download All School Attendance (Excel)"
      />
    </div>
  );

  // Critical error state: both queries failed
  if (schoolsError && usersError) {
    return (
      <div className="space-y-6">
        <ErrorDisplay
          schoolsError={schoolsError}
          usersError={usersError}
          onRetryAll={handleRetryAll}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Excel report download shortcuts for EduFam Admin */}
      {renderReportDownloads()}

      {/* System Health Status */}
      <SystemHealthStatusCard />

      {/* System Overview Cards */}
      <SystemOverviewCards
        schoolsCount={Array.isArray(schoolsData) ? schoolsData.length : 0}
        totalUsers={userStats.totalUsers}
        usersWithSchools={userStats.usersWithSchools}
        usersWithoutSchools={userStats.usersWithoutSchools}
        schoolsLoading={schoolsLoading}
        usersLoading={usersLoading}
        schoolsRefetching={schoolsRefetching}
        usersRefetching={usersRefetching}
      />

      {/* Administrative Hub */}
      <AdministrativeHub
        onModalOpen={handleModalOpen}
        onUserCreated={handleUserCreated}
      />

      {/* Modal Management - Only render when activeModal is set */}
      {activeModal && (
        <DashboardModals
          activeModal={activeModal}
          onClose={handleModalClose}
          user={null}
          onDataChanged={handleDataChangedInModal}
        />
      )}

      {/* Recent Schools Section */}
      <RecentSchoolsSection
        schoolsData={schoolsData}
        schoolsLoading={schoolsLoading}
        schoolsError={schoolsError}
        onModalOpen={handleModalOpen}
        onRetrySchools={handleRetrySchools}
      />

      {/* User Role Breakdown */}
      <UserRoleBreakdown
        roleBreakdown={userStats.roleBreakdown}
        totalUsers={userStats.totalUsers}
        usersLoading={usersLoading}
      />

      {/* Fallback error display for single errors */}
      {((schoolsError && !usersError) || (!schoolsError && usersError)) && (
        <ErrorDisplay
          schoolsError={schoolsError}
          usersError={usersError}
          onRetryAll={handleRetryAll}
        />
      )}
    </div>
  );
};

export default EduFamAdminDashboard;
