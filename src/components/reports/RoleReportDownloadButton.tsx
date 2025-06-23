
import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Report API error:', errorText);
        throw new Error(`Report generation failed (${res.status}): ${errorText}`);
      }
      
      // Verify we got an Excel file
      const contentType = res.headers.get("Content-Type");
      if (!contentType || !contentType.includes("spreadsheet")) {
        throw new Error("Invalid response format - expected Excel file");
      }
      
      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("Empty report file received");
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report_${term}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 500);
      a.remove();
      
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

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading || !user?.id}
      variant={variant || "outline"}
      size={size}
      className="flex items-center gap-2"
    >
      {!user?.id ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {downloading ? "Generating..." : label || "Download Report"}
    </Button>
  );
};

export default RoleReportDownloadButton;
