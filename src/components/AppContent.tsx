import React, { useEffect, useState } from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";

import { checkDatabaseConnection } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ErrorState } from "@/components/common/LoadingStates";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import AdminLayout from "@/components/AdminLayout";
import { RouteGuard } from "@/utils/routeGuard";
import { AuthUser } from "@/types/auth";

interface AppContentProps {
  children?: React.ReactNode;
}

const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const {
    user,
    adminUser,
    isLoading: authLoading,
    error: authError,
  } = useAdminAuthContext();
  
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(true);
  const [accessCheck, setAccessCheck] = useState<{
    hasAccess: boolean;
    redirectTo?: string;
    error?: string;
  } | null>(null);

  // Check database connection
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

  // Check route access when user changes
  useEffect(() => {
    const checkRouteAccess = async () => {
      if (!user || !adminUser) {
        setAccessCheck(null);
        return;
      }

      const currentPath = window.location.pathname;
      const routeConfig = RouteGuard.getRouteConfig(currentPath);

      // Convert admin user to AuthUser for compatibility
      const authUser: AuthUser = {
        id: adminUser.user_id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        school_id: null, // Admin users don't have school assignments
        avatar_url: null,
        created_at: adminUser.created_at,
        updated_at: adminUser.updated_at,
        user_metadata: {},
        app_metadata: {},
        mfa_enabled: false,
        last_login_at: adminUser.last_login_at,
        last_login_ip: undefined,
      };

      const access = await RouteGuard.checkAccess(authUser, routeConfig);
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
  }, [user, adminUser]);

  // Defensive check for auth state
  if (!user || !adminUser) {
    console.error("🎯 AppContent: No user or admin user found");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description="Please log in to access the admin application."
          error="No authenticated user"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  console.log("🎯 AppContent: State:", {
    authLoading,
    authError,
    hasUser: !!user,
    hasAdminUser: !!adminUser,
    role: adminUser.role,
    email: user.email,
    dbStatus,
    isCheckingDb,
    accessCheck,
  });

  // Show loading while checking database or auth
  if (authLoading || isCheckingDb) {
    console.log("🎯 AppContent: Loading...");
    return <LoadingScreen />;
  }

  // Handle authentication errors
  if (authError) {
    console.error("🎯 AppContent: Auth error:", authError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description="There was a problem with your authentication."
          error={authError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Handle database connection errors
  if (dbStatus && !dbStatus.connected) {
    console.error("🎯 AppContent: Database connection error:", dbStatus.error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Database Connection Error"
          description="Unable to connect to the database. Please try again later."
          error={dbStatus.error || "Database connection failed"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Check if user has a valid role
  if (!adminUser.role) {
    console.log("🎯 AppContent: Admin user has no role assigned");
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

  // If children are passed, render them with AdminLayout
  if (children) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Default: show dashboard
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {adminUser.name}. You are logged in as{" "}
            {adminUser.role}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <p className="text-gray-600">
              Access your most frequently used features here.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <p className="text-gray-600">
              View your recent actions and system updates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <p className="text-gray-600">
              Check the current status of all systems.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AppContent;
