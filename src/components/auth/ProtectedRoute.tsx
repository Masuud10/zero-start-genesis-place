import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";

const ProtectedRoute: React.FC = () => {
  const { user, adminUser, isLoading } = useAdminAuthContext();

  if (isLoading) {
    // While we check for a user, show a loading screen
    return <LoadingScreen />;
  }

  if (!user || !adminUser) {
    // If there is no user or admin user, redirect them to the login page immediately.
    return <Navigate to="/" replace />;
  }

  // If there is a user, render the requested dashboard page.
  return <Outlet />;
};

export default ProtectedRoute;
