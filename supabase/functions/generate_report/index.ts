
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting report generation...');
    
    const SUPABASE_URL = "https://lmqyizrnuahkmwauonqr.supabase.co";
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_SERVICE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Service configuration error - missing API key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('✅ Supabase client initialized');

    // Parse request body
    let body = {};
    try {
      const requestText = await req.text();
      body = requestText ? JSON.parse(requestText) : {};
      console.log('📋 Request body parsed:', body);
    } catch (error) {
      console.error("❌ Failed to parse request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body - must be valid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { reportType, filters = {}, userInfo = {} } = body;
    
    if (!reportType) {
      console.error("❌ Missing reportType in request");
      return new Response(
        JSON.stringify({ error: "reportType is required in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('📊 Generating report:', reportType, 'with filters:', filters);

    let reportContent: any[] = [];
    let reportTitle = "";

    try {
      switch (reportType) {
        case 'platform-overview':
          reportTitle = "EduFam Platform Overview Report";
          reportContent = await generatePlatformOverviewReport(supabase, filters);
          break;

        case 'system-school-summary':
        case 'school-summary':
        case 'schools-summary':
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
          console.error('❌ Invalid report type:', reportType);
          return new Response(
            JSON.stringify({ 
              error: 'Invalid report type: ' + reportType,
              availableTypes: ['platform-overview', 'schools-summary', 'users-analytics', 'financial-overview', 'system-health', 'company-profile']
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }

      console.log('📄 Report content generated, items:', reportContent?.length || 0);

      if (!reportContent || reportContent.length === 0) {
        console.warn('⚠️ No report content generated for:', reportType);
        reportContent = [
          { text: 'No Data Available', style: 'header', margin: [0, 20] },
          { text: 'This report could not be generated due to insufficient data.', style: 'normal', margin: [0, 10] },
          { text: 'Possible reasons:', style: 'sectionHeader', margin: [0, 15, 0, 5] },
          {
            ul: [
              'The system is new and data collection is still in progress',
              'No relevant data exists for the requested time period',
              'Data synchronization is temporarily unavailable',
              'The requested filters returned no matching records'
            ]
          },
          { text: 'Please try again later or contact support for assistance.', style: 'normal', margin: [0, 15] }
        ];
      }

    } catch (reportError) {
      console.error('❌ Error generating report content:', reportError);
      reportContent = [
        { text: 'Report Generation Error', style: 'error', margin: [0, 20] },
        { text: `Error: ${reportError.message || 'Unknown error occurred'}`, style: 'normal', margin: [0, 10] },
        { text: 'Please contact support with the following details:', style: 'normal', margin: [0, 15, 0, 5] },
        {
          ul: [
            `Report Type: ${reportType}`,
            `Timestamp: ${new Date().toISOString()}`,
            `Error: ${reportError.message || 'Unknown error'}`
          ]
        }
      ];
    }

    console.log('🏢 Fetching company details for footer...');

    // Get company details for footer
    let companyFooter: any = {};
    try {
      const { data: companyDetails } = await supabase
        .from('company_details')
        .select('*')
        .single();
      
      if (companyDetails) {
        companyFooter = {
          text: [
            { text: '\n\n--- Company Information ---\n', style: 'footer', alignment: 'center' },
            { text: `${companyDetails.company_name || 'EduFam'}\n`, style: 'footer', alignment: 'center' },
            { text: `${companyDetails.website_url || 'https://edufam.com'} | ${companyDetails.support_email || 'support@edufam.com'}\n`, style: 'footer', alignment: 'center' },
            { text: `${companyDetails.headquarters_address || 'Global Operations'}\n`, style: 'footer', alignment: 'center' },
            { text: `Phone: ${companyDetails.contact_phone || 'Available on request'} | Est. ${companyDetails.year_established || 2024}`, style: 'footer', alignment: 'center' }
          ]
        };
        console.log('✅ Company footer created');
      } else {
        console.log('ℹ️ No company details found, using defaults');
        companyFooter = {
          text: [
            { text: '\n\n--- Company Information ---\n', style: 'footer', alignment: 'center' },
            { text: 'EduFam\n', style: 'footer', alignment: 'center' },
            { text: 'https://edufam.com | support@edufam.com\n', style: 'footer', alignment: 'center' },
            { text: 'Global Operations\n', style: 'footer', alignment: 'center' },
            { text: 'Phone: Available on request | Est. 2024', style: 'footer', alignment: 'center' }
          ]
        };
      }
    } catch (error) {
      console.error('⚠️ Error fetching company details, using defaults:', error);
      companyFooter = {
        text: [
          { text: '\n\n--- Company Information ---\n', style: 'footer', alignment: 'center' },
          { text: 'EduFam - Educational Technology Solutions\n', style: 'footer', alignment: 'center' },
          { text: 'support@edufam.com | Est. 2024', style: 'footer', alignment: 'center' }
        ]
      };
    }

    console.log('📄 Creating PDF document...');

    // Generate PDF with enhanced styling and proper content
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
      defaultStyle: defaultStyle,
      pageMargins: [40, 60, 40, 60],
      footer: (currentPage: number, pageCount: number) => {
        return {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          style: 'footer',
          margin: [0, 10, 0, 0]
        };
      }
    };

    try {
      console.log('🔧 Generating PDF buffer...');
      const pdfDocGenerator = pdfmake.createPdf(docDefinition);
      
      const getPdfBuffer = (): Promise<Uint8Array> =>
        new Promise((resolve, reject) => {
          pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
            if (buffer && buffer.length > 0) {
              console.log('✅ PDF buffer generated successfully, size:', buffer.length, 'bytes');
              resolve(buffer);
            } else {
              console.error('❌ PDF buffer is empty or invalid');
              reject(new Error('Failed to generate PDF buffer - empty result'));
            }
          });
        });

      const pdfBuffer = await getPdfBuffer();
      
      const fileName = `edufam_${reportType.replace(/-/g, '_')}_${Date.now()}.pdf`;
      console.log('📥 Returning PDF file:', fileName);

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`
        }
      });

    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError);
      return new Response(
        JSON.stringify({ 
          error: 'PDF generation failed',
          details: pdfError.message || 'Unknown PDF generation error',
          reportType: reportType,
          timestamp: new Date().toISOString()
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: any) {
    console.error('❌ [generate_report] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        service: 'generate_report'
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
