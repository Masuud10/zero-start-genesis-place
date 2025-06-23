
import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Download, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import type { VariantProps } from "class-variance-authority";

interface RoleReportDownloadButtonProps extends VariantProps<typeof buttonVariants> {
  type: "grades" | "attendance" | "finance" | "students" | "comprehensive";
  classId?: string;
  term?: string;
  label?: string;
}

const RoleReportDownloadButton: React.FC<RoleReportDownloadButtonProps> = ({ 
  type, 
  classId, 
  term = 'T1', 
  label,
  variant,
  size
}) => {
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download reports.",
        variant: "destructive"
      });
      return;
    }

    setDownloading(true);
    
    try {
      const payload = {
        role: user?.role,
        school_id: currentSchool?.id || user?.school_id,
        class_id: classId,
        type,
        term,
        user_id: user?.id
      };
      
      console.log('📊 Generating report with payload:', payload);
      
      const res = await fetch(
        "https://lmqyizrnuahkmwauonqr.functions.supabase.co/generate_role_report",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          },
          body: JSON.stringify(payload)
        }
      );
      
      if (!res.ok) {
        let errorMessage = `Report generation failed (${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = await res.text() || errorMessage;
        }
        console.error('❌ Report API error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Verify we got an Excel file
      const contentType = res.headers.get("Content-Type");
      if (!contentType || !contentType.includes("spreadsheet")) {
        console.error('❌ Invalid content type:', contentType);
        throw new Error("Invalid response format - expected Excel file");
      }
      
      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("Empty report file received");
      }
      
      console.log('✅ Report blob received:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report_${term}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 500);
      
      toast({ 
        title: "Report Downloaded!", 
        description: label || "Report downloaded successfully." 
      });
      
    } catch (e: any) {
      console.error('❌ Report download error:', e);
      toast({ 
        title: "Download Failed", 
        description: e.message || "Failed to generate report. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setDownloading(false);
    }
  };

  const isDisabled = downloading || !user?.id;

  return (
    <Button
      onClick={handleDownload}
      disabled={isDisabled}
      variant={variant || "outline"}
      size={size}
      className="flex items-center gap-2"
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : !user?.id ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {downloading ? "Generating..." : label || "Download Report"}
    </Button>
  );
};

export default RoleReportDownloadButton;
