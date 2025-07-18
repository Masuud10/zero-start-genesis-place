import React, { useEffect, useState } from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";

import { checkDatabaseConnection } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ErrorState } from "@/components/common/LoadingStates";
import AdminLayout from "@/components/AdminLayout";

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
