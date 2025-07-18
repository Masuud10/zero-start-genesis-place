import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import AdminLandingPage from "@/pages/AdminLandingPage";
import SupportHrDashboard from "@/pages/SupportHrDashboard";
import AppContent from "@/components/AppContent";

// Import dashboard components for different roles
import EduFamAdminDashboard from "@/components/dashboard/EduFamAdminDashboard";
import SoftwareEngineerDashboard from "@/components/dashboards/SoftwareEngineerDashboard";
import SalesMarketingDashboard from "@/components/dashboards/SalesMarketingDashboard";
import FinanceDashboard from "@/components/dashboards/FinanceDashboard";

const AppRoutes = () => {
  const { user, isLoading } = useAuthState();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // If no user is logged in, all paths should lead to the login page,
    // except for the login page itself.
    return (
      <Routes>
        <Route path="/login" element={<AdminLandingPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If a user IS logged in, route them based on their role.
  // All authenticated routes should use AppContent for consistent layout
  switch (user.role) {
    case "edufam_admin":
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
          {/* Add other edufam_admin specific routes here */}
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
          {/* Add other finance specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    default:
      // If the role is unknown or invalid, log them out.
      return <Navigate to="/login" replace />;
  }
};

export default AppRoutes;
