import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "@/components/LandingPage";
import ElimshaLayout from "@/components/ElimshaLayout";
import LoadingScreen from "@/components/common/LoadingScreen";
import LoginForm from "@/components/LoginForm";
import DeactivatedAccountMessage from "@/components/auth/DeactivatedAccountMessage";
import { ErrorState } from "@/components/common/LoadingStates";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { checkDatabaseConnection } from "@/integrations/supabase/client";

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(true);

  console.log("🎯 AppContent: Render start");

  // Check database connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkDatabaseConnection();
        setDbStatus(status);
      } catch (err) {
        console.error("Failed to check database connection:", err);
        setDbStatus({ connected: false, error: "Connection check failed" });
      } finally {
        setIsCheckingDb(false);
      }
    };

    checkConnection();
  }, []);

  // Always try to get auth state safely
  let authState;
  try {
    authState = useAuth();
  } catch (err) {
    console.error("🎯 AppContent: Auth context error", err);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description="Failed to initialize authentication system"
          error={String(err)}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Defensive check for auth state
  if (!authState || typeof authState !== "object") {
    console.error("🎯 AppContent: Invalid auth state");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="System Error"
          description="Failed to retrieve authentication information."
          error="No auth context"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const {
    user,
    isLoading: authLoading,
    error: authError,
    isInitialized,
  } = authState;

  console.log("🎯 AppContent: State:", {
    authLoading,
    authError,
    hasUser: !!user,
    role: user?.role,
    email: user?.email,
    isInitialized,
    dbStatus,
    isCheckingDb,
  });

  // Show loading while checking database or auth
  if (!isInitialized || authLoading || isCheckingDb) {
    console.log("🎯 AppContent: Loading...");
    return <LoadingScreen />;
  }

  // Handle database connection errors
  if (dbStatus && !dbStatus.connected) {
    console.log("🎯 AppContent: Database connection error");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Database Connection Error"
          description="Unable to connect to the database"
          error={dbStatus.error || "Connection failed"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Handle auth errors
  if (authError) {
    console.log("🎯 AppContent: Auth error:", authError);

    // Check if the error is related to account deactivation
    if (authError.includes("deactivated") || authError.includes("inactive")) {
      return <DeactivatedAccountMessage />;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description="There was a problem with your authentication"
          error={authError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // No user authenticated - show login/landing based on URL or state
  if (!user) {
    console.log("🎯 AppContent: No user - checking URL path");

    // Check current path to determine what to show
    const currentPath = window.location.pathname;

    // If user is on login path or has requested login, show login form
    if (currentPath === "/login" || showLogin) {
      return <LoginForm />;
    }

    // Otherwise show landing page
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // Check if user account is deactivated
  if (user && user.user_metadata?.status === "inactive") {
    console.log("🎯 AppContent: User account is deactivated");
    return <DeactivatedAccountMessage />;
  }

  // Check if user has a valid role
  if (!user.role) {
    console.log("🎯 AppContent: User has no role assigned");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Account Configuration Error"
          description="Your account is not properly configured"
          error="No role assigned"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // User is authenticated and has a valid role - show the main application
  console.log("🎯 AppContent: User authenticated, showing main app");

  return (
    <NavigationProvider>
      <SchoolProvider>
        <ElimshaLayout />
      </SchoolProvider>
    </NavigationProvider>
  );
};

export default AppContent;
