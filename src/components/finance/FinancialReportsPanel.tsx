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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Loader2,
  BarChart3,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Building,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  FileSpreadsheet,
  FileDown,
  RefreshCw,
  Clock,
  Percent,
  Calculator,
  Receipt,
  Banknote,
  Coins,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import {
  FinancialReportService,
  FinancialReportData,
  FinancialReportFilters,
} from "@/services/financialReportService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Enhanced Report Types
export type EnhancedReportType =
  | "fee_collection_summary"
  | "pending_fees_balances"
  | "subscription_payments"
  | "mpesa_payments_summary"
  | "setup_fee_records"
  | "transaction_history"
  | "custom_date_financial_summary"
  | "revenue_analysis"
  | "expense_breakdown"
  | "student_account_statements";

interface SchoolInfo {
  name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface ReportState {
  isGenerating: boolean;
  isDownloading: boolean;
  lastGenerated: FinancialReportData | null;
  lastGeneratedAt: string | null;
  error: string | null;
}

const FinancialReportsPanel: React.FC = () => {
  const [dateRange, setDateRange] = useState<
    "current_term" | "current_year" | "last_month" | "last_quarter" | "custom"
  >("current_term");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");
  const [selectedReport, setSelectedReport] =
    useState<EnhancedReportType | null>(null);

  // Initialize report states dynamically based on available report types
  const [reportStates, setReportStates] = useState<
    Record<EnhancedReportType, ReportState>
  >(() => {
    const initialStates: Record<EnhancedReportType, ReportState> = {} as Record<
      EnhancedReportType,
      ReportState
    >;

    // Initialize states for all possible report types
    const allPossibleTypes: EnhancedReportType[] = [
      "fee_collection_summary",
      "pending_fees_balances",
      "subscription_payments",
      "mpesa_payments_summary",
      "setup_fee_records",
      "transaction_history",
      "custom_date_financial_summary",
      "revenue_analysis",
      "expense_breakdown",
      "student_account_statements",
    ];

    allPossibleTypes.forEach((type) => {
      initialStates[type] = {
        isGenerating: false,
        isDownloading: false,
        lastGenerated: null,
        lastGeneratedAt: null,
        error: null,
      };
    });

    return initialStates;
  });
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId, isReady } = useSchoolScopedData();

  // Strict role validation
  useEffect(() => {
    if (user) {
      const accessValidation = FinancialReportService.validateUserAccess(user);
      if (!accessValidation.isValid) {
        toast({
          title: "Access Denied",
          description:
            accessValidation.error ||
            "This feature is restricted to Finance Officers only.",
          variant: "destructive",
        });
      }
    }
  }, [user, toast]);

  // Fetch school information
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      if (!schoolId) return;

