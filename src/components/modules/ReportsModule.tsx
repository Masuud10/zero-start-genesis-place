import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import SystemReportsModule from "@/components/reports/SystemReportsModule";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, TrendingUp, Users } from "lucide-react";

const ReportsModule = () => {
  const { user } = useAuth();

  // Company internal reports
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Company Reports</h2>
        <p className="text-gray-600">
          Generate internal company reports and analytics.
        </p>
      </div>

      {user?.role === "edufam_admin" && <SystemReportsModule />}

      {/* Role-specific report sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user?.role === "finance" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Financial Reports
              </CardTitle>
              <CardDescription>
                Company financial analytics and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access financial reports and budget analytics.
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role === "sales_marketing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales & Marketing Reports
              </CardTitle>
              <CardDescription>
                Sales metrics and marketing performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track sales performance and marketing campaigns.
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role === "support_hr" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                HR Reports
              </CardTitle>
              <CardDescription>
                Employee and support metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate employee reports and support analytics.
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role === "software_engineer" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Technical Reports
              </CardTitle>
              <CardDescription>
                Development and system metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access development metrics and system performance reports.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportsModule;
