
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
        
        // Fetch comprehensive platform data
        const [schoolsData, usersData, transactionsData, certificatesData] = await Promise.all([
          supabase.from('schools').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('financial_transactions').select('*'),
          supabase.from('certificates').select('*')
        ]);

        const totalSchools = schoolsData.data?.length || 0;
        const totalUsers = usersData.data?.length || 0;
        const totalRevenue = transactionsData.data?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;
        const totalCertificates = certificatesData.data?.length || 0;

        reportContent = [
          { text: 'Platform Statistics', style: 'header' },
          { text: `Total Schools: ${totalSchools}` },
          { text: `Total Users: ${totalUsers}` },
          { text: `Total Revenue: KES ${totalRevenue.toLocaleString()}` },
          { text: `Certificates Generated: ${totalCertificates}` },
          { text: '\n' },
          { text: 'School Distribution', style: 'subheader' },
          {
            table: {
              body: [
                ['School Name', 'Location', 'Users', 'Status'],
                ...(schoolsData.data || []).slice(0, 10).map(school => [
                  school.name || 'N/A',
                  school.location || 'N/A',
                  usersData.data?.filter(u => u.school_id === school.id).length || 0,
                  'Active'
                ])
              ]
            }
          }
        ];
        break;

      case 'schools-summary':
        reportTitle = "Schools Summary Report";
        
        const { data: schoolsSummary, error: schoolsError } = await supabase
          .from('schools')
          .select(`
            *,
            profiles:profiles(count)
          `);

        if (schoolsError) throw schoolsError;

        reportContent = [
          { text: 'Registered Schools Summary', style: 'header' },
          {
            table: {
              body: [
                ['School Name', 'Location', 'Email', 'Created Date'],
                ...(schoolsSummary || []).map(school => [
                  school.name || 'N/A',
                  school.location || 'N/A',
                  school.email || 'N/A',
                  new Date(school.created_at).toLocaleDateString()
                ])
              ]
            }
          }
        ];
        break;

      case 'users-analytics':
        reportTitle = "Users Analytics Report";
        
        const { data: usersAnalytics, error: usersError } = await supabase
          .from('profiles')
          .select('*');

        if (usersError) throw usersError;

        const roleDistribution = (usersAnalytics || []).reduce((acc: any, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        reportContent = [
          { text: 'User Analytics', style: 'header' },
          { text: `Total Users: ${usersAnalytics?.length || 0}` },
          { text: '\nRole Distribution:', style: 'subheader' },
          ...Object.entries(roleDistribution).map(([role, count]) => 
            ({ text: `${role}: ${count}` })
          )
        ];
        break;

      case 'financial-overview':
        reportTitle = "Financial Overview Report";
        
        const { data: financialData, error: financialError } = await supabase
          .from('financial_transactions')
          .select('*');

        if (financialError) throw financialError;

        const totalTransactions = financialData?.length || 0;
        const totalAmount = financialData?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;

        reportContent = [
          { text: 'Financial Overview', style: 'header' },
          { text: `Total Transactions: ${totalTransactions}` },
          { text: `Total Amount: KES ${totalAmount.toLocaleString()}` },
          { text: `Average Transaction: KES ${totalTransactions > 0 ? (totalAmount / totalTransactions).toFixed(2) : '0'}` }
        ];
        break;

      case 'system-health':
        reportTitle = "System Health Report";
        
        const { data: systemMetrics, error: metricsError } = await supabase
          .from('company_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (metricsError) throw metricsError;

        const latestMetrics = systemMetrics?.[0];

        reportContent = [
          { text: 'System Health Status', style: 'header' },
          { text: `System Uptime: ${latestMetrics?.system_uptime_percentage || 100}%` },
          { text: `API Calls Today: ${latestMetrics?.api_calls_count || 0}` },
          { text: `Active Schools: ${latestMetrics?.active_schools || 0}` },
          { text: `Active Users: ${latestMetrics?.active_users || 0}` }
        ];
        break;

      case 'company-profile':
        reportTitle = "EduFam Company Profile Report";
        
        const { data: companyDetails, error: companyError } = await supabase
          .from('company_details')
          .select('*')
          .single();

        if (companyError && companyError.code !== 'PGRST116') throw companyError;

        reportContent = [
          { text: 'Company Information', style: 'header' },
          { text: `Company Name: ${companyDetails?.company_name || 'EduFam'}` },
          { text: `Website: ${companyDetails?.website_url || 'https://edufam.com'}` },
          { text: `Email: ${companyDetails?.support_email || 'support@edufam.com'}` },
          { text: `Phone: ${companyDetails?.contact_phone || 'N/A'}` },
          { text: `Address: ${companyDetails?.headquarters_address || 'N/A'}` },
          { text: `Year Established: ${companyDetails?.year_established || 2024}` },
          { text: `Registration Number: ${companyDetails?.registration_number || 'N/A'}` }
        ];
        break;

      default:
        throw new Error('Invalid report type');
    }

    // Generate PDF
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
          text: '\n\nPowered by EduFam - Education Management System',
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0]
        }
      ],
      styles: {
        title: { fontSize: 20, bold: true, color: '#1976D2' },
        header: { fontSize: 16, bold: true, margin: [0, 10, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 8, 0, 8] },
        date: { fontSize: 10, italics: true },
        footer: { fontSize: 10, italics: true, color: '#666' }
      },
      defaultStyle: { fontSize: 12 }
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
