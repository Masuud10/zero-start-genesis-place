import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { useAnalyticsPermissions } from "@/hooks/useAnalyticsPermissions";
import { useAuth } from "@/contexts/AuthContext";

interface AnalyticsSecurityGuardProps {
  children: React.ReactNode;
  requiredPermission: "system" | "school" | "class" | "student";
  schoolId?: string;
  fallbackMessage?: string;
}

const AnalyticsSecurityGuard: React.FC<AnalyticsSecurityGuardProps> = ({
  children,
  requiredPermission,
  schoolId,
  fallbackMessage,
}) => {
  const { user } = useAuth();
  const { canViewSystemAnalytics, canViewSchoolAnalytics, analyticsScope } =
    useAnalyticsPermissions();

  // Check if user is authenticated
  if (!user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            You must be logged in to access analytics.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check specific permission requirements
  const hasPermission = (() => {
    switch (requiredPermission) {
      case "system":
        return canViewSystemAnalytics;
      case "school":
        return canViewSchoolAnalytics(schoolId);
      case "class":
        return ["system", "school", "class"].includes(analyticsScope);
      case "student":
        return ["system", "school", "class", "student"].includes(
          analyticsScope
        );
      default:
        return false;
    }
  })();

  if (!hasPermission) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {fallbackMessage ||
            `You don't have permission to view ${requiredPermission}-level analytics.`}
          <div className="text-xs mt-2 opacity-75">
            Your current scope: {analyticsScope} | Required:{" "}
            {requiredPermission}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default AnalyticsSecurityGuard;
