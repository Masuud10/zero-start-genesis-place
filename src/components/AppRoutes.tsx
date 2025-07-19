import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useConsolidatedAuth } from "@/hooks/useConsolidatedAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AdminLandingPage from "@/pages/AdminLandingPage";
import SuperAdminDashboard from "@/pages/super_admin/SuperAdminDashboard";
import SupportHrDashboard from "@/pages/support_hr/SupportHrDashboard";
import SoftwareEngineerDashboard from "@/pages/software_engineer/SoftwareEngineerDashboard";
import SalesMarketingDashboard from "@/pages/sales_marketing/SalesMarketingDashboard";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import DebugPage from "@/pages/DebugPage";

// Helper function to return the correct dashboard component based on role
const getDashboardForRole = (role: string) => {
  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "support_hr":
      return <SupportHrDashboard />;
    case "software_engineer":
      return <SoftwareEngineerDashboard />;
    case "sales_marketing":
      return <SalesMarketingDashboard />;
    case "finance":
      return <FinanceDashboard />;
    default:
      // Failsafe: If role is unknown, send back to login
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  const { user, isLoading } = useConsolidatedAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If no user is logged in, all paths lead to the login page.
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<AdminLandingPage />} />
        <Route path="/login" element={<AdminLandingPage />} />
        <Route path="/debug" element={<DebugPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If a user IS logged in, render their specific dashboard at the root path.
  return (
    <Routes>
      <Route path="/" element={getDashboardForRole(user.role)} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/debug" element={<DebugPage />} />
      {/* Add any other specific sub-routes here if needed */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
