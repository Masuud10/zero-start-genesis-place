import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Database,
  Activity,
  TrendingUp,
  Users,
  Settings,
  Download,
  Eye,
  Plus,
  Clock,
  Globe,
  Shield,
} from "lucide-react";
import RoleBasedReportGenerator from "../reports/RoleBasedReportGenerator";

const EduFamReportsSection: React.FC = () => {
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  const systemReports = [
    {
      title: "System Overview Report",
      description: "Complete system metrics and performance analysis",
      icon: <Database className="h-5 w-5" />,
      color: "blue",
      category: "system",
    },
    {
      title: "System Health Report",
      description: "System performance and technical health metrics",
      icon: <Activity className="h-5 w-5" />,
      color: "green",
      category: "system",
    },
    {
      title: "Platform Overview Report",
      description: "Complete platform metrics and school performance",
      icon: <Globe className="h-5 w-5" />,
      color: "purple",
      category: "system",
    },
    {
      title: "Security Audit Report",
      description: "System security and access control analysis",
      icon: <Shield className="h-5 w-5" />,
      color: "red",
      category: "system",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100";
      case "green":
        return "bg-green-50 border-green-200 text-green-700 hover:bg-green-100";
      case "purple":
        return "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100";
      case "red":
        return "bg-red-50 border-red-200 text-red-700 hover:bg-red-100";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            🔧 System Reports
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Generate comprehensive system-wide reports and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            System Admin
          </Badge>
          <Button
            onClick={() => setShowReportGenerator(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {showReportGenerator ? (
        <Card className="border-2 border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <FileText className="h-5 w-5" />
                EduFam System Report Center
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportGenerator(false)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RoleBasedReportGenerator userRole="edufam_admin" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemReports.map((report, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all hover:shadow-md hover:scale-105 border-2 hover:border-purple-300"
              onClick={() => setShowReportGenerator(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${getColorClasses(
                      report.color
                    )}`}
                  >
                    {report.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {report.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {report.description}
                </p>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* System Quick Stats */}
      {!showReportGenerator && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">
                    Active Schools
                  </p>
                  <p className="text-2xl font-bold text-blue-900">45</p>
                  <p className="text-xs text-blue-600">Registered</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-green-900">12,450</p>
                  <p className="text-xs text-green-600">Active accounts</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">
                    System Health
                  </p>
                  <p className="text-2xl font-bold text-purple-900">98%</p>
                  <p className="text-xs text-purple-600">Uptime</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 text-sm font-medium">Reports</p>
                  <p className="text-2xl font-bold text-red-900">156</p>
                  <p className="text-xs text-red-600">This month</p>
                </div>
                <FileText className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Reports Summary */}
      {!showReportGenerator && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent System Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No recent reports generated</p>
              <p className="text-xs mt-1">
                Generate your first system report to see it here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default EduFamReportsSection;
