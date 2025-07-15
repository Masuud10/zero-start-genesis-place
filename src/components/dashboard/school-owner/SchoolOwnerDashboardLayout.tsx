import React from "react";
import { BarChart3 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import SchoolOwnerStatsCards, { SchoolMetrics } from "./SchoolOwnerStatsCards";
import SchoolManagementActions from "./SchoolManagementActions";
import ExpenseApprovalsSection from "./ExpenseApprovalsSection";
import AnalyticsSecurityGuard from "../../analytics/AnalyticsSecurityGuard";
import SecureSchoolOwnerAnalytics from "../../analytics/SecureSchoolOwnerAnalytics";

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

    {/* Secure Analytics Overview Section */}
    <AnalyticsSecurityGuard
      requiredPermission="school"
      schoolId={schoolId}
      fallbackMessage="You need school owner permissions to view analytics."
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <BarChart3 className="h-6 w-6" />
            Secure Analytics Overview
          </CardTitle>
          <CardDescription>
            Real-time insights and performance data with enhanced security
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <SecureSchoolOwnerAnalytics
            filters={{ term: "current", class: "all" }}
          />
        </CardContent>
      </Card>
    </AnalyticsSecurityGuard>

    {/* Expense Approvals Section */}
    <ExpenseApprovalsSection schoolId={schoolId} />

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
