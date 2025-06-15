
import React from "react";
import { Button } from "@/components/ui/button";

interface AcademicReportPanelProps {
  downloadingReport: boolean;
  setDownloadingReport: (val: boolean) => void;
  user: any;
  schoolId: string | undefined;
  toast: any;
}

// Copied and reused from PrincipalDashboard
const AcademicReportPanel: React.FC<AcademicReportPanelProps> = ({
  downloadingReport,
  setDownloadingReport,
  user,
  schoolId,
  toast
}) => {
  const handleDownloadAcademicReport = async () => {
    setDownloadingReport(true);
    try {
      const year = new Date().getFullYear();
      const term = 'T1';

      const payload = {
        reportType: "principal-academic",
        filters: {
          schoolId: schoolId || user?.school_id,
          year,
          term,
        },
        userInfo: {
          role: user?.role || "principal",
          userName: user?.name || "",
          userSchoolId: user?.school_id || "",
        },
      };

      const res = await fetch(
        "https://lmqyizrnuahkmwauonqr.functions.supabase.co/generate_report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `principal_academic_report_${year}_${term}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast({
        title: "Report Downloaded",
        description: "Academic Performance PDF generated successfully.",
      });
    } catch (e: any) {
      toast({
        title: "Download Failed",
        description: e.message || "Failed to download report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-50 rounded-lg p-4 mb-2 border border-blue-100">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-blue-900 mb-1 flex items-center gap-2">
          Academic Performance Report (PDF){" "}
          <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Principal</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Download a PDF with class & subject grades, attendance, and summary statistics.
        </p>
        <p className="text-xs text-purple-700 mt-1">Note: Certificates generation will be coming soon!</p>
      </div>
      <Button
        className="flex items-center gap-2 mt-4 md:mt-0"
        onClick={handleDownloadAcademicReport}
        disabled={downloadingReport}
      >
        {downloadingReport ? (
          <>
            <svg className="w-4 h-4 animate-spin mr-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" fill="none" /></svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Download Academic Report
          </>
        )}
      </Button>
    </div>
  );
};

export default AcademicReportPanel;
