import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Download,
  Eye,
  RefreshCw,
  CalendarIcon,
  BarChart3,
  Users,
  DollarSign,
  Database,
  GraduationCap,
  UserCheck,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import {
  useEnhancedReportGeneration,
  ReportType,
} from "@/hooks/useEnhancedReportGeneration";
import {
  EnhancedReportData,
  ExportOptions,
} from "@/services/enhancedReportService";
import ReportDisplay from "./ReportDisplay";

interface EnhancedReportGeneratorProps {
  className?: string;
  onReportGenerated?: (reportData: EnhancedReportData) => void;
}

const EnhancedReportGenerator: React.FC<EnhancedReportGeneratorProps> = ({
  className,
  onReportGenerated,
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const {
    reportData,
    isLoading,
    error,
    getReportTypes,
    getAvailableCategories,
    getReportTypesByCategory,
    generateReport,
    exportReport,
    refreshReport,
    clearReport,
    getCurrentAcademicContext,
    getAvailableFilters,
  } = useEnhancedReportGeneration();

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>(
    []
  );

  // Get available categories and set initial category
  const availableCategories = getAvailableCategories();

  useEffect(() => {
    if (availableCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedCategory]);

  // Load filter data when category changes
  useEffect(() => {
    if (selectedCategory && schoolId) {
      loadFilterData();
    }
  }, [selectedCategory, schoolId]);

  // Load academic context
  useEffect(() => {
    const loadAcademicContext = async () => {
      const context = await getCurrentAcademicContext();
      if (context) {
        setAcademicYear(context.academicYear);
        setTerm(context.term);
      }
    };
    loadAcademicContext();
  }, [getCurrentAcademicContext]);

  const loadFilterData = async () => {
    if (!schoolId) return;

    try {
      // Load classes
      if (["principal", "teacher"].includes(user?.role || "")) {
        // In real implementation, fetch from database
        setClasses([
          { id: "all", name: "All Classes" },
          { id: "class-1", name: "Class 1" },
          { id: "class-2", name: "Class 2" },
          { id: "class-3", name: "Class 3" },
        ]);
      }

      // Load students
      if (["principal", "teacher", "parent"].includes(user?.role || "")) {
        // In real implementation, fetch from database
        setStudents([
          { id: "all", name: "All Students" },
          { id: "student-1", name: "John Doe" },
          { id: "student-2", name: "Jane Smith" },
        ]);
      }

      // Load subjects
      if (["principal", "teacher"].includes(user?.role || "")) {
        // In real implementation, fetch from database
        setSubjects([
          { id: "all", name: "All Subjects" },
          { id: "math", name: "Mathematics" },
          { id: "english", name: "English" },
          { id: "science", name: "Science" },
        ]);
      }
    } catch (error) {
      console.error("Error loading filter data:", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      return;
    }

    try {
      const filters = {
        dateRange: dateRange.from && dateRange.to ? dateRange : undefined,
        classId: selectedClass === "all" ? undefined : selectedClass,
        studentId: selectedStudent === "all" ? undefined : selectedStudent,
        subjectId: selectedSubject === "all" ? undefined : selectedSubject,
        academicYear,
        term,
      };

      const report = await generateReport({
        reportType: selectedReportType,
        filters,
        includeCharts: true,
        includeSummary: true,
      });

      if (onReportGenerated) {
        onReportGenerated(report);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const handleExportReport = async () => {
    if (!reportData) return;

    try {
      const options: ExportOptions = {
        format: exportFormat,
        includeLogo: true,
        includeTimestamp: true,
        includeFooter: true,
        includeCharts: true,
        includeSummary: true,
      };

      await exportReport(options);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic":
        return <GraduationCap className="h-5 w-5" />;
      case "attendance":
        return <UserCheck className="h-5 w-5" />;
      case "financial":
        return <DollarSign className="h-5 w-5" />;
      case "system":
        return <Database className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "attendance":
        return "bg-green-50 text-green-700 border-green-200";
      case "financial":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "system":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (!user) {
    return (
      <Card className={cn("border-red-200", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please log in to access report generation features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="preview" disabled={!reportData}>
            Preview Report
          </TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-3">
                <Label>Report Category</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableCategories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      className={cn(
                        "h-auto p-4 flex flex-col items-center gap-2",
                        selectedCategory === category &&
                          getCategoryColor(category)
                      )}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {getCategoryIcon(category)}
                      <span className="text-sm font-medium capitalize">
                        {category}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Report Type Selection */}
              {selectedCategory && (
                <div className="space-y-3">
                  <Label>Report Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getReportTypesByCategory(selectedCategory).map(
                      (reportType) => (
                        <Card
                          key={reportType.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedReportType === reportType.id &&
                              "ring-2 ring-primary"
                          )}
                          onClick={() => setSelectedReportType(reportType.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {getCategoryIcon(reportType.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-1">
                                  {reportType.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {reportType.description}
                                </p>
                              </div>
                              {selectedReportType === reportType.id && (
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Filters */}
              {selectedReportType && (
                <div className="space-y-4">
                  <Label>Report Filters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                format(dateRange.from, "LLL dd, y")
                              ) : (
                                <span>Start date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) =>
                                setDateRange((prev) => ({
                                  ...prev,
                                  from: date,
                                }))
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
                                format(dateRange.to, "LLL dd, y")
                              ) : (
                                <span>End date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) =>
                                setDateRange((prev) => ({ ...prev, to: date }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Input
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        placeholder="e.g., 2024"
                      />
                    </div>

                    {/* Term */}
                    <div className="space-y-2">
                      <Label>Term</Label>
                      <Select value={term} onValueChange={setTerm}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Term 1">Term 1</SelectItem>
                          <SelectItem value="Term 2">Term 2</SelectItem>
                          <SelectItem value="Term 3">Term 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Class Filter */}
                    {classes.length > 0 && (
                      <div className="space-y-2">
                        <Label>Class</Label>
                        <Select
                          value={selectedClass}
                          onValueChange={setSelectedClass}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
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
                        <Label>Student</Label>
                        <Select
                          value={selectedStudent}
                          onValueChange={setSelectedStudent}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Subject Filter */}
                    {subjects.length > 0 && (
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Select
                          value={selectedSubject}
                          onValueChange={setSelectedSubject}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Export Format */}
              {selectedReportType && (
                <div className="space-y-3">
                  <Label>Export Format</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={exportFormat === "pdf" ? "default" : "outline"}
                      onClick={() => setExportFormat("pdf")}
                      className="flex-1"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      PDF Document
                    </Button>
                    <Button
                      variant={exportFormat === "excel" ? "default" : "outline"}
                      onClick={() => setExportFormat("excel")}
                      className="flex-1"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Excel Spreadsheet
                    </Button>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedReportType || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleExportReport}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export {exportFormat.toUpperCase()}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => refreshReport()}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </Button>
                      <Button variant="outline" onClick={clearReport}>
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <ReportDisplay report={reportData} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No report generated yet</p>
                  <p className="text-sm text-gray-500">
                    Generate a report to see the preview here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Report history feature coming soon
                </p>
                <p className="text-sm text-gray-500">
                  Track and manage your previously generated reports
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReportGenerator;
