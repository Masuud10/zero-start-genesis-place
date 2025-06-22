
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
        
        // Fetch comprehensive real data from multiple tables
        const [schoolsResult, profilesResult, financialResult, certificatesResult, companyResult, metricsResult] = await Promise.all([
          supabase.from('schools').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('financial_transactions').select('*'),
          supabase.from('certificates').select('*'),  
          supabase.from('company_details').select('*').single(),
          supabase.from('company_metrics').select('*').order('created_at', { ascending: false }).limit(1).single()
        ]);

        const schools = schoolsResult.data || [];
        const profiles = profilesResult.data || [];
        const transactions = financialResult.data || [];
        const certificates = certificatesResult.data || [];
        const companyInfo = companyResult.data;
        const latestMetrics = metricsResult.data;

        const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const usersByRole = profiles.reduce((acc: any, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        // Get top performing schools by user count
        const schoolsWithUsers = schools.map(school => {
          const userCount = profiles.filter(user => user.school_id === school.id).length;
          return { ...school, userCount };
        }).sort((a, b) => b.userCount - a.userCount);

        reportContent = [
          { text: 'Executive Summary', style: 'header' },
          { text: `Company: ${companyInfo?.company_name || 'EduFam Technologies'}`, style: 'normalBold' },
          { text: `Website: ${companyInfo?.website_url || 'https://edufam.com'}` },
          { text: `Support Email: ${companyInfo?.support_email || 'support@edufam.com'}` },
          { text: `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` },
          { text: '\n' },
          
          { text: 'Platform Statistics', style: 'header' },
          { text: `Total Schools: ${schools.length}`, style: 'normalBold' },
          { text: `Total Users: ${profiles.length}`, style: 'normalBold' },
          { text: `Total Certificates Generated: ${certificates.length}`, style: 'normalBold' },
          { text: `Total Financial Transactions: ${transactions.length}`, style: 'normalBold' },
          { text: `Total Platform Revenue: KES ${totalRevenue.toLocaleString()}`, style: 'normalBold' },
          { text: `System Uptime: ${latestMetrics?.system_uptime_percentage || 100}%`, style: 'normalBold' },
          { text: '\n' },

          { text: 'User Distribution by Role', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*'],
              body: [
                ['Role', 'Count', 'Percentage'],
                ...Object.entries(usersByRole).map(([role, count]) => [
                  role.replace('_', ' ').toUpperCase(),
                  count.toString(),
                  `${((count as number / profiles.length) * 100).toFixed(1)}%`
                ])
              ]
            }
          },
          { text: '\n' },

          { text: 'Top 10 Schools by User Count', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*', '*'],
              body: [
                ['School Name', 'Location', 'Email', 'Users', 'Registration Date'],
                ...schoolsWithUsers.slice(0, 10).map(school => [
                  school.name || 'N/A',
                  school.location || school.address || 'N/A',
                  school.email || 'N/A',
                  school.userCount.toString(),
                  new Date(school.created_at).toLocaleDateString()
                ])
              ]
            }
          },
          { text: '\n' },

          { text: 'Financial Overview', style: 'subheader' },
          { text: `Total Transactions Processed: ${transactions.length}` },
          { text: `Average Transaction Amount: KES ${transactions.length > 0 ? (totalRevenue / transactions.length).toFixed(2) : '0'}` },
          { text: `Monthly Revenue (Current): KES ${latestMetrics?.monthly_revenue?.toLocaleString() || '0'}` },
          { text: '\n' },

          { text: 'System Health Metrics', style: 'subheader' },
          { text: `Active Schools: ${latestMetrics?.active_schools || schools.length}` },
          { text: `Active Users: ${latestMetrics?.active_users || profiles.length}` },
          { text: `API Calls (Recent): ${latestMetrics?.api_calls_count || 'N/A'}` }
        ];
        break;

      case 'schools-summary':
        reportTitle = "EduFam Schools Summary Report";
        
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select(`*, profiles!school_id(count)`);

        if (schoolsError) {
          console.error('Schools data error:', schoolsError);
          throw schoolsError;
        }

        // Get additional school statistics
        const schoolsWithStats = await Promise.all((schoolsData || []).map(async (school) => {
          const [studentsResult, gradesResult, attendanceResult] = await Promise.all([
            supabase.from('students').select('id').eq('school_id', school.id),
            supabase.from('grades').select('id').eq('school_id', school.id),
            supabase.from('attendance').select('id').eq('school_id', school.id)
          ]);

          return {
            ...school,
            studentCount: studentsResult.data?.length || 0,
            gradeCount: gradesResult.data?.length || 0,
            attendanceCount: attendanceResult.data?.length || 0
          };
        }));

        reportContent = [
          { text: 'Comprehensive Schools Summary', style: 'header' },
          { text: `Total Schools Registered: ${schoolsData?.length || 0}`, style: 'normalBold' },
          { text: `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` },
          { text: '\n' },
          
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*', '*', '*'],
              body: [
                ['School Name', 'Location', 'Contact', 'Students', 'Total Grades', 'Registration Date'],
                ...schoolsWithStats.map(school => [
                  school.name || 'N/A',
                  school.location || school.address || 'N/A',
                  school.email || school.phone || 'N/A',
                  school.studentCount.toString(),
                  school.gradeCount.toString(),
                  new Date(school.created_at).toLocaleDateString()
                ])
              ]
            }
          },
          { text: '\n' },

          { text: 'School Statistics Summary', style: 'subheader' },
          { text: `Total Students Across All Schools: ${schoolsWithStats.reduce((sum, school) => sum + school.studentCount, 0)}` },
          { text: `Total Grades Recorded: ${schoolsWithStats.reduce((sum, school) => sum + school.gradeCount, 0)}` },
          { text: `Total Attendance Records: ${schoolsWithStats.reduce((sum, school) => sum + school.attendanceCount, 0)}` },
          { text: `Average Students per School: ${(schoolsWithStats.reduce((sum, school) => sum + school.studentCount, 0) / Math.max(schoolsWithStats.length, 1)).toFixed(1)}` }
        ];
        break;

      case 'users-analytics':
        reportTitle = "EduFam Users Analytics Report";
        
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*');

        if (usersError) {
          console.error('Users data error:', usersError);
          throw usersError;
        }

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

        // Get recent user registrations
        const recentUsers = (usersData || [])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10);

        reportContent = [
          { text: 'User Analytics Overview', style: 'header' },
          { text: `Total Platform Users: ${usersData?.length || 0}`, style: 'normalBold' },
          { text: `Analysis Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` },
          { text: '\n' },
          
          { text: 'User Distribution by Role', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*'],
              body: [
                ['Role', 'Count', 'Percentage'],
                ...Object.entries(roleStats).map(([role, count]) => [
                  role.replace('_', ' ').toUpperCase(),
                  count.toString(),
                  `${((count as number / (usersData?.length || 1)) * 100).toFixed(1)}%`
                ])
              ]
            }
          },
          { text: '\n' },
          
          { text: 'School Distribution Statistics', style: 'subheader' },
          { text: `Schools with Users: ${Object.keys(schoolStats).length}` },
          { text: `Users with School Assignment: ${Object.values(schoolStats).reduce((sum: number, count) => sum + (count as number), 0)}` },
          { text: `Users without School Assignment: ${(usersData?.length || 0) - Object.values(schoolStats).reduce((sum: number, count) => sum + (count as number), 0)}` },
          { text: `Average Users per School: ${((usersData?.length || 0) / Math.max(Object.keys(schoolStats).length, 1)).toFixed(1)}` },
          { text: '\n' },

          { text: 'Recent User Registrations (Last 10)', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                ['Name', 'Email', 'Role', 'Registration Date'],
                ...recentUsers.map(user => [
                  user.name || 'N/A',
                  user.email || 'N/A',
                  user.role.replace('_', ' ').toUpperCase(),
                  new Date(user.created_at).toLocaleDateString()
                ])
              ]
            }
          }
        ];
        break;

      case 'financial-overview':
        reportTitle = "EduFam Financial Overview Report";
        
        const { data: finData, error: finError } = await supabase
          .from('financial_transactions')
          .select('*');

        if (finError) {
          console.error('Financial data error:', finError);
          throw finError;
        }

        const totalTransactions = finData?.length || 0;
        const totalAmount = finData?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;
        const avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

        const monthlyData = (finData || []).reduce((acc: any, transaction) => {
          const month = new Date(transaction.created_at).toISOString().slice(0, 7);
          acc[month] = (acc[month] || 0) + (Number(transaction.amount) || 0);
          return acc;
        }, {});

        const paymentMethods = (finData || []).reduce((acc: any, transaction) => {
          const method = transaction.payment_method || 'Unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {});

        reportContent = [
          { text: 'Financial Performance Report', style: 'header' },
          { text: `Reporting Period: All Time`, style: 'normalBold' },
          { text: `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` },
          { text: '\n' },
          
          { text: 'Key Financial Metrics', style: 'subheader' },
          { text: `Total Transactions: ${totalTransactions.toLocaleString()}`, style: 'normalBold' },
          { text: `Total Revenue: KES ${totalAmount.toLocaleString()}`, style: 'normalBold' },
          { text: `Average Transaction: KES ${avgTransaction.toFixed(2)}`, style: 'normalBold' },
          { text: `Largest Transaction: KES ${Math.max(...(finData || []).map(t => Number(t.amount) || 0)).toLocaleString()}` },
          { text: '\n' },

          { text: 'Payment Methods Distribution', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*'],
              body: [
                ['Payment Method', 'Count', 'Percentage'],
                ...Object.entries(paymentMethods).map(([method, count]) => [
                  method,
                  count.toString(),
                  `${((count as number / totalTransactions) * 100).toFixed(1)}%`
                ])
              ]
            }
          },
          { text: '\n' },

          { text: 'Monthly Revenue Breakdown (Last 12 Months)', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
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
        reportTitle = "EduFam System Health Report";
        
        const { data: metricsData, error: metricsError } = await supabase
          .from('company_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (metricsError) {
          console.error('Metrics data error:', metricsError);
          throw metricsError;
        }

        const latestMetric = metricsData?.[0];
        const avgUptime = metricsData?.length > 0 
          ? metricsData.reduce((sum, m) => sum + (m.system_uptime_percentage || 100), 0) / metricsData.length
          : 100;

        const avgApiCalls = metricsData?.length > 0
          ? metricsData.reduce((sum, m) => sum + (m.api_calls_count || 0), 0) / metricsData.length
          : 0;

        reportContent = [
          { text: 'System Health Status Report', style: 'header' },
          { text: `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` },
          { text: `Data Period: Last 30 Records` },
          { text: '\n' },
          
          { text: 'Current System Status', style: 'subheader' },
          { text: `System Uptime: ${latestMetric?.system_uptime_percentage || 100}%`, style: 'normalBold' },
          { text: `Active Schools: ${latestMetric?.active_schools || 0}`, style: 'normalBold' },
          { text: `Total Schools: ${latestMetric?.total_schools || 0}`, style: 'normalBold' },
          { text: `Active Users: ${latestMetric?.active_users || 0}`, style: 'normalBold' },
          { text: `Total Users: ${latestMetric?.total_users || 0}`, style: 'normalBold' },
          { text: `API Calls (Recent): ${latestMetric?.api_calls_count || 0}`, style: 'normalBold' },
          { text: `Monthly Revenue: KES ${(latestMetric?.monthly_revenue || 0).toLocaleString()}`, style: 'normalBold' },
          { text: `Total Revenue: KES ${(latestMetric?.total_revenue || 0).toLocaleString()}`, style: 'normalBold' },
          { text: '\n' },

          { text: '30-Day Performance Average', style: 'subheader' },
          { text: `Average Uptime: ${avgUptime.toFixed(2)}%`, style: 'normalBold' },
          { text: `Average API Calls: ${avgApiCalls.toFixed(0)}`, style: 'normalBold' },
          { text: `Total Metrics Recorded: ${metricsData?.length || 0}` },
          { text: `System Status: ${avgUptime >= 99 ? 'Excellent' : avgUptime >= 95 ? 'Good' : 'Needs Attention'}`, style: 'normalBold' },
          { text: '\n' },

          { text: 'Recent System Metrics (Last 7 Days)', style: 'subheader' },
          metricsData?.length > 0 ? {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                ['Date', 'Uptime %', 'Active Schools', 'API Calls'],
                ...metricsData.slice(0, 7).map(metric => [
                  new Date(metric.metric_date).toLocaleDateString(),
                  `${metric.system_uptime_percentage || 100}%`,
                  (metric.active_schools || 0).toString(),
                  (metric.api_calls_count || 0).toString()
                ])
              ]
            }
          } : { text: 'No recent metrics data available' }
        ];
        break;

      case 'company-profile':
        reportTitle = "EduFam Company Profile Report";
        
        const { data: companyData, error: companyError } = await supabase
          .from('company_details')
          .select('*')
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          console.error('Company data error:', companyError);
          throw companyError;
        }

        reportContent = [
          { text: 'Company Profile Information', style: 'header' },
          { text: `Report Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` },
          { text: '\n' },
          
          { text: 'Basic Company Information', style: 'subheader' },
          { text: `Company Name: ${companyData?.company_name || 'EduFam Technologies Ltd'}`, style: 'normalBold' },
          { text: `Company Type: ${companyData?.company_type || 'Educational Technology Platform'}`, style: 'normalBold' },
          { text: `Year Established: ${companyData?.year_established || '2024'}`, style: 'normalBold' },
          { text: `Registration Number: ${companyData?.registration_number || 'Not Set'}` },
          { text: '\n' },

          { text: 'Contact Information', style: 'subheader' },
          { text: `Website: ${companyData?.website_url || 'https://edufam.com'}`, style: 'normalBold' },
          { text: `Support Email: ${companyData?.support_email || 'support@edufam.com'}`, style: 'normalBold' },
          { text: `Contact Phone: ${companyData?.contact_phone || 'Not Set'}` },
          { text: `Headquarters Address: ${companyData?.headquarters_address || 'Not Set'}` },
          { text: '\n' },

          { text: 'Company Branding', style: 'subheader' },
          { text: `Company Slogan: ${companyData?.company_slogan || 'Not Set'}` },
          { text: `Company Motto: ${companyData?.company_motto || 'Not Set'}` },
          { text: `Logo URL: ${companyData?.company_logo_url || 'Not Set'}` },
          { text: '\n' },

          { text: 'Legal Information', style: 'subheader' },
          { text: `Incorporation Details: ${companyData?.incorporation_details || 'Not Set'}` },
          { text: `Last Updated: ${companyData?.updated_at ? new Date(companyData.updated_at).toLocaleDateString() : 'Not Available'}` }
        ];
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
          margin: [0, 15, 0, 10],
          color: '#333'
        },
        subheader: { 
          fontSize: 14, 
          bold: true, 
          margin: [0, 10, 0, 5],
          color: '#555'
        },
        normalBold: {
          fontSize: 12,
          bold: true,
          margin: [0, 2, 0, 2]
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
        lineHeight: 1.4
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
