import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, FileText, Calculator, PieChart } from "lucide-react";

const FinanceDashboard: React.FC = () => {
  const { adminUser } = useAdminAuthContext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {adminUser?.name}. Here's your financial overview.
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Finance Officer
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$--</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Paying schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--%</div>
            <p className="text-xs text-muted-foreground">Month over month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$--</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Financial Reports
            </CardTitle>
            <CardDescription>
              Generate and view financial reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                Financial reporting system coming soon.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Reports:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Revenue Analysis</li>
                  <li>• Subscription Metrics</li>
                  <li>• Payment Processing</li>
                  <li>• Financial Forecasting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Management
            </CardTitle>
            <CardDescription>
              Manage subscriptions and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                Advanced billing management coming soon.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Billing Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Subscription Management</li>
                  <li>• Invoice Generation</li>
                  <li>• Payment Tracking</li>
                  <li>• Revenue Analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;