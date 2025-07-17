import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import EduFamAdminDashboard from "./dashboard/EduFamAdminDashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { checkDatabaseConnection } from "@/integrations/supabase/client";
import MaintenanceNotification from "@/components/common/MaintenanceNotification";
import AdminCommunicationsBanner from "@/components/common/AdminCommunicationsBanner";

const Dashboard: React.FC = () => {
  const { user, isLoading, error: authError } = useAuth();
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(true);

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

  console.log(
    "🎯 Dashboard: Rendering for user:",
    user?.email,
    "role:",
    user?.role,
    "dbStatus:",
    dbStatus
  );

  // Show loading while checking database or auth
  if (isLoading || isCheckingDb) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    return (
      <div className="flex items-center justify-center h-64">
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
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Database connection error:{" "}
            {dbStatus.error || "Unable to connect to database"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle missing user
  if (!user || !user.role) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Only allow EduFam Admin access - all other roles are unauthorized
  const validRoles = ["edufam_admin", "elimisha_admin"];
  const normalizedRole = user.role.toLowerCase();
  
  if (!validRoles.includes(normalizedRole)) {
    console.warn("🎯 Dashboard: Unauthorized user role:", user.role);
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This is an internal EduFam admin application. 
            Your role ({user.role}) does not have access to this system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Route to EduFam Admin Dashboard only
  console.log("🎯 Dashboard: Routing to EduFam Admin Dashboard for role:", user.role);

  try {
    return (
      <div>
        <MaintenanceNotification />
        <AdminCommunicationsBanner />
        <EduFamAdminDashboard />
      </div>
    );
  } catch (error) {
    console.error("🎯 Dashboard: Error rendering dashboard:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};

export default Dashboard;
