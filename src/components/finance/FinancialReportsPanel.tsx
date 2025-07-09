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
} from "lucide-react";
import {
  useFinancialReports,
  ReportType,
  ReportFilter,
  ReportData,
} from "@/hooks/finance/useFinancialReports";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import jsPDF from "jspdf";
import "jspdf-autotable";

const FinancialReportsPanel: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [dateRange, setDateRange] = useState<
    "current_term" | "current_year" | "last_month" | "last_quarter" | "custom"
  >("current_term");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [lastGeneratedReport, setLastGeneratedReport] =
    useState<ReportData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { generateReport, downloadReport, isGenerating, error } =
    useFinancialReports();
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const reportTypes = [
    {
      value: "financial_summary" as const,
      label: "School-wide Financial Summary",
      description: "Comprehensive financial overview",
      icon: DollarSign,
    },
    {
      value: "fee_statements" as const,
      label: "Termly Financial Performance",
      description: "Academic term performance analysis",
      icon: TrendingUp,
    },
    {
      value: "payment_summaries" as const,
      label: "Fee Collection Reports",
      description: "Detailed collection summaries",
      icon: CreditCard,
    },
    {
      value: "outstanding_balances" as const,
      label: "Outstanding Balances",
      description: "Students with pending fees",
      icon: AlertCircle,
    },
    {
      value: "mpesa_transactions" as const,
      label: "MPESA Payment Summary",
      description: "Mobile money payment history",
      icon: CreditCard,
    },
    {
      value: "collection_analysis" as const,
      label: "Student Account Statements",
      description: "Individual student financial records",
      icon: Users,
    },
  ];

  const handleGenerateReport = async (type: ReportType) => {
    if (!type) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    const filters: ReportFilter = {
      dateRange,
      startDate: dateRange === "custom" ? startDate : undefined,
      endDate: dateRange === "custom" ? endDate : undefined,
      classId: classId || undefined,
    };

    const reportData = await generateReport(type, filters);
    if (reportData) {
      setLastGeneratedReport(reportData);
      toast({
        title: "Success",
        description: `${reportData.title} generated successfully with ${reportData.data.length} records`,
      });
    }
  };

  const handleDownloadReport = async (format: "pdf" | "excel" = "pdf") => {
    if (!lastGeneratedReport) {
      toast({
        title: "Error",
        description: "No report to download. Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      if (format === "pdf") {
        await downloadAsPDF(lastGeneratedReport);
      } else {
        await downloadAsExcel(lastGeneratedReport);
      }

      toast({
        title: "Download Complete",
        description: `Report downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsPDF = async (reportData: ReportData) => {
    const doc = new jsPDF();

    // Add school branding
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("EduFam School Management System", 20, 20);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`School: ${user?.school_id || "Your School"}`, 20, 35);
    doc.text(
      `Generated: ${new Date(reportData.generatedAt).toLocaleString()}`,
      20,
      45
    );

    // Report title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(reportData.title, 20, 60);

    // Summary section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, 80);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let yPos = 90;

    Object.entries(reportData.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").trim();
      const displayValue =
        typeof value === "number" && key.toLowerCase().includes("amount")
          ? `KES ${Number(value).toLocaleString()}`
          : typeof value === "number" && key.toLowerCase().includes("rate")
          ? `${Number(value).toFixed(1)}%`
          : String(value);

      doc.text(`${label}: ${displayValue}`, 20, yPos);
      yPos += 8;
    });

    // Data table
    if (reportData.data.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Data Details", 20, yPos);

      const headers = Object.keys(reportData.data[0]);
      const data = reportData.data
        .slice(0, 20)
        .map((row: Record<string, unknown>) =>
          headers.map((header) => String(row[header] || ""))
        );

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        startY: yPos + 5,
        head: [headers],
        body: data,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Powered by EduFam", 20, pageHeight - 20);

    doc.save(
      `${reportData.title.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const downloadAsExcel = async (reportData: ReportData) => {
    // Create CSV content with proper formatting
    let csvContent = `${reportData.title}\n`;
    csvContent += `School: ${user?.school_id || "Your School"}\n`;
    csvContent += `Generated: ${new Date(
      reportData.generatedAt
    ).toLocaleString()}\n\n`;

    // Summary section
    csvContent += "Summary\n";
    Object.entries(reportData.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").trim();
      const displayValue =
        typeof value === "number" && key.toLowerCase().includes("amount")
          ? `KES ${Number(value).toLocaleString()}`
          : typeof value === "number" && key.toLowerCase().includes("rate")
          ? `${Number(value).toFixed(1)}%`
          : String(value);

      csvContent += `${label},${displayValue}\n`;
    });

    csvContent += "\nData Details\n";

    // Data section
    if (reportData.data.length > 0) {
      const headers = Object.keys(reportData.data[0]);
      csvContent += headers.join(",") + "\n";

      reportData.data.forEach((row: Record<string, unknown>) => {
        csvContent +=
          headers.map((header) => `"${String(row[header] || "")}"`).join(",") +
          "\n";
      });
    }

    csvContent += "\nPowered by EduFam\n";

    // Download as CSV (Excel can open CSV files)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${reportData.title.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Financial Reports
          </h2>
          <p className="text-muted-foreground">
            Generate and download comprehensive financial reports
          </p>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {lastGeneratedReport && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lastGeneratedReport.title}</p>
                    <p className="text-sm">
                      {lastGeneratedReport.summary.totalRecords} records
                      generated
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport("pdf")}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport("excel")}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Excel
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card
            key={report.value}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <report.icon className="h-5 w-5" />
                {report.label}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <Badge variant="secondary">PDF & Excel</Badge>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport(report.value)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generated Report Preview */}
      {lastGeneratedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Generated Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {lastGeneratedReport.summary.totalRecords}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Records
                  </div>
                </div>
                {lastGeneratedReport.summary.totalAmount && (
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      KES{" "}
                      {lastGeneratedReport.summary.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Amount
                    </div>
                  </div>
                )}
                {lastGeneratedReport.summary.averageAmount && (
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      KES{" "}
                      {lastGeneratedReport.summary.averageAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Amount
                    </div>
                  </div>
                )}
              </div>

              {lastGeneratedReport.data.length > 0 && (
                <div className="border rounded overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <h4 className="font-medium">Sample Data (First 10 rows)</h4>
                  </div>
                  <div className="p-3">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(lastGeneratedReport.data[0])
                              .slice(0, 6)
                              .map((key) => (
                                <TableHead key={key} className="text-left">
                                  {key}
                                </TableHead>
                              ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lastGeneratedReport.data
                            .slice(0, 10)
                            .map(
                              (row: Record<string, unknown>, index: number) => (
                                <TableRow key={index}>
                                  {Object.values(row)
                                    .slice(0, 6)
                                    .map((value: unknown, i: number) => (
                                      <TableCell key={i} className="text-sm">
                                        {String(value)}
                                      </TableCell>
                                    ))}
                                </TableRow>
                              )
                            )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Monthly Fee Collection Report",
                date: "2024-01-15",
                type: "Collection Analysis",
                size: "2.3 MB",
              },
              {
                name: "Outstanding Balances Report",
                date: "2024-01-14",
                type: "Outstanding Balances",
                size: "1.8 MB",
              },
              {
                name: "Term 1 Financial Summary",
                date: "2024-01-10",
                type: "Financial Summary",
                size: "3.1 MB",
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {report.date}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportsPanel;
