
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
        
        // Fetch real data from multiple tables
        const [schoolsResult, profilesResult, financialResult, certificatesResult, companyResult] = await Promise.all([
          supabase.from('schools').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('financial_transactions').select('*'),
          supabase.from('certificates').select('*'),
          supabase.from('company_details').select('*').single()
        ]);

        const schools = schoolsResult.data || [];
        const profiles = profilesResult.data || [];
        const transactions = financialResult.data || [];
        const certificates = certificatesResult.data || [];
        const companyInfo = companyResult.data;

        const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const usersByRole = profiles.reduce((acc: any, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        reportContent = [
          { text: 'Executive Summary', style: 'header' },
          { text: `Company: ${companyInfo?.company_name || 'EduFam'}` },
          { text: `Report Generated: ${new Date().toLocaleDateString()}` },
          { text: '\n' },
          
          { text: 'Platform Statistics', style: 'header' },
          { text: `Total Schools: ${schools.length}` },
          { text: `Total Users: ${profiles.length}` },
          { text: `Total Certificates: ${certificates.length}` },
          { text: `Total Revenue: KES ${totalRevenue.toLocaleString()}` },
          { text: `Total Transactions: ${transactions.length}` },
          { text: '\n' },

          { text: 'User Distribution by Role', style: 'subheader' },
          ...Object.entries(usersByRole).map(([role, count]) => 
            ({ text: `${role}: ${count}` })
          ),
          { text: '\n' },

          { text: 'Top 10 Schools by Registration Date', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              body: [
                ['School Name', 'Location', 'Email', 'Registration Date'],
                ...schools.slice(0, 10).map(school => [
                  school.name || 'N/A',
                  school.location || school.address || 'N/A',
                  school.email || 'N/A',
                  new Date(school.created_at).toLocaleDateString()
                ])
              ]
            }
          }
        ];
        break;

      case 'schools-summary':
        reportTitle = "Schools Summary Report";
        
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select(`
            *,
            profiles!school_id(count)
          `);

        if (schoolsError) throw schoolsError;

        reportContent = [
          { text: 'Comprehensive Schools Summary', style: 'header' },
          { text: `Total Schools Registered: ${schoolsData?.length || 0}` },
          { text: `Report Date: ${new Date().toLocaleDateString()}` },
          { text: '\n' },
          
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                ['School Name', 'Location', 'Contact', 'Registration Date'],
                ...(schoolsData || []).map(school => [
                  school.name || 'N/A',
                  school.location || school.address || 'N/A',
                  school.email || school.phone || 'N/A',
                  new Date(school.created_at).toLocaleDateString()
                ])
              ]
            }
          }
        ];
        break;

      case 'users-analytics':
        reportTitle = "Users Analytics Report";
        
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*');

        if (usersError) throw usersError;

        const roleStats = (usersData || []).reduce((acc: any, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        const schoolStats = (usersData || []).reduce((acc: any, user) => {
          if (user.school_id) {
            acc[user.school_id] = (acc[user.school_id] || 0) + 1;
          }
          return acc;
        }, {});

        reportContent = [
          { text: 'User Analytics Overview', style: 'header' },
          { text: `Total Platform Users: ${usersData?.length || 0}` },
          { text: `Analysis Date: ${new Date().toLocaleDateString()}` },
          { text: '\n' },
          
          { text: 'User Distribution by Role', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              body: [
                ['Role', 'Count', 'Percentage'],
                ...Object.entries(roleStats).map(([role, count]) => [
                  role,
                  count.toString(),
                  `${((count as number / (usersData?.length || 1)) * 100).toFixed(1)}%`
                ])
              ]
            }
          },
          { text: '\n' },
          
          { text: 'Schools with Most Users', style: 'subheader' },
          { text: `Total Schools with Users: ${Object.keys(schoolStats).length}` },
          { text: `Average Users per School: ${((usersData?.length || 0) / Math.max(Object.keys(schoolStats).length, 1)).toFixed(1)}` }
        ];
        break;

      case 'financial-overview':
        reportTitle = "Financial Overview Report";
        
        const { data: finData, error: finError } = await supabase
          .from('financial_transactions')
          .select('*');

        if (finError) throw finError;

        const totalTransactions = finData?.length || 0;
        const totalAmount = finData?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;
        const avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

        const monthlyData = (finData || []).reduce((acc: any, transaction) => {
          const month = new Date(transaction.created_at).toISOString().slice(0, 7);
          acc[month] = (acc[month] || 0) + (Number(transaction.amount) || 0);
          return acc;
        }, {});

        reportContent = [
          { text: 'Financial Performance Report', style: 'header' },
          { text: `Reporting Period: All Time` },
          { text: `Generated: ${new Date().toLocaleDateString()}` },
          { text: '\n' },
          
          { text: 'Key Financial Metrics', style: 'subheader' },
          { text: `Total Transactions: ${totalTransactions.toLocaleString()}` },
          { text: `Total Revenue: KES ${totalAmount.toLocaleString()}` },
          { text: `Average Transaction: KES ${avgTransaction.toFixed(2)}` },
          { text: '\n' },

          { text: 'Monthly Revenue Breakdown', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              body: [
                ['Month', 'Revenue (KES)'],
                ...Object.entries(monthlyData)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 12)
                  .map(([month, amount]) => [
                    new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                    (amount as number).toLocaleString()
                  ])
              ]
            }
          }
        ];
        break;

      case 'system-health':
        reportTitle = "System Health Report";
        
        const { data: metricsData, error: metricsError } = await supabase
          .from('company_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (metricsError) throw metricsError;

        const latestMetric = metricsData?.[0];
        const avgUptime = metricsData?.length > 0 
          ? metricsData.reduce((sum, m) => sum + (m.system_uptime_percentage || 100), 0) / metricsData.length
          : 100;

        reportContent = [
          { text: 'System Health Status Report', style: 'header' },
          { text: `Report Generated: ${new Date().toLocaleDateString()}` },
          { text: `Data Period: Last 30 Records` },
          { text: '\n' },
          
          { text: 'Current System Status', style: 'subheader' },
          { text: `System Uptime: ${latestMetric?.system_uptime_percentage || 100}%` },
          { text: `Active Schools: ${latestMetric?.active_schools || 0}` },
          { text: `Active Users: ${latestMetric?.active_users || 0}` },
          { text: `API Calls (Recent): ${latestMetric?.api_calls_count || 0}` },
          { text: '\n' },

          { text: '30-Day Performance Average', style: 'subheader' },
          { text: `Average Uptime: ${avgUptime.toFixed(2)}%` },
          { text: `Total Metrics Recorded: ${metricsData?.length || 0}` },
          { text: `System Status: ${avgUptime >= 99 ? 'Excellent' : avgUptime >= 95 ? 'Good' : 'Needs Attention'}` }
        ];
        break;

      case 'company-profile':
        reportTitle = "EduFam Company Profile Report";
        
        const { data: companyData, error: companyError } = await supabase
          .from('company_details')
          .select('*')
          .single();

        if (companyError && companyError.code !== 'PGRST116') throw companyError;

        reportContent = [
          { text: 'Company Profile Information', style: 'header' },
          { text: `Report Date: ${new Date().toLocaleDateString()}` },
          { text: '\n' },
          
          { text: 'Basic Company Information', style: 'subheader' },
          { text: `Company Name: ${companyData?.company_name || 'EduFam Technologies Ltd'}` },
          { text: `Company Type: ${companyData?.company_type || 'Educational Technology'}` },
          { text: `Year Established: ${companyData?.year_established || '2024'}` },
          { text: `Registration Number: ${companyData?.registration_number || 'Not Set'}` },
          { text: '\n' },

          { text: 'Contact Information', style: 'subheader' },
          { text: `Website: ${companyData?.website_url || 'https://edufam.com'}` },
          { text: `Support Email: ${companyData?.support_email || 'support@edufam.com'}` },
          { text: `Contact Phone: ${companyData?.contact_phone || 'Not Set'}` },
          { text: `Address: ${companyData?.headquarters_address || 'Not Set'}` },
          { text: '\n' },

          { text: 'Company Branding', style: 'subheader' },
          { text: `Slogan: ${companyData?.company_slogan || 'Not Set'}` },
          { text: `Motto: ${companyData?.company_motto || 'Not Set'}` },
          { text: '\n' },

          { text: 'Legal Information', style: 'subheader' },
          { text: `Incorporation Details: ${companyData?.incorporation_details || 'Not Set'}` }
        ];
        break;

      default:
        throw new Error('Invalid report type');
    }

    // Generate PDF with proper styling
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
      styles: {
        title: { 
          fontSize: 20, 
          bold: true, 
          color: '#1976D2',
          margin: [0, 0, 0, 10]
        },
        header: { 
          fontSize: 16, 
          bold: true, 
          margin: [0, 10, 0, 10],
          color: '#333'
        },
        subheader: { 
          fontSize: 14, 
          bold: true, 
          margin: [0, 10, 0, 5],
          color: '#555'
        },
        date: { 
          fontSize: 10, 
          italics: true,
          color: '#666'
        },
        footer: { 
          fontSize: 10, 
          italics: true, 
          color: '#666'
        }
      },
      defaultStyle: { 
        fontSize: 12,
        lineHeight: 1.3
      }
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
