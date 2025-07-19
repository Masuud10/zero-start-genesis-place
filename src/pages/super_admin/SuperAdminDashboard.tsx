import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { useNavigation } from "@/contexts/NavigationContext";

// Import all the management pages
import AdminUserManagementPage from "./AdminUserManagementPage";
import SchoolUserManagementPage from "./SchoolUserManagementPage";
import SchoolsManagementPage from "./SchoolsManagementPage";
import SchoolAnalyticsPage from "./SchoolAnalyticsPage";

// Import modals
import MaintenanceModeModal from "@/components/dashboard/modals/MaintenanceModeModal";
import DatabaseSettingsModal from "@/components/dashboard/modals/DatabaseSettingsModal";
import SecuritySettingsModal from "@/components/dashboard/modals/SecuritySettingsModal";
import NotificationSettingsModal from "@/components/dashboard/modals/NotificationSettingsModal";
import CompanyDetailsModal from "@/components/dashboard/modals/CompanyDetailsModal";

const SuperAdminDashboard = () => {
  const { currentPage } = useNavigation();

  // Modal states
  const [showMaintenanceMode, setShowMaintenanceMode] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  // Handle navigation based on currentPage
  React.useEffect(() => {
    switch (currentPage) {
      case "Maintenance Mode":
        setShowMaintenanceMode(true);
        break;
      case "Database Settings":
        setShowDatabaseSettings(true);
        break;
      case "Security Settings":
        setShowSecuritySettings(true);
        break;
      case "Notification Settings":
        setShowNotificationSettings(true);
        break;
      case "Company Details":
        setShowCompanyDetails(true);
        break;
      default:
        // Close all modals when navigating to other pages
        setShowMaintenanceMode(false);
        setShowDatabaseSettings(false);
        setShowSecuritySettings(false);
        setShowNotificationSettings(false);
        setShowCompanyDetails(false);
        break;
    }
  }, [currentPage]);

  const renderContent = () => {
    switch (currentPage) {
      case "Admin User Management":
        return <AdminUserManagementPage />;
      case "School User Management":
        return <SchoolUserManagementPage />;
      case "Schools Management":
        return <SchoolsManagementPage />;
      case "School Analytics":
        return <SchoolAnalyticsPage />;
      case "Dashboard Overview":
      default:
        return (
          <DashboardOverview
            role="super_admin"
            greeting="Good morning"
            userName="Super Admin"
          />
        );
    }
  };

  return (
    <AdminLayout>
      {renderContent()}

      {/* Modals */}
      <MaintenanceModeModal
        isOpen={showMaintenanceMode}
        onClose={() => setShowMaintenanceMode(false)}
      />
      <DatabaseSettingsModal
        isOpen={showDatabaseSettings}
        onClose={() => setShowDatabaseSettings(false)}
      />
      <SecuritySettingsModal
        isOpen={showSecuritySettings}
        onClose={() => setShowSecuritySettings(false)}
      />
      <NotificationSettingsModal
        open={showNotificationSettings}
        onOpenChange={setShowNotificationSettings}
      />
      <CompanyDetailsModal
        open={showCompanyDetails}
        onOpenChange={setShowCompanyDetails}
      />
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
