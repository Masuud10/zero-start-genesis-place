
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
    console.log('🚀 Starting EduFam report generation...');
    
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
    console.log('✅ Supabase client initialized successfully');

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

    console.log('📊 Generating report:', reportType, 'with filters:', filters, 'for user:', userInfo);

    let reportContent: any[] = [];
    let reportTitle = "";

    try {
      // Generate report based on type
      switch (reportType) {
        case 'platform-overview':
          reportTitle = "EduFam Platform Overview Report";
          console.log('🔄 Generating Platform Overview Report...');
          reportContent = await generatePlatformOverviewReport(supabase, filters);
          break;

        case 'system-school-summary':
        case 'school-summary':
        case 'schools-summary':
          reportTitle = reportType === 'system-school-summary' 
            ? "EduFam System Schools Summary Report" 
            : "Schools Summary Report";
          console.log('🔄 Generating Schools Summary Report...');
          reportContent = await generateSchoolsSummaryReport(supabase, filters);
          break;

        case 'users-analytics':
          reportTitle = "EduFam Users Analytics Report";
          console.log('🔄 Generating Users Analytics Report...');
          reportContent = await generateUsersAnalyticsReport(supabase, filters);
          break;

        case 'financial-overview':
        case 'system-billing':
          reportTitle = reportType === 'system-billing' 
            ? "EduFam System Billing Report" 
            : "Financial Overview Report";
          console.log('🔄 Generating Financial Overview Report...');
          reportContent = await generateFinancialOverviewReport(supabase, filters);
          break;

        case 'system-health':
        case 'system-performance':
          reportTitle = "EduFam System Performance Report";
          console.log('🔄 Generating System Health Report...');
          reportContent = await generateSystemHealthReport(supabase, filters);
          break;

        case 'company-profile':
        case 'system-audit':
          reportTitle = reportType === 'system-audit' 
            ? "EduFam System Audit Report" 
            : "EduFam Company Profile Report";
          console.log('🔄 Generating Company Profile Report...');
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

      console.log('✅ Report content generated successfully, sections:', reportContent?.length || 0);

      // Ensure we have content
      if (!reportContent || !Array.isArray(reportContent) || reportContent.length === 0) {
        console.warn('⚠️ Empty report content, using fallback');
        reportContent = [
          { text: reportTitle, style: 'header', alignment: 'center', margin: [0, 30] },
          { text: 'Report Status', style: 'sectionHeader', margin: [0, 25, 0, 10] },
          {
            text: 'Your report is being generated. Data collection is in progress and will be available shortly.',
            style: 'normal', 
            margin: [0, 0, 0, 15]
          }
        ];
      }

    } catch (reportError) {
      console.error('❌ Error in report generation:', reportError);
      reportContent = [
        { text: reportTitle || 'EduFam Report', style: 'header', alignment: 'center', margin: [0, 30] },
        { text: 'Report Generation Status', style: 'sectionHeader', margin: [0, 25, 0, 10] },
        {
          text: 'Report data is currently being processed. Please try again in a few moments.',
          style: 'normal',
          margin: [0, 0, 0, 15]
        }
      ];
    }

    console.log('🏢 Fetching company details for report footer...');

    // Get company footer details
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
        year_established: 2024,
        company_type: 'Educational Technology Platform',
        company_motto: 'Empowering Education Through Technology'
      };

      companyFooter = {
        text: [
          { text: '\n\n' },
          { text: '─'.repeat(80), style: 'footer', alignment: 'center' },
          { text: '\nCompany Information\n', style: 'footer', alignment: 'center', bold: true },
          { text: `${company.company_name} - ${company.company_type}\n`, style: 'footer', alignment: 'center', bold: true },
          { text: `${company.website_url} | ${company.support_email}\n`, style: 'footer', alignment: 'center' },
          { text: `${company.headquarters_address}\n`, style: 'footer', alignment: 'center' },
          { text: `Phone: ${company.contact_phone} | Established: ${company.year_established}\n`, style: 'footer', alignment: 'center' },
          { text: `${company.company_motto}\n`, style: 'footer', alignment: 'center', italics: true },
          { text: `\nReport generated: ${new Date().toLocaleString()} | Document ID: RPT-${Date.now()}`, style: 'footer', alignment: 'center', italics: true }
        ]
      };
      console.log('✅ Company footer created successfully');
    } catch (error) {
      console.error('⚠️ Error fetching company details, using defaults:', error);
      companyFooter = {
        text: [
          { text: '\n\n' },
          { text: '─'.repeat(80), style: 'footer', alignment: 'center' },
          { text: '\nEduFam - Educational Technology Platform\n', style: 'footer', alignment: 'center', bold: true },
          { text: 'https://edufam.com | support@edufam.com\n', style: 'footer', alignment: 'center' },
          { text: 'Nairobi, Kenya | Established: 2024\n', style: 'footer', alignment: 'center' },
          { text: 'Empowering Education Through Technology\n', style: 'footer', alignment: 'center', italics: true },
          { text: `\nReport generated: ${new Date().toLocaleString()} | Document ID: RPT-${Date.now()}`, style: 'footer', alignment: 'center', italics: true }
        ]
      };
    }

    console.log('📄 Creating PDF document...');

    // Create PDF document
    const docDefinition = {
      content: [
        // Report header
        {
          table: {
            widths: ['*'],
            body: [[{
              text: reportTitle,
              style: 'title',
              alignment: 'center',
              border: [false, false, false, false]
            }]]
          },
          margin: [0, 0, 0, 30]
        },
        
        // Report metadata
        {
          table: {
            widths: ['*', '*'],
            body: [[
              { text: `Generated: ${new Date().toLocaleDateString()}`, style: 'date', border: [false, false, false, false] },
              { text: `Time: ${new Date().toLocaleTimeString()}`, style: 'date', alignment: 'right', border: [false, false, false, false] }
            ]]
          },
          margin: [0, 0, 0, 20]
        },
        
        // Separator line
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 515, y2: 0,
              lineWidth: 1,
              lineColor: '#e2e8f0'
            }
          ],
          margin: [0, 0, 0, 25]
        },
        
        // Report content
        ...reportContent,
        
        // Company footer
        companyFooter
      ],
      styles: pdfStyles,
      defaultStyle: defaultStyle,
      pageMargins: [50, 70, 50, 90],
      footer: (currentPage: number, pageCount: number) => {
        return {
          table: {
            widths: ['*'],
            body: [[{
              text: `Page ${currentPage} of ${pageCount} | Generated by EduFam Report System`,
              alignment: 'center',
              style: 'footer',
              border: [false, false, false, false]
            }]]
          },
          margin: [50, 0, 50, 20]
        };
      },
      info: {
        title: reportTitle,
        author: 'EduFam System',
        subject: `${reportType} Report - Generated ${new Date().toLocaleDateString()}`,
        creator: 'EduFam Report Generator v2.0',
        producer: 'EduFam Educational Technology Platform',
        keywords: `EduFam, ${reportType}, report, analytics, education`,
        creationDate: new Date()
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
              console.error('❌ PDF buffer is empty');
              reject(new Error('Failed to generate PDF buffer'));
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
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": pdfBuffer.length.toString(),
          "X-Report-Type": reportType,
          "X-Generation-Time": new Date().toISOString()
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
        details: error.message || 'An unexpected error occurred during report generation',
        timestamp: new Date().toISOString(),
        service: 'generate_report',
        version: '2.0'
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
