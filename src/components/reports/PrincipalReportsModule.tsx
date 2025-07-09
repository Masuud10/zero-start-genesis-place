import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  UserCheck,
  DollarSign,
  FileText,
  BarChart3,
  Users,
} from "lucide-react";
import EnhancedReportGenerator from "./EnhancedReportGenerator";

const PrincipalReportsModule: React.FC = () => {
  const reportCategories = [
    {
      id: "academic",
      name: "Academic Reports",
      description: "Generate comprehensive academic performance reports",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      reports: [
        {
          name: "Academic Performance Report",
          description:
            "Comprehensive analysis of student academic performance across all subjects and classes",
        },
        {
          name: "Class Performance Report",
          description:
            "Class-wise academic performance analysis with detailed metrics",
        },
        {
          name: "Subject Analysis Report",
          description: "Subject-wise performance breakdown and trend analysis",
        },
        {
          name: "Exam Results Summary",
          description:
            "Comprehensive exam results analysis with statistical insights",
        },
      ],
    },
    {
      id: "attendance",
      name: "Attendance Reports",
      description: "Track and analyze student attendance patterns",
      icon: UserCheck,
      color: "bg-green-50 text-green-700 border-green-200",
      reports: [
        {
          name: "Attendance Summary",
          description: "School-wide attendance statistics and trend analysis",
        },
        {
          name: "Class Attendance Report",
          description:
            "Class-specific attendance tracking with detailed breakdowns",
        },
        {
          name: "Student Attendance Report",
          description: "Individual student attendance records and patterns",
        },
      ],
    },
    {
      id: "financial",
      name: "Financial Reports",
      description: "Monitor school financial health and fee collection",
      icon: DollarSign,
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      reports: [
        {
          name: "Fee Collection Report",
          description: "Complete fee collection analysis with payment tracking",
        },
        {
          name: "Financial Summary",
          description:
            "Comprehensive financial overview and school financial health",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Principal Reports
        </h1>
        <p className="text-muted-foreground">
          Generate comprehensive reports for academic performance, attendance,
          and financial management.
        </p>
      </div>

      {/* Report Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="space-y-2">
                {category.reports.map((report, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{report.name}</p>
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
            Generate Reports
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
              <GraduationCap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-sm">Academic Performance</h4>
              <p className="text-xs text-muted-foreground">
                Generate academic reports
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-sm">Attendance Summary</h4>
              <p className="text-xs text-muted-foreground">
                Track attendance patterns
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h4 className="font-medium text-sm">Financial Overview</h4>
              <p className="text-xs text-muted-foreground">
                Monitor financial health
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-sm">Custom Reports</h4>
              <p className="text-xs text-muted-foreground">
                Create custom reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalReportsModule;
