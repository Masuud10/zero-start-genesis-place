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
import { Label } from "@/components/ui/label";
import { Calendar, Download, FileText, BarChart3, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  UnifiedReportService,
  ReportData,
} from "@/services/unifiedReportService";
import { reportExportService } from "@/services/reportExportService";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";

interface UnifiedReportGeneratorProps {
  onReportGenerated?: (report: ReportData) => void;
}

const UnifiedReportGenerator: React.FC<UnifiedReportGeneratorProps> = ({
  onReportGenerated,
}) => {
  const [reportType, setReportType] = useState<string>("");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId: userSchoolId } = useSchoolScopedData();

  const availableReports = [
    {
      value: "principal-academic",
      label: "Academic Performance Report",
      description: "Comprehensive academic performance analysis",
      icon: FileText,
      category: "academic",
    },
    {
      value: "principal-attendance",
      label: "Attendance Summary Report",
      description: "Student attendance patterns and trends",
      icon: Calendar,
      category: "attendance",
    },
    {
      value: "principal-financial",
      label: "Financial Overview Report",
      description: "School financial performance and revenue analysis",
      icon: BarChart3,
      category: "financial",
    },
    {
      value: "finance-collection",
      label: "Fee Collection Report",
      description: "Detailed fee collection and outstanding balances",
      icon: Download,
      category: "financial",
    },
    {
      value: "finance-analytics",
      label: "Financial Analytics Report",
      description: "Advanced financial metrics and trends",
      icon: BarChart3,
      category: "financial",
    },
    {
      value: "system-overview",
      label: "System Overview Report",
      description: "Platform-wide statistics and performance metrics",
      icon: BarChart3,
      category: "system",
    },
    {
      value: "school-owner",
      label: "School Owner Dashboard Report",
      description: "Comprehensive school management overview",
      icon: FileText,
      category: "management",
    },
  ];

  const selectedReport = availableReports.find((r) => r.value === reportType);

  const handleGenerateReport = async () => {
    if (!reportType || !user?.id) {
      toast({
        title: "❌ Error",
        description: "Please select a report type and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      let reportData: ReportData;

      // Generate report based on type with enhanced error handling
      switch (reportType) {
        case "principal-academic":
          if (!userSchoolId)
            throw new Error("School ID required for academic report");
          reportData =
            await UnifiedReportService.generatePrincipalAcademicReport(
              userSchoolId,
              user.id
            );
          break;

        case "principal-attendance":
          if (!userSchoolId)
            throw new Error("School ID required for attendance report");
          reportData =
            await UnifiedReportService.generatePrincipalAttendanceReport(
              userSchoolId,
              user.id,
              startDate,
              endDate
            );
          break;

        case "principal-financial":
          if (!userSchoolId)
            throw new Error("School ID required for financial report");
          reportData =
            await UnifiedReportService.generatePrincipalFinancialReport(
              userSchoolId,
              user.id
            );
          break;

        case "finance-collection":
          if (!userSchoolId)
            throw new Error("School ID required for collection report");
          reportData =
            await UnifiedReportService.generateFinanceCollectionReport(
              userSchoolId,
              user.id,
              startDate,
              endDate
            );
          break;

        case "finance-analytics":
          if (!userSchoolId)
            throw new Error("School ID required for analytics report");
          reportData =
            await UnifiedReportService.generateFinanceAnalyticsReport(
              userSchoolId,
              user.id
            );
          break;

        case "system-overview":
          reportData = await UnifiedReportService.generateSystemOverviewReport(
            user.id
          );
          break;

        case "school-owner":
          if (!userSchoolId)
            throw new Error("School ID required for school owner report");
          reportData = await UnifiedReportService.generateSchoolOwnerReport(
            userSchoolId,
            user.id
          );
          break;

        default:
          throw new Error("Invalid report type selected");
      }

      // Validate report data before export
      if (!reportData) {
        throw new Error("Failed to generate report data");
      }

      // Export the report using enhanced export service
      const exportOptions = {
        format,
        includeLogo: true,
        includeTimestamp: true,
        includeFooter: true,
      };

      const fileName = `${reportType.replace(/-/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }`;
      await reportExportService.exportReport(reportData, fileName, format);

      // Success notification
      toast({
        title: "✅ Report Generated Successfully",
        description: `${
          selectedReport?.label
        } in ${format.toUpperCase()} format has been downloaded`,
      });

      // Callback if provided
      if (onReportGenerated) {
        onReportGenerated(reportData);
      }
    } catch (error) {
      console.error("Report generation error:", error);
      toast({
        title: "❌ Report Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const needsDateRange = [
    "principal-attendance",
    "finance-collection",
  ].includes(reportType);
  const needsClassId = reportType === "teacher-class";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Professional Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="reportType">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select a report type" />
            </SelectTrigger>
            <SelectContent>
              {availableReports.map((report) => (
                <SelectItem key={report.value} value={report.value}>
                  <div className="flex items-center gap-2">
                    <report.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{report.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {report.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Selection */}
        {needsDateRange && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Export Format Selection */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <div className="flex gap-2">
            <Button
              variant={format === "pdf" ? "default" : "outline"}
              onClick={() => setFormat("pdf")}
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF Document
            </Button>
            <Button
              variant={format === "excel" ? "default" : "outline"}
              onClick={() => setFormat("excel")}
              className="flex-1"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Excel Spreadsheet
            </Button>
          </div>
        </div>

        {/* Report Preview */}
        {selectedReport && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <selectedReport.icon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">
                  {selectedReport.label}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {selectedReport.description}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Category: {selectedReport.category} • Format:{" "}
                  {format.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Live system data • {format.toUpperCase()} format</span>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || !reportType}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px]"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedReportGenerator;
