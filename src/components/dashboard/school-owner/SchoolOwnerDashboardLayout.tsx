
import React from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import SchoolOwnerStatsCards, { SchoolMetrics } from "./SchoolOwnerStatsCards";
import SchoolManagementActions from "./SchoolManagementActions";
import AnalyticsSecurityGuard from "../../analytics/AnalyticsSecurityGuard";
import SchoolOwnerAnalytics from "../../analytics/SchoolOwnerAnalytics";

interface SchoolOwnerDashboardLayoutProps {
  metrics: SchoolMetrics;
  loading: boolean;
  schoolId: string | null;
  onManagementAction?: (action: string) => void;
}

const SchoolOwnerDashboardLayout: React.FC<SchoolOwnerDashboardLayoutProps> = ({
  metrics,
  loading,
  schoolId,
  onManagementAction,
}) => (
  <div className="space-y-6">
    <SchoolOwnerStatsCards metrics={metrics} loading={loading} />

    {/* Analytics Overview Section */}
    <AnalyticsSecurityGuard
      requiredPermission="school"
      schoolId={schoolId}
      fallbackMessage="You need school owner permissions to view analytics."
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <BarChart3 className="h-6 w-6" />
            Analytics Overview
          </CardTitle>
          <CardDescription className="text-blue-100">
            Real-time insights and performance data for your school
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <SchoolOwnerAnalytics filters={{ term: 'current', class: 'all' }} />
        </CardContent>
      </Card>
    </AnalyticsSecurityGuard>

    <div className="rounded-lg bg-white/75 border shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 font-semibold text-lg">
          <BarChart3 className="h-5 w-5" />
          School Management Overview
        </div>
        <div className="mb-4 text-muted-foreground text-sm">
          Monitor and oversee your school's key management areas
        </div>
        <SchoolManagementActions onAction={onManagementAction} />
      </div>
    </div>
  </div>
);

export default SchoolOwnerDashboardLayout;
