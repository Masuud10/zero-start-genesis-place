
import React from "react";
import { Settings, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import SchoolOwnerStatsCards, { SchoolMetrics } from "./SchoolOwnerStatsCards";
import SchoolManagementActions from "./SchoolManagementActions";
import AnalyticsSecurityGuard from "../../analytics/AnalyticsSecurityGuard";
import SchoolOwnerAnalytics from "../../analytics/SchoolOwnerAnalytics";

interface SchoolOwnerDashboardLayoutProps {
  metrics: SchoolMetrics;
  loading: boolean;
  schoolId: string | null;
  onManagementAction?: (action: string) => void; // Made optional since it's now handled internally
}

const SchoolOwnerDashboardLayout: React.FC<SchoolOwnerDashboardLayoutProps> = ({
  metrics,
  loading,
  schoolId,
  onManagementAction,
}) => (
  <div className="space-y-6">
    <SchoolOwnerStatsCards metrics={metrics} loading={loading} />

    <div className="rounded-lg bg-white/75 border shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 font-semibold text-lg">
          <Settings className="h-5 w-5" />
          Key Administrative Functions
        </div>
        <div className="mb-4 text-muted-foreground text-sm">
          Click any function below to navigate to the respective management area
        </div>
        <SchoolManagementActions onAction={onManagementAction} />
      </div>
    </div>

    <AnalyticsSecurityGuard
      requiredPermission="school"
      schoolId={schoolId}
      fallbackMessage="You need school owner permissions to view analytics."
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            School Performance Analytics
          </CardTitle>
          <CardDescription>
            Real-time insights into your school's performance and financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchoolOwnerAnalytics filters={{ term: 'current', class: 'all' }} />
        </CardContent>
      </Card>
    </AnalyticsSecurityGuard>
  </div>
);

export default SchoolOwnerDashboardLayout;
