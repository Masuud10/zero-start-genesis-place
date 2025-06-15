
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";

// Role-specific report options mapping
const ROLE_REPORT_OPTIONS: Record<string, { value: string, label: string, desc: string }[]> = {
  edufam_admin: [
    { value: "grades", label: "Grades Report", desc: "All schools: class, subject grades & analytics" },
    { value: "attendance", label: "Attendance Report", desc: "Attendance trends across schools" },
    { value: "finance", label: "Finance Overview", desc: "Billing, fee collection, outstanding balances" },
    { value: "school_summary", label: "School Summary", desc: "All schools; aggregate academic summaries" },
    { value: "system_performance", label: "System Performance", desc: "Platform performance metrics, errors, usage" },
    { value: "billing_overview", label: "Billing Overview", desc: "System/School billing and payment analytics" },
    { value: "audit_log", label: "Security & Audit Log", desc: "System-wide audit and security logs" },
  ],
  principal: [
    { value: "grades", label: "Grades Report", desc: "Full class, subject grades & stats" },
    { value: "attendance", label: "Attendance Report", desc: "Attendance summary & trends" },
    { value: "finance", label: "Finance Summary", desc: "Fee collection and outstanding balance" },
    { value: "school_summary", label: "School Summary", desc: "Aggregate summary by term/year" },
  ],
  school_owner: [
    { value: "grades", label: "Grades Report", desc: "Full class, subject grades & stats" },
    { value: "attendance", label: "Attendance Report", desc: "Attendance summary & trends" },
    { value: "finance", label: "Finance Summary", desc: "Fee collection and outstanding balance" },
    { value: "school_summary", label: "School Summary", desc: "Aggregate summary by term/year" },
  ],
  teacher: [
    { value: "grades", label: "Grades Report", desc: "Your classes & subjects grades" },
    { value: "attendance", label: "Attendance Report", desc: "Your class attendance summary" },
  ],
  parent: [
    { value: "grades", label: "Grades Report", desc: "Your child's grades" },
    { value: "attendance", label: "Attendance Report", desc: "Your child's attendance record" },
  ],
  finance_officer: [
    { value: "finance", label: "Finance Summary", desc: "Finance and fee summary for school" },
  ]
};
// Fallback if unknown role
const DEFAULT_REPORTS = [
  { value: "grades", label: "Grades Report", desc: "" },
  { value: "attendance", label: "Attendance Report", desc: "" },
];

type ReportPanelProps = {
  extraFilters?: Record<string, any>;
  hideCard?: boolean;
  // For system admins: allow passing showAll for advanced context if needed
  showAll?: boolean;
};
const termOptions = ["T1", "T2", "T3"];
const yearOptions = Array.from({ length: 5 }, (_, i) => "" + (2022 + i));

export const ReportDownloadPanel: React.FC<ReportPanelProps> = ({ extraFilters = {}, hideCard, showAll }) => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("");
  const [year, setYear] = useState("" + new Date().getFullYear());
  const [term, setTerm] = useState(termOptions[0]);
  const [downloading, setDownloading] = useState(false);

  // Provide all options for system admins
  const available =
    showAll || user?.role === "edufam_admin"
      ? ROLE_REPORT_OPTIONS.edufam_admin
      : ROLE_REPORT_OPTIONS[user?.role as string] || DEFAULT_REPORTS;

  const handleDownload = async () => {
    if (!reportType) {
      toast({ title: "Select Type", description: "Please select a report type.", variant: "destructive" });
      return;
    }
    setDownloading(true);
    try {
      // Map UI report type to API reportType
      let apiType = "";
      switch (reportType) {
        case "grades":
          apiType =
            ["principal", "school_owner", "edufam_admin"].includes(user?.role || "")
              ? "principal-academic"
              : "teacher-parent-grades";
          break;
        case "attendance":
          apiType =
            ["principal", "school_owner", "edufam_admin"].includes(user?.role || "")
              ? "principal-attendance"
              : "teacher-parent-attendance";
          break;
        case "finance":
        case "finance_overview":
          apiType =
            user?.role === "edufam_admin" ? "system-finance" : "principal-finance";
          break;
        case "school_summary":
          apiType = user?.role === "edufam_admin" ? "system-school-summary" : "school-summary";
          break;
        case "system_performance":
          apiType = "system-performance";
          break;
        case "billing_overview":
          apiType = "system-billing";
          break;
        case "audit_log":
          apiType = "system-audit";
          break;
        default:
          apiType = "custom";
      }
      // Compose request payload
      const payload = {
        reportType: apiType,
        filters: {
          schoolId: currentSchool?.id || user?.school_id,
          year,
          term,
          ...extraFilters,
        },
        userInfo: {
          role: user?.role,
          userName: user?.name || "",
          userSchoolId: user?.school_id || "",
        }
      };
      const response = await fetch(
        "https://lmqyizrnuahkmwauonqr.functions.supabase.co/generate_report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to generate report");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      // Filename
      const name = `${user?.role || "user"}_${reportType}_report_${year}_${term}.pdf`;
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
      a.remove();
      toast({ title: "Report Downloaded!", description: `${available.find(r => r.value === reportType)?.label} for ${year} ${term}.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const Content = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Report Type" />
            </SelectTrigger>
            <SelectContent>
              {available.map(rt => (
                <SelectItem key={rt.value} value={rt.value}>
                  <div>
                    <span className="font-medium">{rt.label}</span>
                    <div className="text-xs text-muted-foreground">{rt.desc}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger><SelectValue placeholder="Term" /></SelectTrigger>
            <SelectContent>
              {termOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleDownload} disabled={downloading || !reportType} className="flex gap-2">
        <Download className="w-4 h-4" />
        {downloading ? "Generating..." : "Download Report"}
      </Button>
    </div>
  );

  if (hideCard) return Content;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FileText className="w-5 h-5 mr-2 inline" />
          Download Reports
        </CardTitle>
        <CardDescription>
          {user?.role === "edufam_admin"
            ? "Generate/download analytics, billing, performance, school summaries and more for any school."
            : "Download term/year academic, attendance, or finance reports (access based on your role)."}
        </CardDescription>
      </CardHeader>
      <CardContent>{Content}</CardContent>
    </Card>
  );
};

export default ReportDownloadPanel;
