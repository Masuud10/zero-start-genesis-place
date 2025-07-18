import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import AdminLandingPage from "@/pages/AdminLandingPage";
import SupportHrDashboard from "@/pages/SupportHrDashboard";
import AppContent from "@/components/AppContent";
import AuthDebugger from "@/components/debug/AuthDebugger";
import AuthenticationTest from "@/components/debug/AuthenticationTest";

// Import dashboard components for different roles
import EduFamAdminDashboard from "@/components/dashboard/EduFamAdminDashboard";
import SoftwareEngineerDashboard from "@/components/dashboards/SoftwareEngineerDashboard";
import SalesMarketingDashboard from "@/components/dashboards/SalesMarketingDashboard";
import FinanceDashboard from "@/components/dashboards/FinanceDashboard";

// Helper function to determine the correct home page for each role
const getHomeRouteForRole = (role: string) => {
  switch (role) {
    case "super_admin":
      return "/dashboard";
    case "edufam_admin":
      return "/dashboard";
    case "support_hr":
      return "/support-hr";
    case "software_engineer":
      return "/software-engineer";
    case "sales_marketing":
      return "/sales-marketing";
    case "finance":
      return "/finance";
    default:
      return "/login"; // Failsafe
  }
};

const AppRoutes = () => {
  const { user, adminUser, isLoading, error } = useAdminAuthContext();

  console.log("🛣️ AppRoutes: Auth state:", {
    hasUser: !!user,
    hasAdminUser: !!adminUser,
    isLoading,
    error,
    userRole: adminUser?.role,
    userEmail: user?.email,
  });

  // Show loading spinner while authentication is being determined
  if (isLoading) {
    console.log("🛣️ AppRoutes: Showing loading spinner");
    return <LoadingSpinner />;
  }

  // If no user is logged in, force redirect to the login page.
  if (!user || !adminUser) {
    console.log(
      "🛣️ AppRoutes: No authenticated admin user, showing login page"
    );
    return (
      <Routes>
        <Route path="/" element={<AdminLandingPage />} />
        <Route path="/login" element={<AdminLandingPage />} />
        <Route path="/debug" element={<AuthDebugger />} />
        <Route path="/test" element={<AuthenticationTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  console.log(
    "🛣️ AppRoutes: Authenticated admin user found, routing to dashboard based on role:",
    adminUser.role
  );

  // If a user IS logged in, route them based on their role.
  return (
    <Routes>
      <Route
        path="/login"
        element={<Navigate to={getHomeRouteForRole(adminUser.role)} replace />}
      />

      {/* Super Admin Routes - EXCLUSIVE ACCESS TO ORIGINAL DASHBOARD */}
      {adminUser.role === "super_admin" && (
        <>
          <Route
            path="/dashboard/*"
            element={
              <AppContent>
                <EduFamAdminDashboard />
              </AppContent>
            }
          />
          <Route
            path="/debug"
            element={
              <AppContent>
                <AuthDebugger />
              </AppContent>
            }
          />
          <Route
            path="/test"
            element={
              <AppContent>
                <AuthenticationTest />
              </AppContent>
            }
          />
        </>
      )}

      {/* EduFam Admin Routes - ACCESS TO ORIGINAL DASHBOARD */}
      {adminUser.role === "edufam_admin" && (
        <>
          <Route
            path="/dashboard/*"
            element={
              <AppContent>
                <EduFamAdminDashboard />
              </AppContent>
            }
          />
          <Route
            path="/debug"
            element={
              <AppContent>
                <AuthDebugger />
              </AppContent>
            }
          />
          <Route
            path="/test"
            element={
              <AppContent>
                <AuthenticationTest />
              </AppContent>
            }
          />
        </>
      )}

      {/* Support & HR Routes */}
      {adminUser.role === "support_hr" && (
        <>
          <Route
            path="/support-hr/*"
            element={
              <AppContent>
                <SupportHrDashboard />
              </AppContent>
            }
          />
          <Route
            path="/debug"
            element={
              <AppContent>
                <AuthDebugger />
              </AppContent>
            }
          />
          <Route
            path="/test"
            element={
              <AppContent>
                <AuthenticationTest />
              </AppContent>
            }
          />
        </>
      )}

      {/* Software Engineer Routes */}
      {adminUser.role === "software_engineer" && (
        <>
          <Route
            path="/software-engineer/*"
            element={
              <AppContent>
                <SoftwareEngineerDashboard />
              </AppContent>
            }
          />
          <Route
            path="/debug"
            element={
              <AppContent>
                <AuthDebugger />
              </AppContent>
            }
          />
          <Route
            path="/test"
            element={
              <AppContent>
                <AuthenticationTest />
              </AppContent>
            }
          />
        </>
      )}

      {/* Sales & Marketing Routes */}
      {adminUser.role === "sales_marketing" && (
        <>
          <Route
            path="/sales-marketing/*"
            element={
              <AppContent>
                <SalesMarketingDashboard />
              </AppContent>
            }
          />
          <Route
            path="/debug"
            element={
              <AppContent>
                <AuthDebugger />
              </AppContent>
            }
          />
          <Route
            path="/test"
            element={
              <AppContent>
                <AuthenticationTest />
              </AppContent>
            }
          />
        </>
      )}

      {/* Finance Routes */}
      {adminUser.role === "finance" && (
        <>
          <Route
            path="/finance/*"
            element={
              <AppContent>
                <FinanceDashboard />
              </AppContent>
            }
          />
          <Route
            path="/debug"
            element={
              <AppContent>
                <AuthDebugger />
              </AppContent>
            }
          />
          <Route
            path="/test"
            element={
              <AppContent>
                <AuthenticationTest />
              </AppContent>
            }
          />
        </>
      )}

      {/* Default redirect for logged-in users */}
      <Route
        path="*"
        element={<Navigate to={getHomeRouteForRole(adminUser.role)} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
