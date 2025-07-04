import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield, Database, User } from "lucide-react";
import { checkDatabaseConnection } from "@/integrations/supabase/client";

interface DashboardWrapperProps {
  children: React.ReactNode;
  requiredRole?: string[];
  requireSchoolAssignment?: boolean;
  title?: string;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  children,
  requiredRole = [],
  requireSchoolAssignment = false,
  title = "Dashboard",
}) => {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { schoolId, isReady: schoolReady } = useSchoolScopedData();
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(true);
  const [healthChecks, setHealthChecks] = useState({
    auth: false,
    database: false,
    school: false,
    role: false,
  });

  // Check database connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkDatabaseConnection();
        setDbStatus(status);
        setHealthChecks((prev) => ({ ...prev, database: status.connected }));
      } catch (err) {
        console.error("Failed to check database connection:", err);
        setDbStatus({ connected: false, error: "Connection check failed" });
        setHealthChecks((prev) => ({ ...prev, database: false }));
      } finally {
        setIsCheckingDb(false);
      }
    };

    checkConnection();
  }, []);

  // Update health checks based on auth and school state
  useEffect(() => {
    setHealthChecks((prev) => ({
      ...prev,
      auth: !authLoading && !authError && !!user,
      school: schoolReady && (!requireSchoolAssignment || !!schoolId),
      role:
        !authLoading &&
        !!user &&
        (requiredRole.length === 0 || requiredRole.includes(user.role)),
    }));
  }, [
    authLoading,
    authError,
    user,
    schoolReady,
    schoolId,
    requireSchoolAssignment,
    requiredRole,
  ]);

  console.log("🛡️ DashboardWrapper: Health checks:", healthChecks, {
    authLoading,
    authError,
    userRole: user?.role,
    schoolId,
    schoolReady,
    dbStatus,
  });

  // Show loading while checking database or auth
  if (authLoading || isCheckingDb) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Authentication error: {authError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle database connection errors
  if (dbStatus && !dbStatus.connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Database connection error:{" "}
            {dbStatus.error || "Unable to connect to database"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle missing user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <User className="h-4 w-4" />
          <AlertDescription>
            Please log in to access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle role validation
  if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this dashboard. Required role:{" "}
            {requiredRole.join(" or ")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle school assignment requirement
  if (requireSchoolAssignment && !schoolId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account needs to be assigned to a school. Please contact your
            administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // All checks passed - render the dashboard with error boundary
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Dashboard error caught by wrapper:", error, errorInfo);
      }}
    >
      <div className="dashboard-wrapper">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user.name || user.email}
              </p>
            )}
          </div>
        )}

        {/* Health status indicator (development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <div className="font-medium mb-1">Health Status:</div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`flex items-center gap-1 ${
                  healthChecks.auth ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    healthChecks.auth ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                Auth: {healthChecks.auth ? "OK" : "Failed"}
              </div>
              <div
                className={`flex items-center gap-1 ${
                  healthChecks.database ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    healthChecks.database ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                DB: {healthChecks.database ? "OK" : "Failed"}
              </div>
              <div
                className={`flex items-center gap-1 ${
                  healthChecks.school ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    healthChecks.school ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                School: {healthChecks.school ? "OK" : "Failed"}
              </div>
              <div
                className={`flex items-center gap-1 ${
                  healthChecks.role ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    healthChecks.role ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                Role: {healthChecks.role ? "OK" : "Failed"}
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardWrapper;
