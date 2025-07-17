import React, { memo, useMemo, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import MaintenanceNotification from "@/components/common/MaintenanceNotification";
import AdminCommunicationsBanner from "@/components/common/AdminCommunicationsBanner";

// Lazy load only EduFam admin dashboard and core admin modules
const EduFamAdminDashboard = React.lazy(
  () => import("@/components/dashboard/EduFamAdminDashboard")
);

// Core Admin Modules
const SchoolsModule = React.lazy(
  () => import("@/components/modules/SchoolsModule")
);
import UsersModule from "@/components/modules/UsersModule";
const BillingModule = React.lazy(
  () => import("@/components/modules/BillingModule")
);
const SystemHealthModule = React.lazy(
  () => import("@/components/modules/SystemHealthModule")
);
const SecurityModule = React.lazy(
  () => import("@/components/modules/SecurityModule")
);
const SupportModule = React.lazy(
  () => import("@/components/modules/SupportModule")
);
const CompanyManagementModule = React.lazy(
  () => import("@/components/modules/CompanyManagementModule")
);
const EduFamSystemSettings = React.lazy(
  () => import("@/components/modules/settings/EduFamSystemSettings")
);
const EduFamAnalyticsOverview = React.lazy(
  () => import("@/components/analytics/EduFamAnalyticsOverview")
);
const SchoolAnalyticsList = React.lazy(
  () => import("@/components/analytics/SchoolAnalyticsList")
);

interface ContentRendererProps {
  activeSection: string;
  onModalOpen?: (modalType: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = memo(
  ({ activeSection }) => {
    const { user } = useAuth();

    console.log(
      "📋 ContentRenderer: Rendering section:",
      activeSection,
      "for user role:",
      user?.role
    );

    // Only allow EduFam Admin access to everything
    const isEduFamAdmin = user?.role === "edufam_admin" || user?.role === "elimisha_admin";

    // Memoize dashboard component to prevent unnecessary re-renders
    const dashboardComponent = useMemo(() => {
      if (activeSection !== "dashboard") return null;

      // Only allow EduFam admin access
      if (isEduFamAdmin) {
        return <EduFamAdminDashboard />;
      }
      
      // All other roles are unauthorized
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>This is an internal EduFam admin application.</p>
          <p>Your role ({user?.role}) does not have access to this system.</p>
        </div>
      );
    }, [activeSection, user?.role, isEduFamAdmin]);

    // Return dashboard component if it's the dashboard section
    if (dashboardComponent) {
      return (
        <div>
          <MaintenanceNotification />
          <AdminCommunicationsBanner />
          {dashboardComponent}
        </div>
      );
    }

    // Render sections with lazy loading and error boundaries
    const renderLazyComponent = (
      Component: React.LazyExoticComponent<React.ComponentType<any>>,
      componentName?: string,
      props?: any
    ) => {
      return (
        <div>
          <MaintenanceNotification />
          <AdminCommunicationsBanner />
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error(
                `🚨 Error in ${componentName || "component"}:`,
                error,
                errorInfo
              );
            }}
          >
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-pulse flex items-center gap-2">
                    <div className="h-6 w-6 bg-primary/20 rounded animate-spin"></div>
                    <span className="text-muted-foreground">
                      Loading {componentName || "component"}...
                    </span>
                  </div>
                </div>
              }
            >
              <Component {...props} />
            </React.Suspense>
          </ErrorBoundary>
        </div>
      );
    };

    // Render unauthorized access message
    const renderUnauthorizedAccess = () => (
      <div>
        <MaintenanceNotification />
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>This is an internal EduFam admin application.</p>
          <p>Your role ({user?.role}) does not have access to this system.</p>
        </div>
      </div>
    );

    // Check if user is EduFam admin for all sections
    if (!isEduFamAdmin) {
      return renderUnauthorizedAccess();
    }

    // Core Admin Sections - Only accessible by EduFam Admins
    switch (activeSection) {
      case "settings":
        return renderLazyComponent(
          EduFamSystemSettings,
          "EduFamSystemSettings"
        );

      case "analytics":
        return renderLazyComponent(
          EduFamAnalyticsOverview,
          "EduFamAnalyticsOverview"
        );

      case "school-analytics":
        return renderLazyComponent(
          SchoolAnalyticsList,
          "SchoolAnalyticsList"
        );

      case "company-management":
        return renderLazyComponent(
          CompanyManagementModule,
          "CompanyManagementModule"
        );

      case "schools":
        return renderLazyComponent(SchoolsModule, "SchoolsModule");

      case "users":
        return <UsersModule />;

      case "billing":
        return renderLazyComponent(BillingModule, "BillingModule");

      case "maintenance":
      case "system-health":
        return renderLazyComponent(SystemHealthModule, "SystemHealthModule");

      case "security":
        return renderLazyComponent(SecurityModule, "SecurityModule");

      case "support":
        return renderLazyComponent(SupportModule, "SupportModule");

      default:
        console.warn("📋 ContentRenderer: Unknown section:", activeSection);
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Section Not Available: {activeSection}
              </h3>
              <p className="text-gray-600">
                This section is not available in the EduFam admin application.
              </p>
            </div>
          </div>
        );
    }
  }
);

ContentRenderer.displayName = "ContentRenderer";

export default ContentRenderer;
