import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import AdminLandingPage from "@/pages/AdminLandingPage";
import SupportHrDashboard from "@/pages/SupportHrDashboard";
import AppContent from "@/components/AppContent";
import AuthDebugger from "@/components/debug/AuthDebugger";

// Import dashboard components for different roles
import EduFamAdminDashboard from "@/components/dashboard/EduFamAdminDashboard";
import SoftwareEngineerDashboard from "@/components/dashboards/SoftwareEngineerDashboard";
import SalesMarketingDashboard from "@/components/dashboards/SalesMarketingDashboard";
import FinanceDashboard from "@/components/dashboards/FinanceDashboard";

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !adminUser) {
    // If no user is logged in, all paths should lead to the login page,
    // except for the login page itself.
    return (
      <Routes>
        <Route path="/" element={<AdminLandingPage />} />
        <Route path="/login" element={<AdminLandingPage />} />
        <Route path="/debug" element={<AuthDebugger />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If a user IS logged in and is an admin, route them based on their role.
  // All authenticated routes should use AppContent for consistent layout
  switch (adminUser.role) {
    case "super_admin":
      return (
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AppContent>
                <EduFamAdminDashboard />
              </AppContent>
            }
          />
          <Route
            path="/support-hr"
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case "support_hr":
      return (
        <Routes>
          <Route
            path="/dashboard"
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
          {/* Add other support_hr specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case "software_engineer":
      return (
        <Routes>
          <Route
            path="/dashboard"
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
          {/* Add other software_engineer specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case "sales_marketing":
      return (
        <Routes>
          <Route
            path="/dashboard"
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
          {/* Add other sales_marketing specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case "finance":
      return (
        <Routes>
          <Route
            path="/dashboard"
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
          {/* Add other finance specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    default:
      // Unknown role - redirect to login
      console.error("🛣️ AppRoutes: Unknown role:", adminUser.role);
      return (
        <Routes>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
  }
};

export default AppRoutes;
