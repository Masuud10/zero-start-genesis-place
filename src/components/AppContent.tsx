import React, { useState, useEffect } from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import LandingPage from "@/components/LandingPage";
import ElimshaLayout from "@/components/ElimshaLayout";
import LoadingScreen from "@/components/common/LoadingScreen";
import UniversalLoginPage from "@/components/UniversalLoginPage";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import DeactivatedAccountMessage from "@/components/auth/DeactivatedAccountMessage";
import { ErrorState } from "@/components/common/LoadingStates";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { checkDatabaseConnection } from "@/integrations/supabase/client";
import { RouteGuard } from "@/utils/routeGuard";
import { AuthService } from "@/services/authService";
import { AuthUser } from "@/types/auth";
import { User } from "@supabase/supabase-js";

interface AppContentProps {
  children?: React.ReactNode;
}

const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>({ connected: true }); // Assume connected by default
  const [isCheckingDb, setIsCheckingDb] = useState(false); // Skip database check for performance
  const [accessCheck, setAccessCheck] = useState<{
    hasAccess: boolean;
    redirectTo?: string;
    error?: string;
  } | null>(null);

  // Always call useAdminAuthContext at the top level
  const authState = useAdminAuthContext();

  // Convert Supabase User to AuthUser
  const convertToAuthUser = (user: User | null): AuthUser | null => {
    if (!user) return null;
    const user_metadata =
      typeof user.user_metadata === "object" && user.user_metadata !== null
        ? (user.user_metadata as Record<string, unknown>)
        : {};
    const app_metadata =
      typeof user.app_metadata === "object" && user.app_metadata !== null
        ? (user.app_metadata as Record<string, unknown>)
        : {};
    return {
      id: String(user.id),
      email: String(user.email || ""),
      name:
        typeof user_metadata.name === "string"
          ? user_metadata.name
          : String(user.email),
      role:
        typeof user_metadata.role === "string"
          ? user_metadata.role
          : "edufam_admin",
      school_id:
        typeof user_metadata.school_id === "string"
          ? user_metadata.school_id
          : undefined,
      avatar_url:
        typeof user_metadata.avatar_url === "string"
          ? user_metadata.avatar_url
          : undefined,
      created_at:
        typeof user.created_at === "string" ? user.created_at : undefined,
      updated_at:
        typeof user.updated_at === "string" ? user.updated_at : undefined,
      user_metadata,
      app_metadata,
    };
  };

  // Removed database connection check for performance optimization
  // The authentication flow will naturally fail if database is unreachable

  // Check route access when user changes
  useEffect(() => {
    const checkRouteAccess = async () => {
      if (!authState.user) {
        setAccessCheck(null);
        return;
      }

      const currentPath = window.location.pathname;
      const routeConfig = RouteGuard.getRouteConfig(currentPath);

      const access = await RouteGuard.checkAccess(
        convertToAuthUser(authState.user),
        routeConfig
      );
      setAccessCheck(access);

      // If access is denied and we have a redirect, navigate
      if (!access.hasAccess && access.redirectTo) {
        if (access.redirectTo === "/unauthorized") {
          // Stay on current page, UnauthorizedPage will be rendered
          return;
        }
        window.location.href = access.redirectTo;
      }
    };

    checkRouteAccess();
  }, [authState.user]);

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

  const { user, isLoading: authLoading, error: authError } = authState;

  console.log("🎯 AppContent: State:", {
    authLoading,
    authError,
    hasUser: !!user,
    role: user?.role,
    email: user?.email,
    dbStatus,
    isCheckingDb,
    accessCheck,
  });

  // Show loading while checking database or auth
  if (authLoading || isCheckingDb) {
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

  // No user authenticated - this should not happen with ProtectedRoute
  if (!user) {
    console.log(
      "🎯 AppContent: No user - this should not happen with ProtectedRoute"
    );
    return <LoadingScreen />;
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

  // Check route access
  if (accessCheck && !accessCheck.hasAccess) {
    console.log("🎯 AppContent: Access denied:", accessCheck.error);

    if (accessCheck.redirectTo === "/unauthorized") {
      return <UnauthorizedPage />;
    }

    // For other redirects, show loading while redirecting
    return <LoadingScreen />;
  }

  // User is authenticated, has a valid role, and has access - show the main application
  console.log(
    "🎯 AppContent: User authenticated and authorized, showing main app"
  );

  // If children are passed, render them instead of the default layout
  if (children) {
    return (
      <NavigationProvider>
        <SchoolProvider>
          <ElimshaLayout>{children}</ElimshaLayout>
        </SchoolProvider>
      </NavigationProvider>
    );
  }

  return (
    <NavigationProvider>
      <SchoolProvider>
        <ElimshaLayout />
      </SchoolProvider>
    </NavigationProvider>
  );
};

export default AppContent;
