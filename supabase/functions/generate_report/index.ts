
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
import { debugDataSources } from "./dataDebugger.ts";

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
    console.log('🔄 Starting enhanced report generation...');
    
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

    // Debug data sources first
    console.log('🔍 Running data source diagnostics...');
    const dataDebug = await debugDataSources(supabase);
    console.log('📊 Data availability summary:', dataDebug);

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

    console.log('📊 Generating enhanced report:', reportType, 'with filters:', filters);

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

      console.log('📄 Report content generated successfully, sections:', reportContent?.length || 0);

      // Validate report content
      if (!reportContent || !Array.isArray(reportContent) || reportContent.length === 0) {
        console.warn('⚠️ Empty report content, generating fallback');
        reportContent = [
          { text: 'Report Generation Notice', style: 'header', margin: [0, 20] },
          { text: 'This report is currently being prepared with available data.', style: 'normal', margin: [0, 10] },
          { text: 'Data Status:', style: 'sectionHeader', margin: [0, 15, 0, 5] },
          {
            ul: [
              'System is operational and collecting data',
              'Report generation infrastructure is functioning normally',
              'Additional data will be included as it becomes available',
              'Please try generating the report again in a few moments'
            ]
          },
          { text: 'If this issue persists, please contact support at support@edufam.com', style: 'normal', margin: [0, 15] }
        ];
      }

    } catch (reportError) {
      console.error('❌ Error in report generation:', reportError);
      reportContent = [
        { text: 'Report Generation Issue', style: 'error', margin: [0, 20] },
        { text: `Technical Error: ${reportError.message || 'Report processing encountered an issue'}`, style: 'normal', margin: [0, 10] },
        { text: 'Support Information:', style: 'normal', margin: [0, 15, 0, 5] },
        {
          ul: [
            `Report Type: ${reportType}`,
            `Timestamp: ${new Date().toISOString()}`,
            `Error Reference: ${reportError.name || 'GenerationError'}`,
            'Contact: support@edufam.com for assistance'
          ]
        }
      ];
    }

    console.log('🏢 Fetching enhanced company details...');

    // Enhanced company footer with fallback data
    let companyFooter: any = {};
    try {
      const { data: companyDetails } = await supabase
        .from('company_details')
        .select('*')
        .single();
      
      const company = companyDetails || {
        company_name: 'EduFam',
        website_url: 'https://edufam.com',
        support_email: 'support@edufam.com',
        contact_phone: '+254-700-EDUFAM',
        headquarters_address: 'Nairobi, Kenya',
        year_established: 2024
      };

      companyFooter = {
        text: [
          { text: '\n\n--- Company Information ---\n', style: 'footer', alignment: 'center' },
          { text: `${company.company_name}\n`, style: 'footer', alignment: 'center', bold: true },
          { text: `${company.website_url} | ${company.support_email}\n`, style: 'footer', alignment: 'center' },
          { text: `${company.headquarters_address}\n`, style: 'footer', alignment: 'center' },
          { text: `Phone: ${company.contact_phone} | Established: ${company.year_established}`, style: 'footer', alignment: 'center' },
          { text: `\nReport generated on: ${new Date().toLocaleString()}`, style: 'footer', alignment: 'center', italics: true }
        ]
      };
      console.log('✅ Enhanced company footer created');
    } catch (error) {
      console.error('⚠️ Error fetching company details, using enhanced defaults:', error);
      companyFooter = {
        text: [
          { text: '\n\n--- Company Information ---\n', style: 'footer', alignment: 'center' },
          { text: 'EduFam - Educational Technology Solutions\n', style: 'footer', alignment: 'center', bold: true },
          { text: 'https://edufam.com | support@edufam.com\n', style: 'footer', alignment: 'center' },
          { text: 'Nairobi, Kenya\n', style: 'footer', alignment: 'center' },
          { text: 'Phone: +254-700-EDUFAM | Established: 2024', style: 'footer', alignment: 'center' },
          { text: `\nReport generated on: ${new Date().toLocaleString()}`, style: 'footer', alignment: 'center', italics: true }
        ]
      };
    }

    console.log('📄 Creating enhanced PDF document...');

    // Enhanced PDF document structure
    const docDefinition = {
      content: [
        {
          text: reportTitle,
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 30]
        },
        {
          columns: [
            {
              text: `Generated: ${new Date().toLocaleDateString()}`,
              style: 'date',
              alignment: 'left'
            },
            {
              text: `Time: ${new Date().toLocaleTimeString()}`,
              style: 'date',
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 20]
        },
        {
          text: '_'.repeat(80),
          alignment: 'center',
          margin: [0, 0, 0, 20],
          style: 'footer'
        },
        ...reportContent,
        {
          text: '\n\n--- End of Report ---',
          style: 'footer',
          alignment: 'center',
          margin: [0, 30, 0, 0]
        },
        companyFooter
      ],
      styles: pdfStyles,
      defaultStyle: defaultStyle,
      pageMargins: [40, 60, 40, 80],
      footer: (currentPage: number, pageCount: number) => {
        return {
          text: `Page ${currentPage} of ${pageCount} | Generated by EduFam System`,
          alignment: 'center',
          style: 'footer',
          margin: [0, 10, 0, 0]
        };
      },
      info: {
        title: reportTitle,
        author: 'EduFam System',
        subject: `${reportType} Report`,
        creator: 'EduFam Report Generator',
        producer: 'EduFam System'
      }
    };

    try {
      console.log('🔧 Generating enhanced PDF buffer...');
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
      console.log('📥 Returning enhanced PDF file:', fileName);

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": pdfBuffer.length.toString()
        }
      });

    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError);
      return new Response(
        JSON.stringify({ 
          error: 'PDF generation failed',
          details: pdfError.message || 'Unknown PDF generation error',
          reportType: reportType,
          timestamp: new Date().toISOString(),
          debugInfo: dataDebug
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
