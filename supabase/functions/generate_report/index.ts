
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
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!SUPABASE_SERVICE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const { reportType, filters, userInfo } = body;
    
    if (!reportType) {
      throw new Error("reportType is required");
    }

    console.log('Generating report:', reportType);

    let reportContent;
    let reportTitle = "";

    switch (reportType) {
      case 'platform-overview':
        reportTitle = "EduFam Platform Overview Report";
        reportContent = await generatePlatformOverviewReport(supabase, filters);
        break;

      case 'schools-summary':
        reportTitle = "EduFam Schools Summary Report";
        reportContent = await generateSchoolsSummaryReport(supabase, filters);
        break;

      case 'users-analytics':
        reportTitle = "EduFam Users Analytics Report";
        reportContent = await generateUsersAnalyticsReport(supabase, filters);
        break;

      case 'financial-overview':
        reportTitle = "EduFam Financial Overview Report";
        reportContent = await generateFinancialOverviewReport(supabase, filters);
        break;

      case 'system-health':
        reportTitle = "EduFam System Health Report";
        reportContent = await generateSystemHealthReport(supabase, filters);
        break;

      case 'company-profile':
        reportTitle = "EduFam Company Profile Report";
        reportContent = await generateCompanyProfileReport(supabase, filters);
        break;

      default:
        throw new Error('Invalid report type: ' + reportType);
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
        {
          text: 'Powered by EduFam - Education Management System',
          style: 'footer',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        }
      ],
      styles: pdfStyles,
      defaultStyle: defaultStyle
    };

    const pdfDocGenerator = pdfmake.createPdf(docDefinition);
    
    const getPdfBuffer = () =>
      new Promise((resolve, reject) => {
        pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
          if (buffer) {
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

  } catch (error: any) {
    console.error('[generate_report] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack 
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
