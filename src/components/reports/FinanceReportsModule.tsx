import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  FileText,
  BarChart3,
  Users,
  Calculator,
} from "lucide-react";
import EnhancedReportGenerator from "./EnhancedReportGenerator";

const FinanceReportsModule: React.FC = () => {
  const reportCategories = [
    {
      id: "financial",
      name: "Financial Reports",
      description: "Generate comprehensive financial reports and analytics",
      icon: DollarSign,
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      reports: [
        {
          name: "Fee Collection Report",
          description:
            "Complete fee collection analysis with payment tracking and trends",
        },
        {
          name: "Outstanding Fees Report",
          description: "Students with pending fees and defaulter tracking",
        },
        {
          name: "Payment History Report",
          description: "Detailed payment transaction history and analysis",
        },
        {
          name: "Financial Summary",
          description:
            "Comprehensive financial overview and school financial health",
        },
        {
          name: "Revenue Analysis",
          description: "Revenue trends and detailed financial analysis",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Finance Reports
        </h1>
        <p className="text-muted-foreground">
          Generate comprehensive financial reports for fee collection,
          outstanding balances, and financial analytics.
        </p>
      </div>

      {/* Report Categories Overview */}
      <div className="grid grid-cols-1 gap-6">
        {reportCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.reports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 border rounded-lg"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Badge variant="outline" className={category.color}>
                {category.reports.length} Reports
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Generate Financial Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedReportGenerator />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h4 className="font-medium text-sm">Fee Collection</h4>
              <p className="text-xs text-muted-foreground">
                Track fee payments
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h4 className="font-medium text-sm">Outstanding Fees</h4>
              <p className="text-xs text-muted-foreground">Monitor defaults</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-sm">Payment History</h4>
              <p className="text-xs text-muted-foreground">
                Transaction records
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-sm">Revenue Analysis</h4>
              <p className="text-xs text-muted-foreground">Financial trends</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financial Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Total Collected
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    KES 2,450,000
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Outstanding
                  </p>
                  <p className="text-lg font-bold text-red-900">KES 450,000</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Collection Rate
                  </p>
                  <p className="text-lg font-bold text-blue-900">84.5%</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    This Month
                  </p>
                  <p className="text-lg font-bold text-purple-900">
                    KES 180,000
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Calculator className="h-5 w-5" />
            Finance Report Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-yellow-700 space-y-2">
            <p>
              <strong>Data Scope:</strong> All financial reports show data for
              your school only.
            </p>
            <p>
              <strong>Real-time:</strong> Reports are generated with the latest
              financial data.
            </p>
            <p>
              <strong>Export Options:</strong> Generate PDF or Excel reports for
              sharing with administration.
            </p>
            <p>
              <strong>Security:</strong> Financial data is protected and only
              accessible to authorized personnel.
            </p>
            <p>
              <strong>MPESA Integration:</strong> Reports include MPESA
              transaction data when available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceReportsModule;
