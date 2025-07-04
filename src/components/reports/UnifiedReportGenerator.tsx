import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  School,
  Users,
  GraduationCap,
  DollarSign,
  BarChart3,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import {
  UnifiedReportService,
  ReportData,
} from "@/services/unifiedReportService";
import { reportExportService } from "@/services/reportExportService";

interface UnifiedReportGeneratorProps {
  userRole: string;
  onReportGenerated?: (reportData: ReportData) => void;
}

const UnifiedReportGenerator: React.FC<UnifiedReportGeneratorProps> = ({
  userRole,
  onReportGenerated,
}) => {
  const [reportType, setReportType] = useState<string>("");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [schoolId, setSchoolId] = useState<string>("");

  const { user } = useAuth();
  const { schoolId: userSchoolId } = useSchoolScopedData();
  const { toast } = useToast();

  // Define available report types for each role
  const getAvailableReports = () => {
    switch (userRole) {
      case "principal":
        return [
          {
            value: "principal-academic",
            label: "Academic Performance Report",
            icon: <GraduationCap className="h-4 w-4" />,
          },
          {
            value: "principal-attendance",
            label: "Attendance Overview Report",
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            value: "principal-financial",
            label: "Financial Overview Report",
            icon: <DollarSign className="h-4 w-4" />,
          },
        ];
      case "teacher":
        return [
          {
            value: "teacher-class",
            label: "Class Performance Report",
            icon: <School className="h-4 w-4" />,
          },
        ];
      case "finance_officer":
        return [
          {
            value: "finance-collection",
            label: "Fee Collection Report",
            icon: <DollarSign className="h-4 w-4" />,
          },
          {
            value: "finance-analytics",
            label: "Financial Analytics Report",
            icon: <BarChart3 className="h-4 w-4" />,
          },
        ];
      case "parent":
        return [
          {
            value: "parent-student",
            label: "Student Academic Report",
            icon: <Users className="h-4 w-4" />,
          },
        ];
      case "edufam_admin":
        return [
          {
            value: "system-overview",
            label: "System Overview Report",
            icon: <BarChart3 className="h-4 w-4" />,
          },
        ];
      case "school_owner":
        return [
          {
            value: "school-owner",
            label: "School Owner Summary Report",
            icon: <School className="h-4 w-4" />,
          },
        ];
      default:
        return [];
    }
  };

  const availableReports = getAvailableReports();
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

      // Generate report based on type
      switch (reportType) {
        case "principal-academic":
          if (!userSchoolId) throw new Error("School ID required");
          reportData =
            await UnifiedReportService.generatePrincipalAcademicReport(
              userSchoolId,
              user.id
            );
          break;

        case "principal-attendance":
          if (!userSchoolId) throw new Error("School ID required");
          reportData =
            await UnifiedReportService.generatePrincipalAttendanceReport(
              userSchoolId,
              user.id,
              startDate,
              endDate
            );
          break;

        case "principal-financial":
          if (!userSchoolId) throw new Error("School ID required");
          reportData =
            await UnifiedReportService.generatePrincipalFinancialReport(
              userSchoolId,
              user.id
            );
          break;

        case "finance-collection":
          if (!userSchoolId) throw new Error("School ID required");
          reportData =
            await UnifiedReportService.generateFinanceCollectionReport(
              userSchoolId,
              user.id,
              startDate,
              endDate
            );
          break;

        case "finance-analytics":
          if (!userSchoolId) throw new Error("School ID required");
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
          if (!userSchoolId) throw new Error("School ID required");
          reportData = await UnifiedReportService.generateSchoolOwnerReport(
            userSchoolId,
            user.id
          );
          break;

        default:
          throw new Error("Invalid report type");
      }

      // Export the report
      const exportOptions = {
        format,
        includeLogo: true,
        includeTimestamp: true,
        includeFooter: true,
      };

      await reportExportService.exportReport(reportData, 'generated_report', format);

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
            : "An error occurred while generating the report.",
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
  const needsStudentId = reportType === "parent-student";
  const needsSchoolId = reportType === "school-performance";

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <FileText className="h-5 w-5" />
          EduFam Report Generator
        </CardTitle>
        <p className="text-sm text-blue-700">
          Generate professional reports with real-time data and EduFam branding
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type" className="w-full">
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {availableReports.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="py-3"
                  >
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select
              value={format}
              onValueChange={(value: "pdf" | "excel") => setFormat(value)}
            >
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span>Professional PDF</span>
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span>Excel/CSV</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditional Fields */}
        {needsDateRange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {needsClassId && (
          <div className="space-y-2">
            <Label htmlFor="class-id">Class ID</Label>
            <Input
              id="class-id"
              placeholder="Enter class ID"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            />
          </div>
        )}

        {needsStudentId && (
          <div className="space-y-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              placeholder="Enter student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
        )}

        {needsSchoolId && (
          <div className="space-y-2">
            <Label htmlFor="school-id">School ID</Label>
            <Input
              id="school-id"
              placeholder="Enter school ID"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
            />
          </div>
        )}

        {/* Report Preview */}
        {selectedReport && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Report Preview</h4>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>School Logo & Branding</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Real Database Data</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Timestamp & Metadata</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Powered by EduFam Footer</span>
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
