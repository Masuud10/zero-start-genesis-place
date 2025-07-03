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
  unifiedReportService,
  ReportHistory,
  ReportData,
} from "@/services/unifiedReportService";
import { reportExportService } from "@/services/reportExportService";
import ReportDisplay from "@/components/reports/ReportDisplay";

interface RoleBasedReportGeneratorProps {
  userRole: string;
}

const RoleBasedReportGenerator: React.FC<RoleBasedReportGeneratorProps> = ({
  userRole,
}) => {
  const { toast } = useToast();
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
          id: "my-child-progress",
          name: "My Child's Progress",
          description: "Academic progress of my child",
        },
        {
          id: "my-child-grades",
          name: "My Child's Grades",
          description: "Detailed grade report for my child",
        },
      ],
      attendance: [
        {
          id: "my-child-attendance",
          name: "My Child's Attendance",
          description: "Attendance record of my child",
        },
      ],
      financial: [
        {
          id: "my-child-fees",
          name: "My Child's Fee Status",
          description: "Fee payment status and history",
        },
      ],
    },
    edufam_admin: {
      system: [
        {
          id: "system-overview",
          name: "System Overview",
          description: "Complete platform statistics and performance",
        },
        {
          id: "school-registration",
          name: "School Registration Report",
          description: "All registered schools with analytics",
        },
        {
          id: "user-analytics",
          name: "User Analytics",
          description: "Platform-wide user statistics",
        },
        {
          id: "security-audit",
          name: "Security Audit Report",
          description: "System security logs and access patterns",
        },
        {
          id: "database-performance",
          name: "Database Performance",
          description: "Database metrics and optimization",
        },
      ],
      financial: [
        {
          id: "platform-revenue",
          name: "Platform Revenue",
          description: "Overall platform revenue and subscriptions",
        },
        {
          id: "financial-overview",
          name: "Financial Overview",
          description: "Platform financial health and metrics",
        },
        {
          id: "subscription-analytics",
          name: "Subscription Analytics",
          description: "School subscription patterns and trends",
        },
      ],
    },
  };

  const currentReports =
    reportConfigs[userRole as keyof typeof reportConfigs] || {};

  useEffect(() => {
    // Load classes and students for filters
    loadFilterData();
    // Load report history
    loadReportHistory();
  }, [userRole]);

  const loadFilterData = async () => {
    try {
      // Load classes if user has access
      if (["principal", "teacher"].includes(userRole)) {
        const classesData = await unifiedReportService.getClasses();
        setClasses(classesData);
      }

      // Load students if user has access
      if (["principal", "teacher", "parent"].includes(userRole)) {
        const studentsData = await unifiedReportService.getStudents();
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Error loading filter data:", error);
    }
  };

  const loadReportHistory = async () => {
    try {
      // Load recent report history
      const history = (await unifiedReportService.getReportHistory(
        userRole
      )) as ReportHistory[];
      setReportHistory(history);
    } catch (error) {
      console.error("Error loading report history:", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast({
        title: "Error",
        description: "Please select a report to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const reportData = await unifiedReportService.generateReport({
        reportType: selectedReport,
        userRole,
        filters: {
          dateRange,
          classId: selectedClass === "all" ? undefined : selectedClass,
          studentId: selectedStudent === "all" ? undefined : selectedStudent,
        },
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
      // Implement sharing functionality
      await reportExportService.shareReport(historyItem.id);
      toast({
        title: "Success",
        description: "Report shared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedReport}>
            Preview Report
          </TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                Select report type and configure filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Selection */}
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={selectedReport}
                  onValueChange={setSelectedReport}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currentReports).map(
                      ([category, reports]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 uppercase">
                            {category.replace("_", " ")}
                          </div>
                          {reports.map(
                            (report: {
                              id: string;
                              name: string;
                              description: string;
                            }) => (
                              <SelectItem key={report.id} value={report.id}>
                                <div>
                                  <div className="font-medium">
                                    {report.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {report.description}
                                  </div>
                                </div>
                              </SelectItem>
                            )
                          )}
                        </div>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
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
                            <span>From date</span>
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
                            <span>To date</span>
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

                {/* Class Filter */}
                {classes.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="class-filter">Class (Optional)</Label>
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                    >
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

                {/* Student Filter */}
                {students.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="student-filter">Student (Optional)</Label>
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
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                View the generated report with clean, structured formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedReport ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const fileName = `${selectedReport}_${format(
                            new Date(),
                            "yyyy-MM-dd_HH-mm"
                          )}`;
                          reportExportService.exportReport(
                            generatedReport,
                            fileName,
                            exportFormat
                          );
                        }}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export {exportFormat.toUpperCase()}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setGeneratedReport(null)}
                      >
                        Clear Preview
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <ReportDisplay reportData={generatedReport} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No report generated yet</p>
                  <p className="text-sm text-gray-500">
                    Generate a report first to see the preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                View and manage your generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports generated yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.reportName}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {item.format.toUpperCase()}
                          </Badge>
                          <Badge
                            variant={
                              item.status === "completed"
                                ? "default"
                                : item.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Generated on{" "}
                          {format(new Date(item.generatedAt), "PPP")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateReport(item)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareReport(item)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleBasedReportGenerator;
