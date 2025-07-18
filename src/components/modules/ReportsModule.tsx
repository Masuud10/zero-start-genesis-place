import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Eye,
  Filter,
  Search,
  Loader2,
} from "lucide-react";

const ReportsModule: React.FC = () => {
  const { adminUser } = useAdminAuthContext();
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const reports = [
    {
      id: "schools-overview",
      title: "Schools Overview Report",
      description: "Comprehensive overview of all registered schools",
      icon: Building2,
      category: "Schools",
      lastGenerated: "2024-01-15",
      status: "available",
    },
    {
      id: "user-analytics",
      title: "User Analytics Report",
      description: "Detailed user activity and engagement metrics",
      icon: Users,
      category: "Users",
      lastGenerated: "2024-01-14",
      status: "available",
    },
    {
      id: "financial-summary",
      title: "Financial Summary Report",
      description: "Revenue, billing, and financial performance data",
      icon: DollarSign,
      category: "Finance",
      lastGenerated: "2024-01-13",
      status: "available",
    },
    {
      id: "system-performance",
      title: "System Performance Report",
      description: "System health, uptime, and performance metrics",
      icon: BarChart3,
      category: "System",
      lastGenerated: "2024-01-12",
      status: "available",
    },
    {
      id: "academic-progress",
      title: "Academic Progress Report",
      description: "Student performance and academic metrics across schools",
      icon: TrendingUp,
      category: "Academic",
      lastGenerated: "2024-01-11",
      status: "generating",
    },
    {
      id: "audit-logs",
      title: "Audit Logs Report",
      description: "System activity and security audit logs",
      icon: FileText,
      category: "Security",
      lastGenerated: "2024-01-10",
      status: "available",
    },
  ];

  const categories = [
    "All",
    "Schools",
    "Users",
    "Finance",
    "System",
    "Academic",
    "Security",
  ];

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true);
    setSelectedReport(reportId);

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setSelectedReport("");
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Available
          </Badge>
        );
      case "generating":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Generating
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports Center</h2>
          <p className="text-muted-foreground">
            Generate and download comprehensive system reports
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Reports
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">Available reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Generated Today
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Reports downloaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Auto-generated reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4GB</div>
            <p className="text-xs text-muted-foreground">Report storage</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Available Reports</span>
          </CardTitle>
          <CardDescription>
            Select a report to generate or download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              const isGeneratingReport =
                selectedReport === report.id && isGenerating;

              return (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {report.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Category: {report.category}</span>
                        <span>Last: {report.lastGenerated}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={isGenerating}
                        >
                          {isGeneratingReport ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Reports</span>
          </CardTitle>
          <CardDescription>
            Recently generated and downloaded reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Schools Overview Report",
                generated: "2024-01-15 14:30",
                size: "2.4 MB",
                type: "PDF",
                status: "completed",
              },
              {
                name: "User Analytics Report",
                generated: "2024-01-15 12:15",
                size: "1.8 MB",
                type: "Excel",
                status: "completed",
              },
              {
                name: "Financial Summary Report",
                generated: "2024-01-15 10:45",
                size: "3.2 MB",
                type: "PDF",
                status: "completed",
              },
              {
                name: "System Performance Report",
                generated: "2024-01-15 09:20",
                size: "1.5 MB",
                type: "PDF",
                status: "completed",
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Generated: {report.generated}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{report.size}</div>
                    <div>{report.type}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsModule;