      try {
        const { data, error } = await supabase
          .from("schools")
          .select("name, logo_url, address, phone, email")
          .eq("id", schoolId)
          .single();

        if (error) throw error;
        setSchoolInfo(data);
      } catch (err) {
        console.error("Error fetching school info:", err);
        // Don't show toast for school info fetch errors as it's not critical
        // The component can still function without school info
      }
    };

    fetchSchoolInfo();
  }, [schoolId]);

  // Define all available report types
  const allReportTypes = [
    {
      value: "fee_collection_summary" as const,
      label: "Fee Collection Summary",
      description:
        "Comprehensive fee collection analysis with payment tracking",
      icon: DollarSign,
      category: "Collection",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      bgColor: "bg-blue-500",
      restrictedTo: [] as string[], // Available to all
    },
    {
      value: "pending_fees_balances" as const,
      label: "Pending Fees & Balances",
      description: "Students with outstanding fees and payment defaults",
      icon: AlertCircle,
      category: "Outstanding",
      color: "bg-red-50 text-red-700 border-red-200",
      bgColor: "bg-red-500",
      restrictedTo: [] as string[], // Available to all
    },
    {
      value: "subscription_payments" as const,
      label: "Subscription Payments",
      description: "Monthly subscription payment tracking and analysis",
      icon: CreditCard,
      category: "Subscriptions",
      color: "bg-green-50 text-green-700 border-green-200",
      bgColor: "bg-green-500",
      restrictedTo: ["edufam_admin"], // Only for edufam admin
    },
    {
      value: "mpesa_payments_summary" as const,
      label: "M-PESA Payments Summary",
      description: "Mobile money transaction summaries and trends",
      icon: Banknote,
      category: "Mobile Payments",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      bgColor: "bg-purple-500",
      restrictedTo: [] as string[], // Available to all
    },
    {
      value: "setup_fee_records" as const,
      label: "Setup Fee Records",
      description: "Initial setup and registration fee collections",
      icon: Building,
      category: "Setup Fees",
      color: "bg-orange-50 text-orange-700 border-orange-200",
      bgColor: "bg-orange-500",
      restrictedTo: ["edufam_admin"], // Only for edufam admin
    },
    {
      value: "transaction_history" as const,
      label: "Transaction History",
      description: "Complete financial transaction audit trail",
      icon: Receipt,
      category: "Transactions",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      bgColor: "bg-indigo-500",
      restrictedTo: [] as string[], // Available to all
    },
    {
      value: "custom_date_financial_summary" as const,
      label: "Custom Date Financial Summary",
      description: "Financial summary for custom date ranges",
      icon: Calendar,
      category: "Custom Reports",
      color: "bg-teal-50 text-teal-700 border-teal-200",
      bgColor: "bg-teal-500",
      restrictedTo: [] as string[], // Available to all
    },
    {
      value: "revenue_analysis" as const,
      label: "Revenue Analysis",
      description: "Detailed revenue trends and financial analysis",
      icon: TrendingUp,
      category: "Analytics",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      bgColor: "bg-emerald-500",
      restrictedTo: [] as string[], // Available to all
    },
    {
      value: "expense_breakdown" as const,
      label: "Expense Breakdown",
      description: "Detailed expense categorization and analysis",
      icon: TrendingDown,
      category: "Expenses",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      bgColor: "bg-rose-500",
      restrictedTo: [] as string[], // Available to all
    },
    {
      value: "student_account_statements" as const,
      label: "Student Account Statements",
      description: "Individual student financial account statements",
      icon: Users,
      category: "Accounts",
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      bgColor: "bg-cyan-500",
      restrictedTo: [] as string[], // Available to all
    },
  ];

  // Filter report types based on user role
  const reportTypes = allReportTypes.filter((report) => {
    // If no user, don't show any reports
    if (!user) return false;

    // If report is restricted to specific roles, check if user has access
    if (report.restrictedTo.length > 0) {
      return report.restrictedTo.includes(user.role);
    }
    // If no restrictions, show to all authenticated users
    return true;
  });

  // Group reports by category
  const groupedReports = reportTypes.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, typeof reportTypes>);

  const handleGenerateReport = async (type: EnhancedReportType) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate reports.",
        variant: "destructive",
      });
      return;
    }

    if (!schoolId) {
      toast({
        title: "School Required",
        description: "School information is required to generate reports.",
        variant: "destructive",
      });
      return;
    }

    // Validate custom date range if selected
    if (dateRange === "custom") {
      if (!startDate || !endDate) {
        toast({
          title: "Date Range Required",
          description:
            "Please select both start and end dates for custom range.",
          variant: "destructive",
        });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        toast({
          title: "Invalid Date Range",
          description: "Start date must be before end date.",
          variant: "destructive",
        });
        return;
      }

      // Validate date range is not too large (e.g., max 2 years)
      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 730) {
        // 2 years
        toast({
          title: "Date Range Too Large",
          description: "Please select a date range of 2 years or less.",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate user access
    const accessValidation = FinancialReportService.validateUserAccess(user);
    if (!accessValidation.isValid) {
      toast({
        title: "Access Denied",
        description:
          accessValidation.error ||
          "You don't have permission to generate reports.",
        variant: "destructive",
      });
      return;
    }

    setReportStates((prev) => ({
      ...prev,
      [type]: { ...prev[type], isGenerating: true, error: null },
    }));

    try {
      const filters: FinancialReportFilters = {
        dateRange,
        startDate: dateRange === "custom" ? startDate : undefined,
        endDate: dateRange === "custom" ? endDate : undefined,
        classId: classId || undefined,
        term: term || undefined,
        academicYear: academicYear || undefined,
        schoolId,
      };

      const reportData = await FinancialReportService.generateReport(
        type as string, // Fix: Cast to string to match service method signature
        schoolId,
        filters,
        user
      );

      setReportStates((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          isGenerating: false,
          lastGenerated: reportData,
          lastGeneratedAt: new Date().toISOString(),
          error: null,
        },
      }));

      toast({
        title: "Report Generated",
        description: `${reportData.title} has been generated successfully.`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate report";

      setReportStates((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          isGenerating: false,
          error: errorMessage,
        },
      }));

      toast({
        title: "Generation Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async (
    type: EnhancedReportType,
    format: "pdf" | "excel" = "pdf"
  ) => {
    const reportState = reportStates[type];
    if (!reportState?.lastGenerated) {
      toast({
        title: "Error",
        description: "No report to download. Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    setReportStates((prev) => ({
      ...prev,
      [type]: { ...prev[type], isDownloading: true },
    }));

    try {
      const reportData = reportState.lastGenerated;
      if (!reportData) {
        throw new Error("Report data is missing");
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${type}_${timestamp}`;

      if (format === "pdf") {
        await generatePDF(reportData, filename);
      } else {
        await generateExcel(reportData, filename);
      }

      toast({
        title: "Download Complete",
        description: `${format.toUpperCase()} report downloaded successfully`,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to download report";
      toast({
        title: "Download Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setReportStates((prev) => ({
        ...prev,
        [type]: { ...prev[type], isDownloading: false },
      }));
    }
  };

  const generatePDF = async (
    reportData: FinancialReportData,
    filename: string
  ) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      // Add header with school name
      if (schoolInfo?.name) {
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(schoolInfo.name, margin, yPosition);
        yPosition += 10;
      }

      // Add report title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(reportData.title || "Financial Report", margin, yPosition);
      yPosition += 10;

      // Add generation timestamp
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${new Date(
          reportData.generatedAt || Date.now()
        ).toLocaleString()}`,
        margin,
        yPosition
      );
      yPosition += 15;

      // Add summary section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Records: ${reportData.summary?.totalRecords || 0}`,
        margin,
        yPosition
      );
      yPosition += 6;

      if (
        reportData.summary?.totalAmount !== undefined &&
        reportData.summary.totalAmount !== null
      ) {
        doc.text(
          `Total Amount: KES ${Number(
            reportData.summary.totalAmount
          ).toLocaleString()}`,
          margin,
          yPosition
        );
        yPosition += 6;
      }

      if (
        reportData.summary?.averageAmount !== undefined &&
        reportData.summary.averageAmount !== null
      ) {
        doc.text(
          `Average Amount: KES ${Number(
            reportData.summary.averageAmount
          ).toLocaleString()}`,
          margin,
          yPosition
        );
        yPosition += 6;
      }

      if (
        reportData.summary?.collectionRate !== undefined &&
        reportData.summary.collectionRate !== null
      ) {
        doc.text(
          `Collection Rate: ${Number(reportData.summary.collectionRate).toFixed(
            1
          )}%`,
          margin,
          yPosition
        );
        yPosition += 6;
      }

      if (
        reportData.summary?.outstandingAmount !== undefined &&
        reportData.summary.outstandingAmount !== null
      ) {
        doc.text(
          `Outstanding Amount: KES ${Number(
            reportData.summary.outstandingAmount
          ).toLocaleString()}`,
          margin,
          yPosition
        );
        yPosition += 6;
      }

      yPosition += 10;

      // Add data table if available
      if (reportData.data && reportData.data.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Report Data", margin, yPosition);
        yPosition += 8;

        const firstRecord = reportData.data[0];
        if (firstRecord && typeof firstRecord === "object") {
          const headers = Object.keys(firstRecord);
          const tableData = reportData.data
            .slice(0, 50) // Limit to first 50 records for PDF
            .map((item: Record<string, unknown>) =>
              Object.values(item).map((val) => String(val || ""))
            );

          // Use jsPDF autoTable with proper typing
          const docWithAutoTable = doc as jsPDF & {
            autoTable: (options: {
              head: string[][];
              body: string[][];
              startY: number;
              styles: { fontSize: number; cellPadding: number };
              headStyles: { fillColor: number[]; textColor: number[] };
              alternateRowStyles: { fillColor: number[] };
              margin: { top: number };
            }) => void;
          };

          docWithAutoTable.autoTable({
            head: [headers.map((h) => h.replace(/_/g, " ").toUpperCase())],
            body: tableData,
            startY: yPosition,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: {
              fillColor: [66, 139, 202],
              textColor: [255, 255, 255],
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 5 },
          });
        }
      }

      // Add footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Powered by EduFam", pageWidth / 2, pageHeight - 10, {
        align: "center",
      });

      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF report");
    }
  };

  const generateExcel = async (
    reportData: FinancialReportData,
    filename: string
  ) => {
    try {
      // Create main data sheet
      const ws = XLSX.utils.json_to_sheet(reportData.data || []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report Data");

      // Add summary sheet
      const summaryData = [
        {
          Metric: "Total Records",
          Value: reportData.summary?.totalRecords || 0,
        },
        {
          Metric: "Total Amount",
          Value: reportData.summary?.totalAmount || 0,
        },
        {
          Metric: "Average Amount",
          Value: reportData.summary?.averageAmount || 0,
        },
        {
          Metric: "Collection Rate",
          Value: reportData.summary?.collectionRate || 0,
        },
        {
          Metric: "Outstanding Amount",
          Value: reportData.summary?.outstandingAmount || 0,
        },
      ];
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      throw new Error("Failed to generate Excel report");
    }
  };

  const getReportStatus = (type: EnhancedReportType) => {
    const state = reportStates[type];
    if (!state) return "idle";
    if (state.isGenerating) return "generating";
    if (state.isDownloading) return "downloading";
    if (state.lastGenerated) return "generated";
    if (state.error) return "error";
    return "idle";
  };

  const getStatusIcon = (type: EnhancedReportType) => {
    const status = getReportStatus(type);
    switch (status) {
      case "generating":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "downloading":
        return <Loader2 className="h-4 w-4 animate-spin text-green-500" />;
      case "generated":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (type: EnhancedReportType) => {
    const status = getReportStatus(type);
    switch (status) {
      case "generating":
        return "Generating...";
      case "downloading":
        return "Downloading...";
      case "generated":
        return "Generated";
      case "error":
        return "Error";
      default:
        return "Not Generated";
    }
  };

  // Show loading state while data is being initialized
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading financial reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Financial Reports
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive financial reports with real-time data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Shield className="h-3 w-3 mr-1" />
            Finance Officer Access
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select
                value={dateRange}
                onValueChange={(
                  value:
                    | "current_term"
                    | "current_year"
                    | "last_month"
                    | "last_quarter"
                    | "custom"
                ) => setDateRange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_term">Current Term</SelectItem>
                  <SelectItem value="current_year">
                    Current Academic Year
                  </SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_quarter">Last Quarter</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class-filter">Class Filter (Optional)</Label>
              <Input
                placeholder="Enter Class ID"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="term">Term (Optional)</Label>
              <Input
                placeholder="e.g., Term 1"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="academic-year">Academic Year (Optional)</Label>
              <Input
                placeholder="e.g., 2024"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>

            {dateRange === "custom" && (
              <>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      {reportTypes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-muted-foreground">
                No reports available for your role. Please contact your
                administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Collection and Outstanding Reports Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collection Reports */}
            {groupedReports["Collection"] &&
              groupedReports["Collection"].length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Collection Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {groupedReports["Collection"].map((report) => {
                        const status = getReportStatus(report.value);
                        const state = reportStates[report.value];

                        return (
                          <Card
                            key={report.value}
                            className={`hover:shadow-lg transition-all duration-200 border-2 ${
                              status === "generated"
                                ? "border-green-200 bg-green-50/50"
                                : status === "error"
                                ? "border-red-200 bg-red-50/50"
                                : status === "generating"
                                ? "border-blue-200 bg-blue-50/50"
                                : "border-gray-200"
                            }`}
                          >
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-3 rounded-lg ${report.color}`}
                                  >
                                    <report.icon className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg mb-1">
                                      {report.label}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                      {report.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                              <div className="space-y-4">
                                {/* Status Indicator */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(report.value)}
                                    <span className="text-sm font-medium">
                                      {getStatusText(report.value)}
                                    </span>
                                  </div>
                                  {state.lastGenerated && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedReport(report.value)
                                      }
                                      className="h-8 px-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                {/* Generate Button */}
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleGenerateReport(report.value)
                                  }
                                  disabled={state.isGenerating}
                                  className="w-full"
                                >
                                  {state.isGenerating ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Generating Report...
                                    </>
                                  ) : (
                                    <>
                                      <BarChart3 className="h-4 w-4 mr-2" />
                                      Generate Report
                                    </>
                                  )}
                                </Button>

                                {/* Download Buttons */}
                                {state.lastGenerated && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadReport(
                                          report.value,
                                          "pdf"
                                        )
                                      }
                                      disabled={state.isDownloading}
                                      className="flex items-center gap-2"
                                    >
                                      {state.isDownloading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <FileDown className="h-3 w-3" />
                                      )}
                                      PDF
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadReport(
                                          report.value,
                                          "excel"
                                        )
                                      }
                                      disabled={state.isDownloading}
                                      className="flex items-center gap-2"
                                    >
                                      {state.isDownloading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <FileSpreadsheet className="h-3 w-3" />
                                      )}
                                      Excel
                                    </Button>
                                  </div>
                                )}

                                {/* Error Display */}
                                {state.error && (
                                  <Alert
                                    variant="destructive"
                                    className="text-sm"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      {state.error}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {/* Last Generated Info */}
                                {state.lastGeneratedAt && (
                                  <div className="text-xs text-muted-foreground text-center">
                                    Last generated:{" "}
                                    {new Date(
                                      state.lastGeneratedAt
                                    ).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Outstanding Reports */}
            {groupedReports["Outstanding"] &&
              groupedReports["Outstanding"].length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Outstanding Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {groupedReports["Outstanding"].map((report) => {
                        const status = getReportStatus(report.value);
                        const state = reportStates[report.value];

                        return (
                          <Card
                            key={report.value}
                            className={`hover:shadow-lg transition-all duration-200 border-2 ${
                              status === "generated"
                                ? "border-green-200 bg-green-50/50"
                                : status === "error"
                                ? "border-red-200 bg-red-50/50"
                                : status === "generating"
                                ? "border-blue-200 bg-blue-50/50"
                                : "border-gray-200"
                            }`}
                          >
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-3 rounded-lg ${report.color}`}
                                  >
                                    <report.icon className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg mb-1">
                                      {report.label}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                      {report.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                              <div className="space-y-4">
                                {/* Status Indicator */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(report.value)}
                                    <span className="text-sm font-medium">
                                      {getStatusText(report.value)}
                                    </span>
                                  </div>
                                  {state.lastGenerated && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedReport(report.value)
                                      }
                                      className="h-8 px-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                {/* Generate Button */}
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleGenerateReport(report.value)
                                  }
                                  disabled={state.isGenerating}
                                  className="w-full"
                                >
                                  {state.isGenerating ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Generating Report...
                                    </>
                                  ) : (
                                    <>
                                      <BarChart3 className="h-4 w-4 mr-2" />
                                      Generate Report
                                    </>
                                  )}
                                </Button>

                                {/* Download Buttons */}
                                {state.lastGenerated && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadReport(
                                          report.value,
                                          "pdf"
                                        )
                                      }
                                      disabled={state.isDownloading}
                                      className="flex items-center gap-2"
                                    >
                                      {state.isDownloading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <FileDown className="h-3 w-3" />
                                      )}
                                      PDF
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadReport(
                                          report.value,
                                          "excel"
                                        )
                                      }
                                      disabled={state.isDownloading}
                                      className="flex items-center gap-2"
                                    >
                                      {state.isDownloading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <FileSpreadsheet className="h-3 w-3" />
                                      )}
                                      Excel
                                    </Button>
                                  </div>
                                )}

                                {/* Error Display */}
                                {state.error && (
                                  <Alert
                                    variant="destructive"
                                    className="text-sm"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      {state.error}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {/* Last Generated Info */}
                                {state.lastGeneratedAt && (
                                  <div className="text-xs text-muted-foreground text-center">
                                    Last generated:{" "}
                                    {new Date(
                                      state.lastGeneratedAt
                                    ).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Other Report Categories in 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(groupedReports)
              .filter(
                ([category]) =>
                  category !== "Collection" && category !== "Outstanding"
              )
              .filter(([category, reports]) => reports && reports.length > 0)
              .map(([category, reports]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {category} Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.map((report) => {
                        const status = getReportStatus(report.value);
                        const state = reportStates[report.value];

                        return (
                          <Card
                            key={report.value}
                            className={`hover:shadow-lg transition-all duration-200 border-2 ${
                              status === "generated"
                                ? "border-green-200 bg-green-50/50"
                                : status === "error"
                                ? "border-red-200 bg-red-50/50"
                                : status === "generating"
                                ? "border-blue-200 bg-blue-50/50"
                                : "border-gray-200"
                            }`}
                          >
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-3 rounded-lg ${report.color}`}
                                  >
                                    <report.icon className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg mb-1">
                                      {report.label}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                      {report.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                              <div className="space-y-4">
                                {/* Status Indicator */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(report.value)}
                                    <span className="text-sm font-medium">
                                      {getStatusText(report.value)}
                                    </span>
                                  </div>
                                  {state.lastGenerated && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedReport(report.value)
                                      }
                                      className="h-8 px-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                {/* Generate Button */}
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleGenerateReport(report.value)
                                  }
                                  disabled={state.isGenerating}
                                  className="w-full"
                                >
                                  {state.isGenerating ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Generating Report...
                                    </>
                                  ) : (
                                    <>
                                      <BarChart3 className="h-4 w-4 mr-2" />
                                      Generate Report
                                    </>
                                  )}
                                </Button>

                                {/* Download Buttons */}
                                {state.lastGenerated && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadReport(
                                          report.value,
                                          "pdf"
                                        )
                                      }
                                      disabled={state.isDownloading}
                                      className="flex items-center gap-2"
                                    >
                                      {state.isDownloading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <FileDown className="h-3 w-3" />
                                      )}
                                      PDF
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadReport(
                                          report.value,
                                          "excel"
                                        )
                                      }
                                      disabled={state.isDownloading}
                                      className="flex items-center gap-2"
                                    >
                                      {state.isDownloading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <FileSpreadsheet className="h-3 w-3" />
                                      )}
                                      Excel
                                    </Button>
                                  </div>
                                )}

                                {/* Error Display */}
                                {state.error && (
                                  <Alert
                                    variant="destructive"
                                    className="text-sm"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      {state.error}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {/* Last Generated Info */}
                                {state.lastGeneratedAt && (
                                  <div className="text-xs text-muted-foreground text-center">
                                    Last generated:{" "}
                                    {new Date(
                                      state.lastGeneratedAt
                                    ).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Report Preview Modal */}
          {selectedReport && reportStates[selectedReport]?.lastGenerated && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Report Preview:{" "}
                  {reportStates[selectedReport]?.lastGenerated?.title ||
                    "Financial Report"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-blue-50">
                      <div className="text-2xl font-bold text-blue-600">
                        {reportStates[selectedReport]?.lastGenerated?.summary
                          ?.totalRecords || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total Records
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">
                        KES{" "}
                        {Number(
                          reportStates[selectedReport]?.lastGenerated?.summary
                            ?.totalAmount || 0
                        ).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-orange-50">
                      <div className="text-2xl font-bold text-orange-600">
                        KES{" "}
                        {Number(
                          reportStates[selectedReport]?.lastGenerated?.summary
                            ?.averageAmount || 0
                        ).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Average Amount
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-purple-50">
                      <div className="text-2xl font-bold text-purple-600">
                        {Number(
                          reportStates[selectedReport]?.lastGenerated?.summary
                            ?.collectionRate || 0
                        ).toFixed(1)}
                        %
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Collection Rate
                      </p>
                    </div>
                  </div>

                  {/* Sample Data Table */}
                  {reportStates[selectedReport]?.lastGenerated?.data &&
                    reportStates[selectedReport].lastGenerated.data.length >
                      0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b">
                          <h4 className="font-medium">
                            Sample Data (First 10 Records)
                          </h4>
                        </div>
                        <div className="max-h-96 overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(
                                  reportStates[selectedReport]?.lastGenerated
                                    ?.data[0] || {}
                                ).map((key) => (
                                  <TableHead key={key} className="text-xs">
                                    {key.replace(/_/g, " ").toUpperCase()}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reportStates[selectedReport]?.lastGenerated?.data
                                .slice(0, 10)
                                .map((row, index) => (
                                  <TableRow key={index}>
                                    {Object.values(row).map(
                                      (value, cellIndex) => (
                                        <TableCell
                                          key={cellIndex}
                                          className="text-xs"
                                        >
                                          {String(value || "")}
                                        </TableCell>
                                      )
                                    )}
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialReportsPanel;
