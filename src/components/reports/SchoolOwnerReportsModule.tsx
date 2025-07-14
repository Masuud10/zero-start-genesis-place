import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  GraduationCap,
  BarChart3,
  Loader2,
  AlertCircle,
  Eye,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ReportData {
  id: string;
  type: string;
  title: string;
  description: string;
  lastGenerated?: string;
  status: "available" | "generating" | "error";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const SchoolOwnerReportsModule: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  // @ts-ignore - Deep type instantiation issue
  const { data: schoolStats } = useQuery({
    queryKey: ["school-owner-stats", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      const [studentsRes, teachersRes, classesRes, feesRes] = await Promise.all(
        [
          supabase
            .from("students")
            .select("id", { count: "exact" })
            .eq("school_id", schoolId)
            .eq("is_active", true),
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("school_id", schoolId)
            .eq("role", "teacher")
            .eq("status", "active"),
          supabase
            .from("classes")
            .select("id", { count: "exact" })
            .eq("school_id", schoolId),
          supabase
            .from("fees")
            .select("amount, paid_amount")
            .eq("school_id", schoolId),
        ]
      );

      const totalFees =
        feesRes.data?.reduce(
          (sum, fee) => sum + (Number(fee.amount) || 0),
          0
        ) || 0;
      const totalPaid =
        feesRes.data?.reduce(
          (sum, fee) => sum + (Number(fee.paid_amount) || 0),
          0
        ) || 0;
      const collectionRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

      return {
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalRevenue: totalPaid,
        collectionRate: Math.round(collectionRate),
      };
    },
    enabled: !!schoolId,
  });

  const reports: ReportData[] = [
    {
      id: "attendance",
      type: "attendance",
      title: "Attendance Report",
      description: "Student attendance records and trends",
      status: "available",
      icon: Users,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "academic",
      type: "academic",
      title: "Academic Performance Report",
      description: "Student grades, performance analysis, and trends",
      status: "available",
      icon: GraduationCap,
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: "financial",
      type: "financial",
      title: "Financial Report",
      description: "Fee collection, revenue analysis, and outstanding balances",
      status: "available",
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "analytics",
      type: "analytics",
      title: "School Analytics Report",
      description: "Comprehensive school performance metrics and insights",
      status: "available",
      icon: BarChart3,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "staff",
      type: "staff",
      title: "Staff Management Report",
      description: "Teacher performance, workload distribution, and attendance",
      status: "available",
      icon: Users,
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      id: "comprehensive",
      type: "comprehensive",
      title: "Comprehensive School Report",
      description: "Complete overview of all school operations and metrics",
      status: "available",
      icon: FileText,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
  ];

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true);
    setSelectedReport(reportId);

    try {
      console.log(
        `Generating ${selectedFormat.toUpperCase()} report:`,
        reportId
      );

      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would call your actual report generation API
      // const response = await fetch('/api/reports/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     reportType: reportId,
      //     format: selectedFormat,
      //     schoolId: schoolId
      //   })
      // });

      console.log(`Report generated successfully: ${reportId}`);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    // Here you would implement actual download logic
    // window.open(`/api/reports/download/${reportId}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            School Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and export comprehensive school reports
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {schoolStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">
                    {schoolStats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                  <p className="text-2xl font-bold">
                    {schoolStats.totalTeachers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                  <p className="text-2xl font-bold">
                    {schoolStats.totalClasses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Collection Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {schoolStats.collectionRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Report Type
              </label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Export Format
              </label>
              <Select
                value={selectedFormat}
                onValueChange={(value: "pdf" | "excel") =>
                  setSelectedFormat(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => handleGenerateReport(selectedReport)}
            disabled={!selectedReport || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${report.color}`}>
                  <report.icon className="h-5 w-5" />
                </div>
                <Badge
                  variant={
                    report.status === "available" ? "default" : "secondary"
                  }
                >
                  {report.status === "available" ? "Ready" : "Generating"}
                </Badge>
              </div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.lastGenerated && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last generated:{" "}
                  {new Date(report.lastGenerated).toLocaleDateString()}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={isGenerating}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Generate
                </Button>

                {report.status === "available" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(report.id)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Recent Reports</h3>
            <p>Generate your first report to see it here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOwnerReportsModule;
