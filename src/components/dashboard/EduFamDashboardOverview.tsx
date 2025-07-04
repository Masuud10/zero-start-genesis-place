import React, { useState } from "react";
import { useAdminSchoolsData } from "@/hooks/useAdminSchoolsData";
import { useAdminUsersData } from "@/hooks/useAdminUsersData";
import { calculateUserStats } from "@/utils/calculateUserStats";
import SystemOverviewCards from "./admin/SystemOverviewCards";
import AdministrativeHub from "./edufam-admin/AdministrativeHub";
import RecentSchoolsSection from "./admin/RecentSchoolsSection";
import UserRoleBreakdown from "./admin/UserRoleBreakdown";
import ErrorDisplay from "./admin/ErrorDisplay";
import SystemHealthStatusCard from "@/components/analytics/SystemHealthStatusCard";
import EduFamAnalyticsOverview from "@/components/analytics/EduFamAnalyticsOverview";
import DetailedAnalyticsModal from "@/components/analytics/DetailedAnalyticsModal";
import DashboardModals from "./DashboardModals";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const EduFamDashboardOverview = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const { onSectionChange } = useNavigation();
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
  const validSchoolsData = Array.isArray(schoolsData) ? schoolsData : [];
  const validUsersData = Array.isArray(usersData) ? usersData : [];
  const userStats = React.useMemo(
    () => calculateUserStats(validUsersData),
    [validUsersData]
  );
  const roleBreakdownRecord = React.useMemo(() => {
    return userStats.roleBreakdown.reduce((acc, item) => {
      acc[item.role] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }, [userStats.roleBreakdown]);
  const isRoleLoaded = !!user && !!user.role;
  if (!isRoleLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Permission check - only edufam_admin should access this dashboard
  if (user.role !== "edufam_admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Access denied. Only EduFam Administrators can access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleStatsCardClick = (cardType: string) => {
    console.log("📊 EduFamDashboard: Stats card clicked:", cardType);

    const sectionMappings: { [key: string]: string } = {
      schools: "schools",
      users: "users",
      "users-with-schools": "users",
      "users-without-schools": "users",
    };

    if (sectionMappings[cardType]) {
      onSectionChange(sectionMappings[cardType]);
    }
  };

  const handleModalOpen = (modalType: string) => {
    console.log("📊 EduFamDashboard: Opening modal:", modalType);
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    console.log("📊 EduFamDashboard: Closing modal");
    setActiveModal(null);
  };

  const handleUserCreated = () => {
    console.log("📊 EduFamDashboard: User created, refreshing data");
    setRefreshKey((prev) => prev + 1);
  };

  const handleDataChangedInModal = () => {
    console.log("📊 EduFamDashboard: Data changed in modal, refreshing");
    setRefreshKey((prev) => prev + 1);
  };

  const handleRetrySchools = () => {
    console.log("📊 EduFamDashboard: Retrying schools data fetch");
    refetchSchools();
  };

  const handleRetryUsers = () => {
    console.log("📊 EduFamDashboard: Retrying users data fetch");
    refetchUsers();
  };

  const handleRetryAll = () => {
    console.log("📊 EduFamDashboard: Retrying all data fetches");
    setRefreshKey((prev) => prev + 1);
  };

  const handleAnalyticsAction = (action: string) => {
    console.log("📊 EduFamDashboard: Analytics action:", action);

    if (action === "view-detailed-analytics") {
      setShowDetailedAnalytics(true);
    } else if (action === "export-analytics") {
      // Export functionality is handled within the analytics component
      console.log("Exporting analytics data...");
    }
  };

  // Critical error state: both queries failed
  if (schoolsError && usersError) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            EduFam Admin Dashboard
          </h1>
          <Button onClick={handleRetryAll} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry All
          </Button>
        </div>
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
      {/* Stats Overview Cards with Click Handlers */}
      <SystemOverviewCards
        schoolsCount={validSchoolsData.length}
        totalUsers={userStats.totalUsers}
        usersWithSchools={userStats.usersWithSchools}
        usersWithoutSchools={userStats.usersWithoutSchools}
        schoolsLoading={schoolsLoading}
        usersLoading={usersLoading}
        schoolsRefetching={schoolsRefetching}
        usersRefetching={usersRefetching}
        onStatsCardClick={handleStatsCardClick}
      />

      {/* Real-Time Analytics Overview with Action Handlers */}
      <EduFamAnalyticsOverview onAnalyticsAction={handleAnalyticsAction} />

      {/* System Health Status */}
      <SystemHealthStatusCard />

      {/* Administrative Hub - System Management Center */}
      <AdministrativeHub
        onModalOpen={handleModalOpen}
        onUserCreated={handleUserCreated}
      />

      {/* Modal Management - Only render when activeModal is set */}
      {activeModal && (
        <DashboardModals
          activeModal={activeModal}
          onClose={handleModalClose}
          user={user}
          onDataChanged={handleDataChangedInModal}
        />
      )}

      {/* Detailed Analytics Modal */}
      <DetailedAnalyticsModal
        isOpen={showDetailedAnalytics}
        onClose={() => setShowDetailedAnalytics(false)}
      />

      {/* Recent Schools Section */}
      <RecentSchoolsSection
        schoolsData={validSchoolsData}
        schoolsLoading={schoolsLoading}
        schoolsError={schoolsError}
        onModalOpen={handleModalOpen}
        onRetrySchools={handleRetrySchools}
      />

      {/* User Role Breakdown */}
      <UserRoleBreakdown
        roleBreakdown={roleBreakdownRecord}
        totalUsers={userStats.totalUsers}
        usersLoading={usersLoading}
      />

      {/* Fallback error display for single errors */}
      {schoolsError && !usersError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load schools data.{" "}
            <Button
              onClick={handleRetrySchools}
              variant="link"
              className="p-0 h-auto font-normal"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {usersError && !schoolsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users data.{" "}
            <Button
              onClick={handleRetryUsers}
              variant="link"
              className="p-0 h-auto font-normal"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EduFamDashboardOverview;
