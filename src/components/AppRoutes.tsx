import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import AdminLandingPage from "@/pages/AdminLandingPage";
import SupportHrDashboard from "@/pages/SupportHrDashboard";
import AppContent from "@/components/AppContent";

// Import dashboard components for different roles
// These will be created as needed
const SuperAdminDashboard = () => <div>Super Admin Dashboard</div>;
const SoftwareEngineerDashboard = () => <div>Software Engineer Dashboard</div>;
const SalesMarketingDashboard = () => <div>Sales & Marketing Dashboard</div>;
const FinanceDashboard = () => <div>Finance Dashboard</div>;

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
  switch (user.role) {
    case "super_admin":
      return (
        <Routes>
          <Route path="/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/support-hr" element={<SupportHrDashboard />} />
          {/* Add other super_admin specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case "support_hr":
      return (
        <Routes>
          <Route path="/dashboard" element={<SupportHrDashboard />} />
          {/* Add other support_hr specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case "software_engineer":
      return (
        <Routes>
          <Route path="/dashboard" element={<SoftwareEngineerDashboard />} />
          {/* Add other software_engineer specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case "sales_marketing":
      return (
        <Routes>
          <Route path="/dashboard" element={<SalesMarketingDashboard />} />
          {/* Add other sales_marketing specific routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case "finance":
      return (
        <Routes>
          <Route path="/dashboard" element={<FinanceDashboard />} />
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
