
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import SchoolOwnerAnalytics from "./SchoolOwnerAnalytics";
import PrincipalAnalytics from "./PrincipalAnalytics";
import TeacherAnalytics from "./TeacherAnalytics";
import ParentAnalytics from "./ParentAnalytics";
import FinanceOfficerAnalytics from "./FinanceOfficerAnalytics";
import EduFamAdminAnalytics from "./EduFamAdminAnalytics";

interface RoleAnalyticsRendererProps {
  role: string;
  filters: {
    term: string;
    class: string;
    subject: string;
    dateRange: string;
  };
}

const RoleAnalyticsRenderer: React.FC<RoleAnalyticsRendererProps> = ({ role, filters }) => {
  try {
    switch (role) {
      case "school_owner":
        return <SchoolOwnerAnalytics filters={filters} />;
      case "principal":
        return <PrincipalAnalytics filters={filters} />;
      case "teacher":
        return <TeacherAnalytics filters={filters} />;
      case "parent":
        return <ParentAnalytics filters={filters} />;
      case "finance_officer":
        return <FinanceOfficerAnalytics filters={filters} />;
      case "edufam_admin":
        return <EduFamAdminAnalytics />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don&apos;t have permission to view analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  Role &quot;{role}&quot; is not authorized for analytics access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );
    }
  } catch (error) {
    console.error("📊 RoleAnalyticsRenderer: Error rendering analytics:", error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Analytics Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load analytics component. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
};

export default RoleAnalyticsRenderer;
