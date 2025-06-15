import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

interface DownloadReportButtonProps {
  type: "grades" | "attendance" | "finance";
  label?: string;
  queryFilters?: Record<string, any>;
  filename?: string;
  children?: React.ReactNode;
}

// Helper: Converts array-of-objects to XLSX and triggers download
function exportToExcel(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filename);
}

// Only allow valid table names for type safety!
const TABLE_MAP = {
  grades: {
    table: "grades" as const,
    select:
      "student_id,subject_id,class_id,score,max_score,percentage,position,term,exam_type,status,submitted_by,submitted_at",
    filename: "grades-report.xlsx",
  },
  attendance: {
    table: "attendance" as const,
    select:
      "student_id,class_id,date,status,remarks,session,submitted_by,submitted_at,term",
    filename: "attendance-report.xlsx",
  },
  finance: {
    table: "fees" as const,
    select:
      "student_id,amount,paid_amount,due_date,category,status,term,payment_method,mpesa_code,academic_year",
    filename: "fees-report.xlsx",
  },
};

const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  type,
  label,
  queryFilters,
  filename,
  children
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const meta = TABLE_MAP[type];
      let query = supabase.from(meta.table).select(meta.select);

      // Filters (school_id etc) - can be extended!
      if (queryFilters) {
        Object.entries(queryFilters).forEach(([key, value]) => {
          if (
            typeof value !== "undefined" &&
            value !== null &&
            value !== "all"
          ) {
            query = query.eq(key, value);
          }
        });
      }

      // Fetch all (handle pagination if needed)
      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No records found for this report.",
          variant: "default",
        });
        setLoading(false);
        return;
      }
      exportToExcel(data, filename || meta.filename);
      toast({
        title: "Success",
        description: "Report downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {loading ? "Downloading..." : label || "Download Report"}
      {children}
    </Button>
  );
};

export default DownloadReportButton;
