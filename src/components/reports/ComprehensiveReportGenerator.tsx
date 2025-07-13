import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  DollarSign,
  Users,
  GraduationCap,
  School,
  Clock,
  Filter,
  Eye,
  Save,
  Share2,
  Printer,
  FileSpreadsheet,
  FileText as FilePdf,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  BookOpen,
  UserCheck,
  CreditCard,
  Activity,
  Database,
  Settings,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import {
  EnhancedReportService,
  EnhancedReportData,
  ExportOptions,
} from "@/services/enhancedReportService";
import { useEnhancedReportGeneration } from "@/hooks/useEnhancedReportGeneration";
import EnhancedReportDisplay from "./EnhancedReportDisplay";
import { cn } from "@/lib/utils";

interface ComprehensiveReportGeneratorProps {
  userRole: string;
  onReportGenerated?: (reportData: EnhancedReportData) => void;
  className?: string;
}

const ComprehensiveReportGenerator: React.FC<
  ComprehensiveReportGeneratorProps
> = ({ userRole, onReportGenerated, className }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [filters, setFilters] = useState({
    classId: "",
    subjectId: "",
    academicYear: "",
    term: "",
    status: "",
  });
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");

  const schoolData = useSchoolScopedData();

  // Use the enhanced report generation hook
  const {
    reportData: generatedReport,
    isLoading: isGenerating,
    error,
    generateReport,
    refreshReport,
    clearReport,
  } = useEnhancedReportGeneration();

  // Report type configurations based on user role
  const reportTypes = {
    principal: [
      {
        id: "academic-performance",
        name: "Academic Performance Report",
        icon: GraduationCap,
      },
      { id: "attendance-summary", name: "Attendance Summary", icon: UserCheck },
      {
        id: "financial-overview",
        name: "Financial Overview",
        icon: DollarSign,
      },
      {
        id: "school-performance",
        name: "School Performance Analysis",
        icon: BarChart3,
      },
    ],
    teacher: [
      {
        id: "academic-performance",
        name: "Class Grades Report",
        icon: GraduationCap,
      },
      {
        id: "student-progress",
        name: "Student Progress Report",
        icon: TrendingUp,
      },
      { id: "attendance-summary", name: "Attendance Report", icon: UserCheck },
    ],
    parent: [
      {
        id: "student-progress",
        name: "Student Report Card",
        icon: GraduationCap,
      },
      { id: "financial-overview", name: "Fee Statement", icon: CreditCard },
      { id: "attendance-summary", name: "Attendance Record", icon: UserCheck },
    ],
    finance_officer: [
      { id: "financial-overview", name: "Financial Summary", icon: DollarSign },
      { id: "fee-collection", name: "Fee Collection Report", icon: CreditCard },
      {
        id: "financial-overview",
        name: "Outstanding Balances",
        icon: AlertCircle,
      },
    ],
    edufam_admin: [
      { id: "system-overview", name: "System Overview", icon: Database },
      { id: "school-performance", name: "School Analytics", icon: School },
      { id: "financial-overview", name: "Revenue Analytics", icon: DollarSign },
    ],
  };

  const currentReportTypes =
    reportTypes[userRole as keyof typeof reportTypes] || [];

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateReport({
        reportType,
        filters: {
          dateRange:
            dateRange.start && dateRange.end
              ? {
                  from: new Date(dateRange.start),
                  to: new Date(dateRange.end),
                }
              : undefined,
          classId: filters.classId || undefined,
          studentId: undefined,
        },
        includeCharts: true,
        includeSummary: true,
      });

      if (generatedReport && onReportGenerated) {
        onReportGenerated(generatedReport);
      }

      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const handleExportReport = async () => {
    if (!generatedReport) return;

    try {
      const options: ExportOptions = {
        format: exportFormat,
        includeLogo: true,
        includeTimestamp: true,
        includeFooter: true,
        includeCharts: true,
      };

      await EnhancedReportService.exportReport(generatedReport, options);

      toast({
        title: "Success",
        description: `Report exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedReport}>
            Preview Report
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentReportTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class ID</Label>
                  <Input
                    placeholder="Enter class ID"
                    value={filters.classId}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        classId: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input
                    placeholder="e.g., 2024"
                    value={filters.academicYear}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        academicYear: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="flex gap-2">
                  <Button
                    variant={exportFormat === "pdf" ? "default" : "outline"}
                    onClick={() => setExportFormat("pdf")}
                    className="flex-1"
                  >
                    <FilePdf className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    variant={exportFormat === "excel" ? "default" : "outline"}
                    onClick={() => setExportFormat("excel")}
                    className="flex-1"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReport}
                disabled={!reportType || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {generatedReport ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Report Preview
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleExportReport}
                        disabled={isGenerating}
                        variant="outline"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export {exportFormat.toUpperCase()}
                      </Button>
                      <Button
                        onClick={() => refreshReport()}
                        disabled={isGenerating}
                        variant="outline"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedReportDisplay
                    reportData={generatedReport}
                    onRefresh={() => refreshReport()}
                    showExportButtons={false}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No report generated yet</p>
                  <p className="text-sm text-gray-500">
                    Generate a report first to see the preview
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select
                    value={exportFormat}
                    onValueChange={(value: "pdf" | "excel") =>
                      setExportFormat(value)
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

                <div className="space-y-2">
                  <Label>User Role</Label>
                  <Input value={userRole.replace("_", " ")} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Reports</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentReportTypes.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{report.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={clearReport}
                variant="outline"
                className="w-full"
              >
                Clear Generated Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveReportGenerator;
