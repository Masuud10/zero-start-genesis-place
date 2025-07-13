import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/common/LoadingScreen";

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // While we check for a user, show a loading screen
    return <LoadingScreen />;
  }

  if (!user) {
    // If there is no user, redirect them to the login page immediately.
    return <Navigate to="/login" replace />;
  }

  // If there is a user, render the requested dashboard page.
  return <Outlet />;
};

export default ProtectedRoute;
