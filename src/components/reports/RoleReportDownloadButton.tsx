
import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Download, AlertCircle, Loader2, FileSpreadsheet } from "lucide-react";
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

  const getReportTypeLabel = (reportType: string) => {
    switch (reportType) {
      case 'grades': return 'Academic Performance';
      case 'attendance': return 'Attendance';
      case 'finance': return 'Financial';
      case 'students': return 'Student Information';
      case 'comprehensive': return 'Comprehensive';
      default: return 'Report';
    }
  };

  const handleDownload = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download reports.",
        variant: "destructive"
      });
      return;
    }

    if (!currentSchool?.id && user.role !== 'edufam_admin') {
      toast({
        title: "School Context Required",
        description: "No school context available. Please contact your administrator.",
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
          console.error('❌ Report API error details:', errorData);
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
          console.error('❌ Report API error text:', errorText);
        }
        throw new Error(errorMessage);
      }
      
      // Verify we got an Excel file
      const contentType = res.headers.get("Content-Type");
      if (!contentType || !contentType.includes("spreadsheet")) {
        console.error('❌ Invalid content type received:', contentType);
        throw new Error("Invalid response format - expected Excel file");
      }
      
      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("Empty report file received - no data available for the selected criteria");
      }
      
      console.log('✅ Report blob received:', blob.size, 'bytes');
      
      // Create download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const schoolName = currentSchool?.name || 'School';
      const reportTypeLabel = getReportTypeLabel(type);
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `${schoolName}_${reportTypeLabel}_Report_${term}_${dateStr}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 500);
      
      toast({ 
        title: "Report Downloaded Successfully!", 
        description: `${reportTypeLabel} report for ${term} has been downloaded.`,
        duration: 5000
      });
      
    } catch (e: any) {
      console.error('❌ Report download error:', e);
      
      let userFriendlyMessage = "Failed to generate report. Please try again.";
      
      if (e.message.includes("Database error")) {
        userFriendlyMessage = "Database connection issue. Please try again later.";
      } else if (e.message.includes("No data available")) {
        userFriendlyMessage = `No ${getReportTypeLabel(type).toLowerCase()} data found for ${term}. Please check if data exists for this period.`;
      } else if (e.message.includes("Authentication")) {
        userFriendlyMessage = "Authentication error. Please log out and log back in.";
      } else if (e.message.includes("required")) {
        userFriendlyMessage = "Missing required information. Please contact your administrator.";
      }
      
      toast({ 
        title: "Report Download Failed", 
        description: userFriendlyMessage,
        variant: "destructive",
        duration: 7000
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
      className="flex items-center gap-2 min-w-[160px]"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : !user?.id ? (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>Login Required</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          <span>{label || `Download ${getReportTypeLabel(type)}`}</span>
        </>
      )}
    </Button>
  );
};

export default RoleReportDownloadButton;
