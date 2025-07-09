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
  Heart,
  BookOpen,
} from "lucide-react";
import EnhancedReportGenerator from "./EnhancedReportGenerator";

const ParentReportsModule: React.FC = () => {
  const reportCategories = [
    {
      id: "academic",
      name: "Academic Reports",
      description: "View your child's academic performance and progress",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      reports: [
        {
          name: "My Child's Progress",
          description:
            "Comprehensive academic progress tracking for your child",
        },
        {
          name: "My Child's Grades",
          description: "Detailed grade reports and performance analysis",
        },
      ],
    },
    {
      id: "attendance",
      name: "Attendance Reports",
      description: "Track your child's attendance record",
      icon: UserCheck,
      color: "bg-green-50 text-green-700 border-green-200",
      reports: [
        {
          name: "My Child's Attendance",
          description: "Detailed attendance record and patterns for your child",
        },
      ],
    },
    {
      id: "financial",
      name: "Financial Reports",
      description: "Monitor your child's fee payment status",
      icon: DollarSign,
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      reports: [
        {
          name: "My Child's Fee Status",
          description: "Fee payment status and payment history for your child",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Parent Reports
        </h1>
        <p className="text-muted-foreground">
          View comprehensive reports about your child's academic performance,
          attendance, and fee status.
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
            Generate Child Reports
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
              <h4 className="font-medium text-sm">Academic Progress</h4>
              <p className="text-xs text-muted-foreground">
                View grades & progress
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-sm">Attendance</h4>
              <p className="text-xs text-muted-foreground">Track attendance</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h4 className="font-medium text-sm">Fee Status</h4>
              <p className="text-xs text-muted-foreground">Payment status</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-600" />
              <h4 className="font-medium text-sm">Child Overview</h4>
              <p className="text-xs text-muted-foreground">Complete overview</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Child Information Card */}
      <Card className="border-pink-200 bg-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Heart className="h-5 w-5" />
            Your Child's Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-pink-700 space-y-2">
            <p>
              <strong>Data Privacy:</strong> You can only view reports for your
              own children.
            </p>
            <p>
              <strong>Real-time Updates:</strong> Reports are generated with the
              latest data from the school.
            </p>
            <p>
              <strong>Export Options:</strong> Download PDF or Excel reports for
              your records.
            </p>
            <p>
              <strong>Communication:</strong> Use these reports to discuss
              progress with teachers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Academic Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Mathematics Grade Updated</p>
                <p className="text-xs text-muted-foreground">
                  Term 1, 2024 - Grade A (85%)
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                2 days ago
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Attendance Recorded</p>
                <p className="text-xs text-muted-foreground">
                  Present - All classes attended
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                1 day ago
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Fee Payment Received</p>
                <p className="text-xs text-muted-foreground">
                  KES 15,000 - Term 1 Fees
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                3 days ago
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentReportsModule;
