import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Download,
  Eye,
  Share2,
  RefreshCw,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  UnifiedReportService,
  ReportData,
} from "@/services/unifiedReportService";
import { reportExportService } from "@/services/reportExportService";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import ReportDisplay from "@/components/reports/ReportDisplay";

interface RoleBasedReportGeneratorProps {
  userRole: string;
}

interface ReportHistory {
  id: string;
  reportName: string;
  generatedAt: string;
  format: string;
  status: string;
}

const RoleBasedReportGenerator: React.FC<RoleBasedReportGeneratorProps> = ({
  userRole,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(
    null
  );
  const [classes, setClasses] = useState<
    Array<{ id: string; name: string; school_id: string }>
  >([]);
  const [students, setStudents] = useState<
    Array<{ id: string; name: string; school_id: string }>
  >([]);

  // Role-based report configurations
  const reportConfigs = {
    principal: {
      academic: [
        {
          id: "academic-performance",
          name: "Academic Performance Report",
          description: "Comprehensive analysis of student academic performance",
        },
        {
          id: "class-performance",
          name: "Class Performance Report",
          description: "Detailed analysis of class academic performance",
        },
        {
          id: "student-progress",
          name: "Student Progress Report",
          description: "Individual student progress tracking",
        },
        {
          id: "subject-analysis",
          name: "Subject Analysis Report",
          description: "Subject-wise performance breakdown",
        },
        {
          id: "exam-results",
          name: "Exam Results Summary",
          description: "Comprehensive exam results analysis",
        },
        {
          id: "school-performance",
          name: "School Performance Report",
          description: "Comprehensive school performance analysis",
        },
      ],
      attendance: [
        {
          id: "attendance-summary",
          name: "Attendance Summary",
          description: "School-wide attendance statistics",
        },
        {
          id: "class-attendance",
          name: "Class Attendance Report",
          description: "Class-specific attendance tracking",
        },
        {
          id: "student-attendance",
          name: "Student Attendance Report",
          description: "Individual student attendance records",
        },
      ],
      financial: [
        {
          id: "fee-collection",
          name: "Fee Collection Report",
          description: "Fee collection and outstanding amounts",
        },
        {
          id: "financial-summary",
          name: "Financial Summary",
          description: "Overall financial health of the school",
        },
      ],
    },
    teacher: {
      academic: [
        {
          id: "my-class-performance",
          name: "My Class Performance",
          description: "Performance of assigned classes",
        },
        {
          id: "student-grades",
          name: "Student Grades Report",
          description: "Grades for all students in my classes",
        },
        {
          id: "subject-performance",
          name: "Subject Performance",
          description: "Performance in my subjects",
        },
      ],
      attendance: [
        {
          id: "my-class-attendance",
          name: "My Class Attendance",
          description: "Attendance for my classes",
        },
        {
          id: "student-attendance",
          name: "Student Attendance",
          description: "Individual student attendance in my classes",
        },
      ],
    },
    finance_officer: {
      financial: [
        {
          id: "fee-collection",
          name: "Fee Collection Report",
          description: "Complete fee collection analysis",
        },
        {
          id: "outstanding-fees",
          name: "Outstanding Fees Report",
          description: "Students with pending fees",
        },
        {
          id: "payment-history",
          name: "Payment History Report",
          description: "Detailed payment transaction history",
        },
        {
          id: "financial-summary",
          name: "Financial Summary",
          description: "Comprehensive financial overview",
        },
        {
          id: "revenue-analysis",
          name: "Revenue Analysis",
          description: "Revenue trends and analysis",
        },
      ],
    },
    parent: {
      academic: [
        {
          id: "my-child-grades",
          name: "My Child's Grades",
          description: "Academic performance of my child",
        },
        {
          id: "my-child-progress",
          name: "My Child's Progress",
          description: "Progress tracking for my child",
        },
      ],
      attendance: [
        {
          id: "my-child-attendance",
          name: "My Child's Attendance",
          description: "Attendance records for my child",
        },
      ],
    },
  };

  // Get available reports for the user role
  const getAvailableReports = () => {
    const config = reportConfigs[userRole as keyof typeof reportConfigs];
    if (!config) return [];

    return Object.values(config).flat();
  };

  const availableReports = getAvailableReports();

  // Load filter data (classes, students) based on user role
  const loadFilterData = async () => {
    if (!schoolId) return;

    try {
      // Load classes for principal and teacher roles
      if (["principal", "teacher"].includes(userRole)) {
        // In a real implementation, you would fetch classes from the database
        // For now, we'll use mock data
        setClasses([
          { id: "class-1", name: "Grade 1A", school_id: schoolId },
          { id: "class-2", name: "Grade 1B", school_id: schoolId },
          { id: "class-3", name: "Grade 2A", school_id: schoolId },
        ]);
      }

      // Load students for parent role
      if (userRole === "parent") {
        // In a real implementation, you would fetch the parent's children
        // For now, we'll use mock data
        setStudents([
          { id: "student-1", name: "John Doe", school_id: schoolId },
          { id: "student-2", name: "Jane Smith", school_id: schoolId },
        ]);
      }
    } catch (error) {
      console.error("Error loading filter data:", error);
    }
  };

  // Load report history
  const loadReportHistory = async () => {
    try {
      // In a real implementation, you would fetch from the database
      // For now, we'll use mock data
      const mockHistory: ReportHistory[] = [
        {
          id: "1",
          reportName: "Academic Performance Report",
          generatedAt: new Date().toISOString(),
          format: "pdf",
          status: "completed",
        },
      ];
      setReportHistory(mockHistory);
    } catch (error) {
      console.error("Error loading report history:", error);
    }
  };

  useEffect(() => {
    loadFilterData();
    loadReportHistory();
  }, [userRole, schoolId]);

  const handleGenerateReport = async () => {
    if (!selectedReport || !user?.id) {
      toast({
        title: "Error",
        description: "Please select a report and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Prepare filters
      const filters = {
        dateRange: dateRange.from && dateRange.to ? dateRange : undefined,
        classId: selectedClass === "all" ? undefined : selectedClass,
        studentId: selectedStudent === "all" ? undefined : selectedStudent,
      };

      // Generate report using the unified service
      const reportData = await UnifiedReportService.generateReport({
        reportType: selectedReport,
        userRole,
        filters,
      });

      // Store the generated report for display
      setGeneratedReport(reportData);

      // Export the report
      const fileName = `${selectedReport}_${format(
        new Date(),
        "yyyy-MM-dd_HH-mm"
      )}`;
      await reportExportService.exportReport(
        reportData,
        fileName,
        exportFormat
      );

      // Add to history
      const newHistoryItem: ReportHistory = {
        id: Date.now().toString(),
        reportName: selectedReport,
        generatedAt: new Date().toISOString(),
        format: exportFormat,
        status: "completed",
      };
      setReportHistory([newHistoryItem, ...reportHistory]);

      toast({
        title: "Success",
        description: `Report generated and exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateReport = async (historyItem: ReportHistory) => {
    setSelectedReport(historyItem.reportName);
    setExportFormat(historyItem.format as "pdf" | "excel");
    await handleGenerateReport();
  };

  const handleShareReport = async (historyItem: ReportHistory) => {
    try {
      // In a real implementation, you would implement sharing logic
      toast({
        title: "Share Feature",
        description: "Sharing functionality will be implemented soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Reports
          </CardTitle>
          <CardDescription>
            Create professional reports based on your role and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {availableReports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {report.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-2">
            <Label>Date Range (Optional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      format(dateRange.from, "PPP")
                    ) : (
                      <span>Start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) =>
                      setDateRange({ ...dateRange, from: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? (
                      format(dateRange.to, "PPP")
                    ) : (
                      <span>End date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) =>
                      setDateRange({ ...dateRange, to: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Class Selection (for principal/teacher) */}
          {["principal", "teacher"].includes(userRole) &&
            classes.length > 0 && (
              <div className="space-y-2">
                <Label>Class (Optional)</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Student Selection (for parent) */}
          {userRole === "parent" && students.length > 0 && (
            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="flex gap-2">
              <Button
                variant={exportFormat === "pdf" ? "default" : "outline"}
                onClick={() => setExportFormat("pdf")}
                className="flex-1"
              >
                PDF
              </Button>
              <Button
                variant={exportFormat === "excel" ? "default" : "outline"}
                onClick={() => setExportFormat("excel")}
                className="flex-1"
              >
                Excel
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateReport}
            disabled={!selectedReport || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>
            Recently generated reports and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportHistory.map((historyItem) => (
              <div
                key={historyItem.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{historyItem.reportName}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(historyItem.generatedAt), "PPP 'at' p")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {historyItem.format.toUpperCase()}
                  </Badge>
                  <Badge
                    variant={
                      historyItem.status === "completed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {historyItem.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerateReport(historyItem)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShareReport(historyItem)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {reportHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No reports generated yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Report Display */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportDisplay report={generatedReport} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoleBasedReportGenerator;
