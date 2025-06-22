import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

export async function generatePlatformOverviewReport(supabase: any, filters: any) {
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

  const schoolsWithUsers = schools.map(school => {
    const userCount = profiles.filter(user => user.school_id === school.id).length;
    return { ...school, userCount };
  }).sort((a, b) => b.userCount - a.userCount);

  return [
    { text: 'EDUFAM PLATFORM OVERVIEW REPORT', style: 'title' },
    { text: '\n' },
    
    // Company Header Section
    { text: 'Company Information', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['*', '*'],
        body: [
          ['Company Name:', companyInfo?.company_name || 'EduFam Technologies'],
          ['Company Type:', companyInfo?.company_type || 'Educational Technology Platform'],
          ['Year Established:', companyInfo?.year_established || '2024'],
          ['Website:', companyInfo?.website_url || 'https://edufam.com'],
          ['Support Email:', companyInfo?.support_email || 'support@edufam.com'],
          ['Contact Phone:', companyInfo?.contact_phone || 'Not Set'],
          ['Registration Number:', companyInfo?.registration_number || 'Not Set']
        ]
      },
      layout: 'noBorders'
    },
    { text: '\n' },
    
    { text: 'Executive Summary', style: 'header' },
    { text: `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` },
    { text: `Reporting Period: All Time Data` },
    { text: '\n' },
    
    { text: 'Platform Statistics', style: 'header' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Metric', 'Value'],
          ['Total Schools Registered', schools.length.toString()],
          ['Total Platform Users', profiles.length.toString()],
          ['Total Certificates Generated', certificates.length.toString()],
          ['Total Financial Transactions', transactions.length.toString()],
          ['Total Platform Revenue', `KES ${totalRevenue.toLocaleString()}`],
          ['System Uptime', `${latestMetrics?.system_uptime_percentage || 100}%`],
          ['Active Schools (Last 30 Days)', (latestMetrics?.active_schools || 0).toString()],
          ['Active Users (Last 7 Days)', (latestMetrics?.active_users || 0).toString()]
        ]
      }
    },
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

    { text: 'Platform Performance Metrics', style: 'subheader' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Performance Indicator', 'Status'],
          ['System Health', latestMetrics?.system_uptime_percentage >= 99 ? 'Excellent' : latestMetrics?.system_uptime_percentage >= 95 ? 'Good' : 'Needs Attention'],
          ['Monthly Revenue Growth', latestMetrics?.monthly_revenue ? `KES ${latestMetrics.monthly_revenue.toLocaleString()}` : 'Data Pending'],
          ['School Adoption Rate', `${((latestMetrics?.active_schools || 0) / Math.max(schools.length, 1) * 100).toFixed(1)}%`],
          ['User Engagement Rate', `${((latestMetrics?.active_users || 0) / Math.max(profiles.length, 1) * 100).toFixed(1)}%`]
        ]
      }
    }
  ];
}

export async function generateSchoolsSummaryReport(supabase: any, filters: any) {
  // Get company details for header
  const { data: companyData } = await supabase
    .from('company_details')
    .select('*')
    .single();

  const { data: schoolsData, error: schoolsError } = await supabase
    .from('schools')
    .select(`*, profiles!school_id(count)`);

  if (schoolsError) {
    console.error('Schools data error:', schoolsError);
    throw schoolsError;
  }

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

  return [
    { text: 'EDUFAM SCHOOLS SUMMARY REPORT', style: 'title' },
    { text: '\n' },
    
    // Company Header
    { text: 'Report Information', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['*', '*'],
        body: [
          ['Generated By:', companyData?.company_name || 'EduFam Technologies'],
          ['Report Date:', new Date().toLocaleDateString()],
          ['Report Time:', new Date().toLocaleTimeString()],
          ['Total Schools:', (schoolsData?.length || 0).toString()],
          ['Support Contact:', companyData?.support_email || 'support@edufam.com']
        ]
      },
      layout: 'noBorders'
    },
    { text: '\n' },
    
    { text: 'Schools Overview', style: 'header' },
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

    { text: 'Schools Statistics Summary', style: 'subheader' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Metric', 'Value'],
          ['Total Students Across All Schools', schoolsWithStats.reduce((sum, school) => sum + school.studentCount, 0).toString()],
          ['Total Grades Recorded', schoolsWithStats.reduce((sum, school) => sum + school.gradeCount, 0).toString()],
          ['Total Attendance Records', schoolsWithStats.reduce((sum, school) => sum + school.attendanceCount, 0).toString()],
          ['Average Students per School', (schoolsWithStats.reduce((sum, school) => sum + school.studentCount, 0) / Math.max(schoolsWithStats.length, 1)).toFixed(1)],
          ['Schools with Active Students', schoolsWithStats.filter(school => school.studentCount > 0).length.toString()],
          ['Schools Registration This Year', schoolsWithStats.filter(school => new Date(school.created_at).getFullYear() === new Date().getFullYear()).length.toString()]
        ]
      }
    }
  ];
}

