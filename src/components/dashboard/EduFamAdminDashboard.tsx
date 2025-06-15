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
import ReportDownloadPanel from '@/components/reports/ReportDownloadPanel';
import DashboardModals from './DashboardModals';

interface EduFamAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const EduFamAdminDashboard = ({ onModalOpen }: EduFamAdminDashboardProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Use separated hooks for fetching
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
    setRefreshKey(prev => prev + 1);
  };

  // Always pass local handleModalOpen to AdministrativeHub and modals!
  const handleModalOpen = (modalType: string) => {
    console.log('[EduFamAdminDashboard] handleModalOpen called with:', modalType);
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    console.log('[EduFamAdminDashboard] handleModalClose');
    setActiveModal(null);
  };

  // Called from modals (SchoolsModule, UsersModule) after data has changed
  const handleDataChangedInModal = () => {
    console.log('[EduFamAdminDashboard] Data changed in modal, refreshing dashboard');
    setRefreshKey(prev => prev + 1);
    setActiveModal(null);
  };

  const handleRetryAll = () => {
    console.log('🔄 EduFamAdmin: Retrying all data fetch');
    setRefreshKey(prev => prev + 1);
    refetchSchools();
    refetchUsers();
  };

  const handleRetrySchools = () => {
    console.log('🏫 EduFamAdmin: Retrying schools fetch');
    refetchSchools();
  };

  const userStats = React.useMemo(() => calculateUserStats(usersData), [usersData]);

  /* Comprehensive error state: both queries failed. */
  if (schoolsError && usersError) {
    return <ErrorDisplay schoolsError={schoolsError} usersError={usersError} onRetryAll={handleRetryAll} />;
  }

  return (
    <div className="space-y-6">
      <SystemHealthStatusCard />

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

      {/* Pass correct handleModalOpen property! */}
      <AdministrativeHub
        onModalOpen={handleModalOpen}
        onUserCreated={handleUserCreated}
      />

      {/* Admin modals */}
      <DashboardModals
        activeModal={activeModal}
        onClose={handleModalClose}
        user={null}
        onDataChanged={handleDataChangedInModal}
      />

      <RecentSchoolsSection
        schoolsData={schoolsData}
        schoolsLoading={schoolsLoading}
        schoolsError={schoolsError}
        onModalOpen={handleModalOpen}
        onRetrySchools={handleRetrySchools}
      />

      <UserRoleBreakdown
        roleBreakdown={userStats.roleBreakdown}
        totalUsers={userStats.totalUsers}
        usersLoading={usersLoading}
      />

      {(schoolsError || usersError) && (
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
