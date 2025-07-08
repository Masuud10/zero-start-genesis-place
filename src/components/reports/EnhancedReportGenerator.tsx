import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw,
  FileText,
  BarChart3,
  School,
  GraduationCap,
  DollarSign,
  UserCheck,
  Users,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedReportGeneration } from "@/hooks/useEnhancedReportGeneration";
import EnhancedReportDisplay from "@/components/reports/EnhancedReportDisplay";
import { ReportFilters } from "@/services/enhancedReportService";
import { useAcademicModuleIntegration } from "@/hooks/useAcademicModuleIntegration";

interface EnhancedReportGeneratorProps {
  userRole?: string;
  className?: string;
}

const EnhancedReportGenerator: React.FC<EnhancedReportGeneratorProps> = ({
  userRole: propUserRole,
  className,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId: userSchoolId } = useSchoolScopedData();

  // Report generation state
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
  const [activeTab, setActiveTab] = useState("generate");

  // User context
  const [userRole, setUserRole] = useState<string>(propUserRole || "user");
  const [userSchoolIdState, setUserSchoolIdState] = useState<string | null>(
    null
  );

  // Academic context
  const {
    context,
    isLoading,
    error: academicError,
    data: academicData,
    isValid,
    refreshData,
    currentPeriod,
    validation,
  } = useAcademicModuleIntegration(["reports"]);

  // Load user context on mount
  useEffect(() => {
    const loadUserContext = async () => {
      if (!user) return;

      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("school_id, role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setUserSchoolIdState(profile?.school_id || null);
        setUserRole(profile?.role || "user");
      } catch (error) {
        console.error("Error loading user context:", error);
        toast({
          title: "❌ Error",
          description: "Failed to load user information",
          variant: "destructive",
        });
      }
    };

    loadUserContext();
  }, [user]);

  // Use the enhanced report generation hook
  const {
    reportData: generatedReport,
    isGenerating,
    isExporting,
    error,
    validationErrors,
    validationWarnings,
    generateReport,
    exportReport,
    refreshData: enhancedReportRefreshData,
    clearReport,
    availableReports,
  } = useEnhancedReportGeneration();

  // Handle report generation
  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast({
        title: "❌ Report Selection Required",
        description: "Please select a report type to generate",
        variant: "destructive",
      });
      return;
    }

    const filters: ReportFilters = {
      dateRange: dateRange.from || dateRange.to ? dateRange : undefined,
      classId: selectedClass === "all" ? undefined : selectedClass,
      studentId: selectedStudent === "all" ? undefined : selectedStudent,
    };

    await generateReport({
      reportType: selectedReport,
      filters,
    });
  };

  // Handle export
  const handleExport = async (format: "pdf" | "excel") => {
    await exportReport(format);
  };

  // Get report icon
  const getReportIcon = (reportType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "system-overview": <Database className="h-5 w-5" />,
      "school-performance": <School className="h-5 w-5" />,
      "academic-performance": <GraduationCap className="h-5 w-5" />,
      "financial-overview": <DollarSign className="h-5 w-5" />,
      "student-progress": <Users className="h-5 w-5" />,
      "attendance-summary": <UserCheck className="h-5 w-5" />,
      "fee-collection": <DollarSign className="h-5 w-5" />,
    };
    return iconMap[reportType] || <BarChart3 className="h-5 w-5" />;
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      System: "bg-blue-100 text-blue-800",
      Analytics: "bg-purple-100 text-purple-800",
      Academic: "bg-green-100 text-green-800",
      Financial: "bg-orange-100 text-orange-800",
    };
    return colorMap[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Report Generator
          </h1>
          <p className="text-gray-600 mt-1">
            Generate professional reports with real-time data validation and
            role-based access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {userRole.replace("_", " ").toUpperCase()}
          </Badge>
          {userSchoolIdState && (
            <Badge variant="secondary" className="text-sm">
              School ID: {userSchoolIdState}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Select Report Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableReports.map((report) => (
                  <div
                    key={report.value}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedReport === report.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedReport(report.value)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600">
                        {getReportIcon(report.value)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {report.label}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.description}
                        </p>
                        <Badge
                          className={cn(
                            "mt-2",
                            getCategoryColor(report.category)
                          )}
                        >
                          {report.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="class-1">Class 1</SelectItem>
                      <SelectItem value="class-2">Class 2</SelectItem>
                      <SelectItem value="class-3">Class 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Filter */}
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
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="student-1">Student 1</SelectItem>
                      <SelectItem value="student-2">Student 2</SelectItem>
                      <SelectItem value="student-3">Student 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pdf"
                    name="exportFormat"
                    value="pdf"
                    checked={exportFormat === "pdf"}
                    onChange={(e) =>
                      setExportFormat(e.target.value as "pdf" | "excel")
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label
                    htmlFor="pdf"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="excel"
                    name="exportFormat"
                    value="excel"
                    checked={exportFormat === "excel"}
                    onChange={(e) =>
                      setExportFormat(e.target.value as "pdf" | "excel")
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label
                    htmlFor="excel"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Excel Report
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !selectedReport}
              size="lg"
              className="px-8"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Error:</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {generatedReport ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Report Preview</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport("pdf")}
                    disabled={isExporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Export PDF
                  </Button>
                  <Button
                    onClick={() => handleExport("excel")}
                    disabled={isExporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4" />
                    )}
                    Export Excel
                  </Button>
                  <Button
                    onClick={enhancedReportRefreshData}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              <EnhancedReportDisplay
                reportData={generatedReport}
                onExport={handleExport}
                showExportControls={false}
                userRole={userRole}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Report Generated
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate a report first to see the preview
                </p>
                <Button onClick={() => setActiveTab("generate")}>
                  Go to Generate Tab
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Role</Label>
                      <Input value={userRole} disabled />
                    </div>
                    <div>
                      <Label>School ID</Label>
                      <Input value={userSchoolId || "Not assigned"} disabled />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Available Reports</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableReports.map((report) => (
                      <div
                        key={report.value}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        {getReportIcon(report.value)}
                        <span className="text-sm">{report.label}</span>
                        <Badge
                          className={cn(
                            "ml-auto",
                            getCategoryColor(report.category)
                          )}
                        >
                          {report.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Validation Status</h4>
                  <div className="space-y-2">
                    {validationErrors.length > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.length} validation errors</span>
                      </div>
                    )}
                    {validationWarnings.length > 0 && (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {validationWarnings.length} validation warnings
                        </span>
                      </div>
                    )}
                    {validationErrors.length === 0 &&
                      validationWarnings.length === 0 && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>All validations passed</span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReportGenerator;
