// Supabase Edge Function: Universal PDF report generator for EduFam dashboards
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import pdfmake from "npm:pdfmake@0.2.7/build/pdfmake.js";
import vfsFonts from "npm:pdfmake@0.2.7/build/vfs_fonts.js";

// Set pdfmake font
pdfmake.vfs = vfsFonts.pdfMake.vfs;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EDUFAM_LOGO_URL = "https://your-domain.com/lovable-uploads/396bf63d-b84a-4ff0-9036-3d28fd1d0cb7.png"; // If served publicly. Else, embed as base64 when needed.

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Setup Supabase client ---
    const SUPABASE_URL = "https://lmqyizrnuahkmwauonqr.supabase.co";
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!SUPABASE_SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // --- Parse request body ---
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const { reportType, filters, userInfo } = body;
    // userInfo: { role, userName, userSchoolId, etc }
    if (!reportType) throw new Error("reportType required");

    // --- Fetch school info ---
    let schoolName = "Unknown School", schoolAddress = "", contact = "", schoolLogo = null;
    if (filters?.schoolId) {
      const { data: school, error } = await supabase.from('schools').select('name,address,phone,email,logo_url').eq('id', filters.schoolId).single();
      if (error) throw error;
      if (school) {
        schoolName = school.name || schoolName;
        schoolAddress = school.address || "";
        contact = `Tel: ${school.phone || "-"} | Email: ${school.email || "-"}`;
        schoolLogo = school.logo_url || null;
      }
    }

    // --- Build report title and section ---
    let reportLabel = "";
    switch (reportType) {
      case "principal-academic":
        reportLabel = `Academic Performance Report (${filters.term || ""} ${filters.year || ""})`;
        break;
      case "principal-attendance":
        reportLabel = `Attendance Summary Report (${filters.term || ""} ${filters.year || ""})`;
        break;
      // ... other report types as needed
      default:
        reportLabel = "Custom Report";
    }
    // User label
    let userLabel = userInfo && userInfo.role ? userInfo.role[0].toUpperCase() + userInfo.role.slice(1) : "User";

    // --- Query report data (EXAMPLE: Academic Performance, extend for other roles!) ---
    let tableData: any[] = [];
    if (reportType === "principal-academic") {
      // Academic grades by class/subject for that school, term, year
      let gradesQuery = supabase
        .from("class_analytics")
        .select("class_id, avg_grade, performance_trend, best_subjects, weakest_subjects, attendance_rate, reporting_period")
        .eq("school_id", filters.schoolId);
      if (filters.term) gradesQuery = gradesQuery.eq("term", filters.term);
      if (filters.year) gradesQuery = gradesQuery.eq("year", filters.year);

      const { data: grades, error } = await gradesQuery;
      if (error) throw error;
      tableData = grades.map((row: any) => [
        row.class_id || "-",
        row.avg_grade != null ? row.avg_grade.toFixed(1) : "-",
        row.performance_trend || "-",
        (row.best_subjects && row.best_subjects.length)
          ? row.best_subjects.map((s: any) => s.subject_id).join(", ") : "-",
        (row.weakest_subjects && row.weakest_subjects.length)
          ? row.weakest_subjects.map((s: any) => s.subject_id).join(", ") : "-",
        row.attendance_rate != null ? row.attendance_rate.toFixed(1) + "%" : "-",
        row.reporting_period || "-"
      ]);
      // Add table headings row
      tableData.unshift([
        "Class ID", "Avg Grade", "Trend", "Top Subjects", "Weakest Subjects", "Attendance", "Period"
      ]);
    }
    // TODO: Handle other report data as needed

    // --- Prepare images (school logo and EduFam logo) ---
    // Fetch EduFam logo as base64 if not public (skipped here for brevity!)
    let edufamLogo = EDUFAM_LOGO_URL; // Ideally, use public URL or fetch+convert to base64 here.
    let schoolLogoImage = schoolLogo || null;
    // You can optionally fetch and embed as data URL for PDFMake images.

    // --- Compose PDF doc definition ---
    // Use pdfmake document definition object
    const docDefinition = {
      content: [
        {
          columns: [
            schoolLogoImage ? { image: schoolLogoImage, fit: [64, 64] } : {},
            {
              width: "*",
              stack: [
                { text: schoolName, style: "header" },
                { text: schoolAddress, style: "subheader" },
                { text: contact, style: "subheader" }
              ],
              margin: [10, 0, 0, 0]
            },
            {
              stack: [
                { image: edufamLogo, fit: [48, 48], alignment: "right", margin: [0, 0, 0, 4] },
                { text: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(), style: "dateTime", alignment: "right" }
              ]
            }
          ]
        },
        { text: " ", margin: [0, 12] },
        { text: reportLabel, style: "reportTitle" },
        { text: `Generated by: ${userLabel}`, style: "userRole" },
        { text: " " },
        (tableData && tableData.length > 0)
          ? { table: { body: tableData }, layout: "lightHorizontalLines" }
          : { text: "No data found for this report and filters.", style: "noData" },
        { text: " " },
        { text: "Note: Certificates generation will be coming soon!", style: "footerNote" }
      ],
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: "Powered by EduFam", color: "#1976D2", fontSize: 10 },
          { image: edufamLogo, fit: [24, 24], alignment: "center" },
          { text: `edufam.ke | Page ${currentPage} of ${pageCount}`, alignment: "right", fontSize: 8 }
        ],
        margin: [20, 0]
      }),
      styles: {
        header: { fontSize: 20, bold: true },
        subheader: { fontSize: 12, color: "#555" },
        dateTime: { fontSize: 10, italics: true },
        reportTitle: { fontSize: 16, bold: true, margin: [0, 10, 0, 10], color: "#1b1464" },
        userRole: { fontSize: 12, italics: true },
        tableHeader: { bold: true, fillColor: "#eee" },
        noData: { italics: true, color: "#f44336" },
        footerNote: { italics: true, fontSize: 10, margin: [0, 20, 0, 0] }
      },
      pageMargins: [28, 48, 28, 65]
    };

    // --- Generate PDF Buffer ---
    const pdfDocGenerator = pdfmake.createPdf(docDefinition);
    // Use a Promise to get the PDF buffer
    const getPdfBuffer = () =>
      new Promise((resolve, reject) => {
        pdfDocGenerator.getBuffer((buffer: Uint8Array) => resolve(buffer));
      });
    const pdfBuffer = await getPdfBuffer();

    // return PDF as application/pdf
    return new Response(pdfBuffer as Uint8Array, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="edufam_report_${reportType}_${Date.now()}.pdf"`
      }
    });
  } catch (e) {
    console.error("[generate_report] Error:", e);
    return new Response(
      JSON.stringify({ error: e.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
