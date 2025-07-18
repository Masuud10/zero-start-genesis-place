import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import UnifiedDashboardLayout from "@/components/dashboard/UnifiedDashboardLayout";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  Calculator,
  PieChart,
  BarChart3,
  Activity,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Award,
  Building2,
  UserPlus,
  Calendar,
  Users,
  Target,
  Star,
  DollarSign as DollarSignIcon,
  CreditCard as CreditCardIcon,
  FileText as FileTextIcon,
  Calculator as CalculatorIcon,
} from "lucide-react";

const FinanceDashboard: React.FC = () => {
  const { adminUser } = useAdminAuthContext();

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Implement quick actions here
  };

  const stats = [
    {
      label: "Monthly Revenue",
      value: "$125.4K",
      icon: DollarSign,
      description: "This month",
      color: "text-emerald-600",
    },
    {
      label: "Active Subscriptions",
      value: "342",
      icon: CreditCard,
      description: "Paying schools",
      color: "text-blue-600",
    },
    {
      label: "Growth Rate",
      value: "+15.2%",
      icon: TrendingUp,
      description: "Month over month",
      color: "text-green-600",
    },
    {
      label: "Outstanding",
      value: "$8.7K",
      icon: FileText,
      description: "Pending payments",
      color: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      label: "Generate Report",
      icon: FileText,
      onClick: () => handleQuickAction("generate_report"),
      variant: "default" as const,
    },
    {
      label: "Process Payments",
      icon: CreditCard,
      onClick: () => handleQuickAction("process_payments"),
      variant: "outline" as const,
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      onClick: () => handleQuickAction("view_analytics"),
      variant: "outline" as const,
    },
    {
      label: "Manage Billing",
      icon: Calculator,
      onClick: () => handleQuickAction("manage_billing"),
      variant: "outline" as const,
    },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Overview
                </CardTitle>
                <CardDescription>
                  Key financial metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium">Total Revenue</p>
                        <p className="text-sm text-gray-600">$1.2M this year</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-600">
                      Growing
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Subscription Revenue</p>
                        <p className="text-sm text-gray-600">
                          $98.5K this month
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      Stable
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Outstanding Invoices</p>
                        <p className="text-sm text-gray-600">$8.7K pending</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600">
                      Attention
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Financial Metrics
                </CardTitle>
                <CardDescription>
                  Performance indicators and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Revenue Growth
                      </span>
                      <span className="text-sm text-gray-600">+15.2%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Collection Rate
                      </span>
                      <span className="text-sm text-gray-600">94.3%</span>
                    </div>
                    <Progress value={94.3} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Customer Retention
                      </span>
                      <span className="text-sm text-gray-600">96.8%</span>
                    </div>
                    <Progress value={96.8} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Profit Margin</span>
                      <span className="text-sm text-gray-600">68.5%</span>
                    </div>
                    <Progress value={68.5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: CreditCard,
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Active Subscriptions
                </CardTitle>
                <CardDescription>
                  Current subscription status and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Premium Plan</p>
                      <p className="text-xs text-gray-600">
                        245 active subscriptions • $45/month
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Standard Plan</p>
                      <p className="text-xs text-gray-600">
                        97 active subscriptions • $25/month
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Trial Accounts</p>
                      <p className="text-xs text-gray-600">
                        23 trial subscriptions • Expiring soon
                      </p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      Trial
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Overdue Payments</p>
                      <p className="text-xs text-gray-600">
                        8 overdue subscriptions • $2.4K outstanding
                      </p>
                    </div>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Subscription Analytics
                </CardTitle>
                <CardDescription>
                  Subscription performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">342</p>
                      <p className="text-xs text-gray-600">
                        Total Subscriptions
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">$12.4K</p>
                      <p className="text-xs text-gray-600">Monthly Recurring</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">96.8%</p>
                      <p className="text-xs text-gray-600">Retention Rate</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">+12</p>
                      <p className="text-xs text-gray-600">New This Month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
                <CardDescription>
                  Generate and view financial reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Revenue Analysis</p>
                        <p className="text-sm text-gray-600">
                          Monthly revenue breakdown
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PieChart className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Subscription Metrics</p>
                        <p className="text-sm text-gray-600">
                          Subscription performance data
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Payment Processing</p>
                        <p className="text-sm text-gray-600">
                          Payment success rates
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Financial Forecasting</p>
                        <p className="text-sm text-gray-600">
                          Revenue projections
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Billing Schedule
                </CardTitle>
                <CardDescription>
                  Upcoming billing events and deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Monthly Billing Cycle
                      </p>
                      <p className="text-xs text-gray-600">
                        342 subscriptions • Due in 3 days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Payment Processing</p>
                      <p className="text-xs text-gray-600">
                        Auto-payments scheduled • Tomorrow
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Trial Expirations</p>
                      <p className="text-xs text-gray-600">
                        23 trials expiring • Next week
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Invoice Generation</p>
                      <p className="text-xs text-gray-600">
                        Monthly invoices • Friday 9:00 AM
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  return (
    <UnifiedDashboardLayout
      role="finance"
      title="Finance Dashboard"
      description="Monitor revenue, manage subscriptions, and track financial performance."
      stats={stats}
      quickActions={quickActions}
      tabs={tabs}
    />
  );
};

export default FinanceDashboard;
