import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Clock,
} from "lucide-react";
import { AuthUser } from "@/types/auth";

interface HRReportsModuleProps {
  user: AuthUser;
}

const HRReportsModule: React.FC<HRReportsModuleProps> = ({ user }) => {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Fetch data for reports
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["hr-reports-data", user.school_id],
    queryFn: async () => {
      const { data: supportStaff, error: staffError } = await supabase
        .from("support_staff")
        .select("*")
        .eq("school_id", user.school_id);

      if (staffError) throw staffError;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("school_id", user.school_id);

      if (profilesError) throw profilesError;

      return {
        supportStaff: supportStaff || [],
        profiles: profiles || [],
      };
    },
    enabled: !!user.school_id,
  });

  const handleGenerateReport = async (reportType: string) => {
    setGeneratingReport(reportType);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically generate and download the actual report
    console.log(`Generating ${reportType} report...`);
    
    setGeneratingReport(null);
  };

  const reportCards = [
    {
      id: "staff-directory",
      title: "Staff Directory Report",
      description: "Complete list of all support staff with detailed information",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "payroll-summary",
      title: "Payroll Summary",
      description: "Comprehensive salary and compensation report",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "attendance-report",
      title: "Attendance Report",
      description: "Staff attendance patterns and analytics",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: "performance-metrics",
      title: "Performance Metrics",
      description: "Key HR performance indicators and trends",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      id: "user-activity",
      title: "User Activity Report",
      description: "System usage and login statistics",
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      id: "compliance-report",
      title: "Compliance Report",
      description: "Employment compliance and documentation status",
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading reports data...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalStaff: reportsData?.supportStaff.length || 0,
    activeStaff: reportsData?.supportStaff.filter(s => s.is_active).length || 0,
    totalUsers: reportsData?.profiles.length || 0,
    totalSalary: reportsData?.supportStaff.reduce((sum, staff) => sum + (staff.salary_amount || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HR Reports</h2>
          <p className="text-muted-foreground">
            Generate and download comprehensive HR reports
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{stats.totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeStaff}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold">KES {stats.totalSalary.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="standard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="standard">Standard Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCards.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${report.bgColor}`}>
                      <report.icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generatingReport === report.id}
                    className="w-full"
                  >
                    {generatingReport === report.id ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {generatingReport === report.id ? "Generating..." : "Generate Report"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Reports</CardTitle>
              <CardDescription>
                Advanced analytics and trend reports for HR data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Staff Growth Trends</CardTitle>
                    <CardDescription>
                      Historical hiring and retention analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => handleGenerateReport("growth-trends")} className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Analytics
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Salary Benchmarking</CardTitle>
                    <CardDescription>
                      Compensation analysis and market comparison
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => handleGenerateReport("salary-benchmark")} className="w-full">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Generate Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>
                Create custom reports based on specific requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Custom Report Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Build custom reports with specific filters and data points
                </p>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRReportsModule;