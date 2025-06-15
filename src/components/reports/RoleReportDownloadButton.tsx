
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";

type Props = {
  type: "grades" | "attendance";
  classId?: string;
  term: string;
  label?: string;
};

const RoleReportDownloadButton: React.FC<Props> = ({ type, classId, term, label }) => {
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  const handleDownload = async () => {
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
      const res = await fetch(
        "https://lmqyizrnuahkmwauonqr.functions.supabase.co/generate_role_report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Could not generate report");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report_${term}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 500);
      a.remove();
      toast({ title: "Report Downloaded!", description: label || "Report downloaded successfully." });
    } catch (e: any) {
      toast({ title: "Download Failed", description: e.message, variant: "destructive" });
    }
    setDownloading(false);
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {downloading ? "Generating..." : label || "Download Report"}
    </Button>
  );
};

export default RoleReportDownloadButton;