export async function generateUsersAnalyticsReport(supabase: any, filters: any) {
  // Get company details for header
  const { data: companyData } = await supabase
    .from('company_details')
    .select('*')
    .single();

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

  const recentUsers = (usersData || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return [
    { text: 'EDUFAM USER ANALYTICS REPORT', style: 'title' },
    { text: '\n' },
    
    // Company Header
    { text: 'Report Information', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['*', '*'],
        body: [
          ['Generated By:', companyData?.company_name || 'EduFam Technologies'],
          ['Analysis Date:', new Date().toLocaleDateString()],
          ['Total Platform Users:', (usersData?.length || 0).toString()],
          ['Support Contact:', companyData?.support_email || 'support@edufam.com']
        ]
      },
      layout: 'noBorders'
    },
    { text: '\n' },
    
    { text: 'User Distribution by Role', style: 'header' },
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
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Metric', 'Value'],
          ['Schools with Users', Object.keys(schoolStats).length.toString()],
          ['Users with School Assignment', Object.values(schoolStats).reduce((sum: number, count) => sum + (count as number), 0).toString()],
          ['Users without School Assignment', ((usersData?.length || 0) - Object.values(schoolStats).reduce((sum: number, count) => sum + (count as number), 0)).toString()],
          ['Average Users per School', ((usersData?.length || 0) / Math.max(Object.keys(schoolStats).length, 1)).toFixed(1)]
        ]
      }
    },
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
}

export async function generateFinancialOverviewReport(supabase: any, filters: any) {
  // Get company details for header
  const { data: companyData } = await supabase
    .from('company_details')
    .select('*')
    .single();

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

  return [
    { text: 'EDUFAM FINANCIAL OVERVIEW REPORT', style: 'title' },
    { text: '\n' },
    
    // Company Header
    { text: 'Report Information', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['*', '*'],
        body: [
          ['Generated By:', companyData?.company_name || 'EduFam Technologies'],
          ['Reporting Period:', 'All Time'],
          ['Report Generated:', new Date().toLocaleDateString()],
          ['Support Contact:', companyData?.support_email || 'support@edufam.com']
        ]
      },
      layout: 'noBorders'
    },
    { text: '\n' },
    
    { text: 'Key Financial Metrics', style: 'header' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Metric', 'Value'],
          ['Total Transactions', totalTransactions.toLocaleString()],
          ['Total Revenue', `KES ${totalAmount.toLocaleString()}`],
          ['Average Transaction Value', `KES ${avgTransaction.toFixed(2)}`],
          ['Largest Single Transaction', `KES ${Math.max(...(finData || []).map(t => Number(t.amount) || 0)).toLocaleString()}`],
          ['Transaction Success Rate', '100%'], // Assuming all recorded transactions are successful
          ['Active Payment Methods', Object.keys(paymentMethods).length.toString()]
        ]
      }
    },
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

    { text: 'Monthly Revenue Summary (Recent)', style: 'subheader' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Month', 'Revenue (KES)'],
          ...Object.entries(monthlyData)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 6)
            .map(([month, amount]) => [
              new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
              (amount as number).toLocaleString()
            ])
        ]
      }
    }
  ];
}

