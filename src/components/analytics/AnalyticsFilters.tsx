import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { reportExportService } from "@/services/reportExportService";
import { Download, Loader2 } from "lucide-react";

export interface AnalyticsFiltersProps {
  filters: {
    term: string;
    class: string;
    subject: string;
    dateRange: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      term: string;
      class: string;
      subject: string;
      dateRange: string;
    }>
  >;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    if (!user || !schoolId) {
      toast({
        title: "Export Failed",
        description: "User or school information not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);

      // Create report data based on current filters
      const reportData = {
        id: `analytics-${user.role}-${Date.now()}`,
        title: `${
          user.role === "teacher" ? "Teacher" : "Class"
        } Analytics Report`,
        generatedAt: new Date().toISOString(),
        generatedBy: user.name || user.email || "Unknown",
        role: user.role || "unknown",
        schoolInfo: {
          name: "Current School", // This would be fetched from school context
        },
        content: {
          filters: {
            term: filters.term,
            dateRange: filters.dateRange,
            class: filters.class,
            subject: filters.subject,
          },
          summary: {
            reportType: "analytics",
            filtersApplied: Object.values(filters).filter(
              (f) => f !== "all" && f !== "current"
            ).length,
            generatedAt: new Date().toLocaleString(),
          },
        },
      };

      const fileName = `${user.role}_analytics_${filters.term}_${
        filters.dateRange
      }_${new Date().toISOString().split("T")[0]}`;

      await reportExportService.exportReport(reportData, fileName, "pdf");

      toast({
        title: "Report Exported",
        description: `Analytics report has been exported successfully as ${fileName}.pdf`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export the analytics report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleTermChange = (value: string) => {
    setFilters((prev) => ({ ...prev, term: value }));
    console.log("Term filter changed to:", value);
  };

  const handleDateRangeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, dateRange: value }));
    console.log("Date range filter changed to:", value);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={filters.term} onValueChange={handleTermChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Term" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">Current Term</SelectItem>
          <SelectItem value="term1">Term 1</SelectItem>
          <SelectItem value="term2">Term 2</SelectItem>
          <SelectItem value="term3">Term 3</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="term">This Term</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExportReport}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export Report
          </>
        )}
      </Button>
    </div>
  );
};

export default AnalyticsFilters;
