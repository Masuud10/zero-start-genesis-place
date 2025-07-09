import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  UserCheck,
  FileText,
  BarChart3,
  Users,
  BookOpen,
} from "lucide-react";
import EnhancedReportGenerator from "./EnhancedReportGenerator";

const TeacherReportsModule: React.FC = () => {
  const reportCategories = [
    {
      id: "academic",
      name: "Academic Reports",
      description: "Generate reports for your assigned classes and subjects",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      reports: [
        {
          name: "My Class Performance",
          description:
            "Performance analysis of students in your assigned classes",
        },
        {
          name: "Student Grades Report",
          description:
            "Detailed grade reports for all students in your classes",
        },
        {
          name: "Subject Performance",
          description: "Performance analysis for your assigned subjects",
        },
      ],
    },
    {
      id: "attendance",
      name: "Attendance Reports",
      description: "Track attendance for your assigned classes",
      icon: UserCheck,
      color: "bg-green-50 text-green-700 border-green-200",
      reports: [
        {
          name: "My Class Attendance",
          description: "Attendance tracking for your assigned classes",
        },
        {
          name: "Student Attendance",
          description: "Individual student attendance records in your classes",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Teacher Reports
        </h1>
        <p className="text-muted-foreground">
          Generate reports for your assigned classes and subjects. All reports
          are automatically filtered to show only your data.
        </p>
      </div>

      {/* Report Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <h4 className="font-medium text-sm">Class Performance</h4>
              <p className="text-xs text-muted-foreground">
                View class performance
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-sm">Attendance</h4>
              <p className="text-xs text-muted-foreground">Track attendance</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-sm">Subject Reports</h4>
              <p className="text-xs text-muted-foreground">
                Subject performance
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h4 className="font-medium text-sm">Student Reports</h4>
              <p className="text-xs text-muted-foreground">
                Individual students
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <BookOpen className="h-5 w-5" />
            Teacher Report Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>Data Scope:</strong> All reports automatically filter to
              show only data from your assigned classes and subjects.
            </p>
            <p>
              <strong>Privacy:</strong> You can only access reports for students
              in your classes.
            </p>
            <p>
              <strong>Export:</strong> Generate PDF or Excel reports for sharing
              with parents or administration.
            </p>
            <p>
              <strong>Real-time:</strong> Reports are generated with the latest
              data from the system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherReportsModule;
