
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import pdfmake from "npm:pdfmake@0.2.7/build/pdfmake.js";
import vfsFonts from "npm:pdfmake@0.2.7/build/vfs_fonts.js";
import { 
  generatePlatformOverviewReport,
  generateSchoolsSummaryReport,
  generateUsersAnalyticsReport,
  generateFinancialOverviewReport,
  generateSystemHealthReport,
  generateCompanyProfileReport
} from "./reportGenerators.ts";
import { pdfStyles, defaultStyle } from "./pdfStyles.ts";

// Set pdfmake font
pdfmake.vfs = vfsFonts.pdfMake.vfs;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = "https://lmqyizrnuahkmwauonqr.supabase.co";
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_SERVICE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let body = {};
    try {
      body = req.method === "POST" ? await req.json() : {};
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { reportType, filters = {}, userInfo = {} } = body;
    
    if (!reportType) {
      return new Response(
        JSON.stringify({ error: "reportType is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Generating report:', reportType, 'with filters:', filters);

    let reportContent;
    let reportTitle = "";

    try {
      switch (reportType) {
        case 'platform-overview':
          reportTitle = "EduFam Platform Overview Report";
          reportContent = await generatePlatformOverviewReport(supabase, filters);
          break;

        case 'system-school-summary':
        case 'school-summary':
        case 'schools-summary':  // Fix: Added missing case
          reportTitle = reportType === 'system-school-summary' 
            ? "EduFam System Schools Summary Report" 
            : "School Summary Report";
          reportContent = await generateSchoolsSummaryReport(supabase, filters);
          break;

        case 'users-analytics':
          reportTitle = "EduFam Users Analytics Report";
          reportContent = await generateUsersAnalyticsReport(supabase, filters);
          break;

        case 'financial-overview':
        case 'system-billing':
          reportTitle = reportType === 'system-billing' 
            ? "EduFam System Billing Report" 
            : "Financial Overview Report";
          reportContent = await generateFinancialOverviewReport(supabase, filters);
          break;

        case 'system-health':
        case 'system-performance':
          reportTitle = "EduFam System Performance Report";
          reportContent = await generateSystemHealthReport(supabase, filters);
          break;

        case 'company-profile':
        case 'system-audit':
          reportTitle = reportType === 'system-audit' 
            ? "EduFam System Audit Report" 
            : "EduFam Company Profile Report";
          reportContent = await generateCompanyProfileReport(supabase, filters);
          break;

        default:
          console.error('Invalid report type:', reportType);
          return new Response(
            JSON.stringify({ error: 'Invalid report type: ' + reportType }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }

      if (!reportContent || reportContent.length === 0) {
        console.warn('No report content generated for:', reportType);
        reportContent = [
          { text: 'No Data Available', style: 'header' },
          { text: 'Unable to generate report data at this time.', margin: [0, 10] }
        ];
      }

    } catch (reportError) {
      console.error('Error generating report content:', reportError);
      reportContent = [
        { text: 'Report Generation Error', style: 'error' },
        { text: `Error: ${reportError.message}`, margin: [0, 10] }
      ];
    }

    console.log('Report content generated, creating PDF...');

    // Get company details for footer
    let companyFooter = {};
    try {
      const { data: companyDetails } = await supabase
        .from('company_details')
        .select('*')
        .single();
      
      if (companyDetails) {
        companyFooter = {
          text: [
            { text: '\n\n--- Company Information ---\n', style: 'footer', alignment: 'center' },
            { text: `${companyDetails.company_name}\n`, style: 'footer', alignment: 'center' },
            { text: `${companyDetails.website_url} | ${companyDetails.support_email}\n`, style: 'footer', alignment: 'center' },
            { text: `${companyDetails.headquarters_address}\n`, style: 'footer', alignment: 'center' },
            { text: `Phone: ${companyDetails.contact_phone} | Est. ${companyDetails.year_established}`, style: 'footer', alignment: 'center' }
          ]
        };
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    }

    // Generate PDF with enhanced styling
    const docDefinition = {
      content: [
        {
          text: reportTitle,
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          style: 'date',
          alignment: 'right',
          margin: [0, 0, 0, 20]
        },
        ...reportContent,
        {
          text: '\n\n--- End of Report ---',
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0]
        },
        companyFooter
      ],
      styles: pdfStyles,
      defaultStyle: defaultStyle
    };

    try {
      const pdfDocGenerator = pdfmake.createPdf(docDefinition);
      
      const getPdfBuffer = () =>
        new Promise((resolve, reject) => {
          pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
            if (buffer && buffer.length > 0) {
              resolve(buffer);
            } else {
              reject(new Error('Failed to generate PDF buffer'));
            }
          });
        });

      const pdfBuffer = await getPdfBuffer();
      console.log('PDF generated successfully, size:', (pdfBuffer as Uint8Array).length);

      return new Response(pdfBuffer as Uint8Array, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="edufam_${reportType}_${Date.now()}.pdf"`
        }
      });

    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      return new Response(
        JSON.stringify({ 
          error: 'PDF generation failed',
          details: pdfError.message
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: any) {
    console.error('[generate_report] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