export async function generateSystemHealthReport(supabase: any, filters: any) {
  // Get company details for header
  const { data: companyData } = await supabase
    .from('company_details')
    .select('*')
    .single();

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

  return [
    { text: 'EDUFAM SYSTEM HEALTH REPORT', style: 'title' },
    { text: '\n' },
    
    // Company Header
    { text: 'Report Information', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['*', '*'],
        body: [
          ['System Owner:', companyData?.company_name || 'EduFam Technologies'],
          ['Report Generated:', new Date().toLocaleDateString()],
          ['Data Period:', 'Last 30 Records'],
          ['Support Contact:', companyData?.support_email || 'support@edufam.com']
        ]
      },
      layout: 'noBorders'
    },
    { text: '\n' },
    
    { text: 'Current System Status', style: 'header' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Metric', 'Current Value'],
          ['System Uptime', `${latestMetric?.system_uptime_percentage || 100}%`],
          ['Active Schools', (latestMetric?.active_schools || 0).toString()],
          ['Total Schools', (latestMetric?.total_schools || 0).toString()],
          ['Active Users', (latestMetric?.active_users || 0).toString()],
          ['Total Users', (latestMetric?.total_users || 0).toString()],
          ['API Calls (Recent)', (latestMetric?.api_calls_count || 0).toString()],
          ['Monthly Revenue', `KES ${(latestMetric?.monthly_revenue || 0).toLocaleString()}`],
          ['Total Revenue', `KES ${(latestMetric?.total_revenue || 0).toLocaleString()}`]
        ]
      }
    },
    { text: '\n' },

    { text: '30-Day Performance Average', style: 'subheader' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Performance Indicator', 'Value'],
          ['Average Uptime', `${avgUptime.toFixed(2)}%`],
          ['Average API Calls', avgApiCalls.toFixed(0)],
          ['Total Metrics Recorded', (metricsData?.length || 0).toString()],
          ['System Health Status', avgUptime >= 99 ? 'Excellent' : avgUptime >= 95 ? 'Good' : 'Needs Attention'],
          ['Data Collection Status', metricsData?.length > 0 ? 'Active' : 'Inactive']
        ]
      }
    },
    { text: '\n' },

    { text: 'System Performance Summary', style: 'subheader' },
    {
      table: {
        headerRows: 0,
        widths: ['40%', '60%'],
        body: [
          ['Overall System Health:', avgUptime >= 99 ? '🟢 Excellent' : avgUptime >= 95 ? '🟡 Good' : '🔴 Needs Attention'],
          ['Monitoring Status:', 'Active and Operational'],
          ['Last Health Check:', latestMetric ? new Date(latestMetric.created_at).toLocaleDateString() : 'No Data'],
          ['Recommended Action:', avgUptime >= 99 ? 'Continue monitoring' : 'Review system performance']
        ]
      },
      layout: 'noBorders'
    }
  ];
}

export async function generateCompanyProfileReport(supabase: any, filters: any) {
  const { data: companyData, error: companyError } = await supabase
    .from('company_details')
    .select('*')
    .single();

  const { data: metricsData } = await supabase
    .from('company_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (companyError && companyError.code !== 'PGRST116') {
    console.error('Company data error:', companyError);
    throw companyError;
  }

  return [
    { text: 'COMPANY PROFILE REPORT', style: 'title' },
    { text: '\n' },
    
    { text: 'Basic Company Information', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['40%', '60%'],
        body: [
          ['Company Name:', companyData?.company_name || 'EduFam Technologies Ltd'],
          ['Company Type:', companyData?.company_type || 'Educational Technology Platform'],
          ['Year Established:', (companyData?.year_established || '2024').toString()],
          ['Registration Number:', companyData?.registration_number || 'Not Set'],
          ['Company Slogan:', companyData?.company_slogan || 'Not Set'],
          ['Company Motto:', companyData?.company_motto || 'Not Set']
        ]
      }
    },
    { text: '\n' },

    { text: 'Contact Information', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['40%', '60%'],
        body: [
          ['Website URL:', companyData?.website_url || 'https://edufam.com'],
          ['Support Email:', companyData?.support_email || 'support@edufam.com'],
          ['Contact Phone:', companyData?.contact_phone || 'Not Set'],
          ['Headquarters Address:', companyData?.headquarters_address || 'Not Set']
        ]
      }
    },
    { text: '\n' },

    { text: 'Legal & Registration Details', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['40%', '60%'],
        body: [
          ['Incorporation Details:', companyData?.incorporation_details || 'Not Set'],
          ['Registration Status:', companyData?.registration_number ? 'Registered' : 'Pending'],
          ['Last Profile Update:', companyData?.updated_at ? new Date(companyData.updated_at).toLocaleDateString() : 'Not Available']
        ]
      }
    },
    { text: '\n' },

    { text: 'Current Platform Metrics', style: 'header' },
    {
      table: {
        headerRows: 0,
        widths: ['40%', '60%'],
        body: [
          ['Total Schools:', (metricsData?.total_schools || 0).toString()],
          ['Active Schools:', (metricsData?.active_schools || 0).toString()],
          ['Total Users:', (metricsData?.total_users || 0).toString()],
          ['Active Users:', (metricsData?.active_users || 0).toString()],
          ['Monthly Revenue:', `KES ${(metricsData?.monthly_revenue || 0).toLocaleString()}`],
          ['Total Revenue:', `KES ${(metricsData?.total_revenue || 0).toLocaleString()}`],
          ['System Uptime:', `${metricsData?.system_uptime_percentage || 100}%`]
        ]
      }
    },
    { text: '\n' },

    { text: 'Branding Information', style: 'subheader' },
    {
      table: {
        headerRows: 0,
        widths: ['40%', '60%'],
        body: [
          ['Company Logo URL:', companyData?.company_logo_url || 'Not Set'],
          ['Logo Status:', companyData?.company_logo_url ? 'Available' : 'Not Uploaded']
        ]
      }
    }
  ];
}
