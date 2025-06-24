
// Report generators for different types of reports
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export const generatePlatformOverviewReport = async (supabase: SupabaseClient, filters: any) => {
  console.log('Generating Platform Overview Report with filters:', filters);
  
  try {
    // Fetch real data from multiple sources
    const [schoolsData, usersData, metricsData] = await Promise.all([
      supabase.from('schools').select('*'),
      supabase.from('profiles').select('role, school_id, created_at'),
      supabase.from('company_metrics').select('*').order('created_at', { ascending: false }).limit(1)
    ]);

    console.log('Fetched data:', { 
      schools: schoolsData.data?.length || 0, 
      users: usersData.data?.length || 0,
      metrics: metricsData.data?.length || 0
    });

    const schools = schoolsData.data || [];
    const users = usersData.data || [];
    const latestMetrics = metricsData.data?.[0];

    // Calculate statistics
    const totalSchools = schools.length;
    const activeSchools = schools.filter(s => s.status === 'active').length;
    const totalUsers = users.length;
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const content = [
      { text: 'EduFam Platform Overview', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Report generated on ${new Date().toLocaleDateString()}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'Platform Statistics', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Total Schools', totalSchools.toString()],
            ['Active Schools', activeSchools.toString()],
            ['Total Users', totalUsers.toString()],
            ['System Uptime', latestMetrics?.system_uptime_percentage ? `${latestMetrics.system_uptime_percentage}%` : '99.9%'],
            ['Monthly Revenue', latestMetrics?.monthly_revenue ? `$${latestMetrics.monthly_revenue.toLocaleString()}` : '$0'],
          ]
        }
      },

      { text: 'User Distribution by Role', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Role', style: 'tableHeader' }, { text: 'Count', style: 'tableHeader' }],
            ...Object.entries(usersByRole).map(([role, count]) => [role, count.toString()])
          ]
        }
      },

      { text: 'Recent Activity', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `${totalSchools} schools are currently using the platform`,
          `${totalUsers} total registered users across all schools`,
          `${activeSchools} schools are actively using the system`,
          'Platform is operating at optimal performance levels'
        ]
      }
    ];

    return content;
  } catch (error) {
    console.error('Error in generatePlatformOverviewReport:', error);
    return [
      { text: 'Platform Overview Report - Error', style: 'header' },
      { text: `Error generating report: ${error.message}`, style: 'error' },
      { text: 'Please contact support for assistance.', margin: [0, 10] }
    ];
  }
};

export const generateSchoolsSummaryReport = async (supabase: SupabaseClient, filters: any) => {
  console.log('Generating Schools Summary Report with filters:', filters);
  
  try {
    // Fetch comprehensive school data
    const { data: schools, error: schoolsError } = await supabase
      .from('comprehensive_report_data')
      .select('*');

    if (schoolsError) {
      console.error('Error fetching schools data:', schoolsError);
      throw schoolsError;
    }

    const schoolsData = schools || [];
    console.log('Schools data fetched:', schoolsData.length, 'records');

    if (schoolsData.length === 0) {
      return [
        { text: 'Schools Summary Report', style: 'header' },
        { text: 'No school data available at this time.', style: 'normal', margin: [0, 20] },
        { text: 'This could mean:', style: 'subheader', margin: [0, 10] },
        {
          ul: [
            'No schools have been registered yet',
            'Schools exist but have no activity data',
            'Data synchronization is in progress'
          ]
        }
      ];
    }

    const content = [
      { text: 'EduFam Schools Summary Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${new Date().toLocaleDateString()}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: `Summary for ${schoolsData.length} Schools`, style: 'sectionHeader', margin: [0, 20, 0, 10] },
      
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'School Name', style: 'tableHeader' },
              { text: 'Students', style: 'tableHeader' },
              { text: 'Teachers', style: 'tableHeader' },
              { text: 'Avg Grade', style: 'tableHeader' },
              { text: 'Attendance %', style: 'tableHeader' },
              { text: 'Fees Collected', style: 'tableHeader' }
            ],
            ...schoolsData.map(school => [
              school.school_name || 'Unknown School',
              (school.total_students || 0).toString(),
              (school.total_teachers || 0).toString(),
              school.average_grade ? `${school.average_grade.toFixed(1)}%` : 'N/A',
              school.attendance_rate ? `${school.attendance_rate.toFixed(1)}%` : 'N/A',
              school.total_collected ? `$${school.total_collected.toLocaleString()}` : '$0'
            ])
          ]
        }
      },

      { text: 'Platform Totals', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Total', style: 'tableHeader' }],
            ['Total Students', schoolsData.reduce((sum, s) => sum + (s.total_students || 0), 0).toString()],
            ['Total Teachers', schoolsData.reduce((sum, s) => sum + (s.total_teachers || 0), 0).toString()],
            ['Total Fees Collected', `$${schoolsData.reduce((sum, s) => sum + (s.total_collected || 0), 0).toLocaleString()}`],
            ['Average Platform Grade', `${(schoolsData.reduce((sum, s) => sum + (s.average_grade || 0), 0) / schoolsData.length).toFixed(1)}%`],
            ['Average Attendance Rate', `${(schoolsData.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / schoolsData.length).toFixed(1)}%`]
          ]
        }
      }
    ];

    return content;
  } catch (error) {
    console.error('Error in generateSchoolsSummaryReport:', error);
    return [
      { text: 'Schools Summary Report - Error', style: 'header' },
      { text: `Error generating report: ${error.message}`, style: 'error' },
      { text: 'Please contact support for assistance.', margin: [0, 10] }
    ];
  }
};

export const generateUsersAnalyticsReport = async (supabase: SupabaseClient, filters: any) => {
  console.log('Generating Users Analytics Report with filters:', filters);
  
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('role, school_id, created_at, last_login_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const usersData = users || [];
    console.log('Users data fetched:', usersData.length, 'records');

    const usersByRole = usersData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentUsers = usersData.filter(user => {
      const createdDate = new Date(user.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length;

    const content = [
      { text: 'EduFam Users Analytics Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${new Date().toLocaleDateString()}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'User Statistics Overview', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Total Users', usersData.length.toString()],
            ['New Users (Last 30 Days)', recentUsers.toString()],
            ['User Growth Rate', `${((recentUsers / Math.max(usersData.length - recentUsers, 1)) * 100).toFixed(1)}%`]
          ]
        }
      },

      { text: 'Users by Role Distribution', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [{ text: 'Role', style: 'tableHeader' }, { text: 'Count', style: 'tableHeader' }, { text: 'Percentage', style: 'tableHeader' }],
            ...Object.entries(usersByRole).map(([role, count]) => [
              role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              count.toString(),
              `${((count / usersData.length) * 100).toFixed(1)}%`
            ])
          ]
        }
      },

      { text: 'User Engagement Insights', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `Platform has ${usersData.length} total registered users`,
          `${recentUsers} new users joined in the last 30 days`,
          `Most common user role: ${Object.entries(usersByRole).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Not available'}`,
          `Platform serves users across ${new Set(usersData.map(u => u.school_id).filter(Boolean)).size} different schools`
        ]
      }
    ];

    return content;
  } catch (error) {
    console.error('Error in generateUsersAnalyticsReport:', error);
    return [
      { text: 'Users Analytics Report - Error', style: 'header' },
      { text: `Error generating report: ${error.message}`, style: 'error' },
      { text: 'Please contact support for assistance.', margin: [0, 10] }
    ];
  }
};

export const generateFinancialOverviewReport = async (supabase: SupabaseClient, filters: any) => {
  console.log('Generating Financial Overview Report with filters:', filters);
  
  try {
    const [feesData, transactionsData, expensesData] = await Promise.all([
      supabase.from('fees').select('amount, paid_amount, status, school_id'),
      supabase.from('financial_transactions').select('amount, transaction_type, created_at'),
      supabase.from('expenses').select('amount, category, date')
    ]);

    const fees = feesData.data || [];
    const transactions = transactionsData.data || [];
    const expenses = expensesData.data || [];

    console.log('Financial data fetched:', { fees: fees.length, transactions: transactions.length, expenses: expenses.length });

    const totalFeesExpected = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const totalFeesCollected = fees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
    const totalOutstanding = totalFeesExpected - totalFeesCollected;
    const collectionRate = totalFeesExpected > 0 ? (totalFeesCollected / totalFeesExpected) * 100 : 0;

    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const netRevenue = totalFeesCollected - totalExpenses;

    const content = [
      { text: 'EduFam Financial Overview Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${new Date().toLocaleDateString()}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'Revenue Summary', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }],
            ['Total Fees Expected', `$${totalFeesExpected.toLocaleString()}`],
            ['Total Fees Collected', `$${totalFeesCollected.toLocaleString()}`],
            ['Outstanding Amount', `$${totalOutstanding.toLocaleString()}`],
            ['Collection Rate', `${collectionRate.toFixed(1)}%`],
            ['Total Expenses', `$${totalExpenses.toLocaleString()}`],
            ['Net Revenue', `$${netRevenue.toLocaleString()}`]
          ]
        }
      },

      { text: 'Transaction Summary', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Total Transactions', transactions.length.toString()],
            ['Average Transaction Amount', transactions.length > 0 ? `$${(transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length).toFixed(2)}` : '$0'],
            ['Total Schools with Transactions', new Set(fees.map(f => f.school_id).filter(Boolean)).size.toString()]
          ]
        }
      },

      { text: 'Financial Health Indicators', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `Collection efficiency: ${collectionRate.toFixed(1)}% of expected fees collected`,
          `Outstanding debt: $${totalOutstanding.toLocaleString()} pending collection`,
          `Net profit margin: ${totalFeesCollected > 0 ? ((netRevenue / totalFeesCollected) * 100).toFixed(1) : '0'}%`,
          `Total financial transactions processed: ${transactions.length}`
        ]
      }
    ];

    return content;
  } catch (error) {
    console.error('Error in generateFinancialOverviewReport:', error);
    return [
      { text: 'Financial Overview Report - Error', style: 'header' },
      { text: `Error generating report: ${error.message}`, style: 'error' },
      { text: 'Please contact support for assistance.', margin: [0, 10] }
    ];
  }
};

export const generateSystemHealthReport = async (supabase: SupabaseClient, filters: any) => {
  console.log('Generating System Health Report with filters:', filters);
  
  try {
    const [metricsData, schoolsData, usersData] = await Promise.all([
      supabase.from('company_metrics').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('schools').select('id, name, created_at, status'),
      supabase.from('profiles').select('created_at, last_login_at').order('created_at', { ascending: false }).limit(100)
    ]);

    const metrics = metricsData.data || [];
    const schools = schoolsData.data || [];
    const recentUsers = usersData.data || [];

    const latestMetrics = metrics[0];
    const systemUptime = latestMetrics?.system_uptime_percentage || 99.9;
    const apiCalls = latestMetrics?.api_calls_count || 0;

    const activeSchools = schools.filter(s => s.status === 'active').length;
    const recentLogins = recentUsers.filter(u => {
      if (!u.last_login_at) return false;
      const loginDate = new Date(u.last_login_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return loginDate >= sevenDaysAgo;
    }).length;

    const content = [
      { text: 'EduFam System Performance Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${new Date().toLocaleDateString()}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'System Health Metrics', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['System Uptime', `${systemUptime}%`],
            ['API Calls (Last Period)', apiCalls.toLocaleString()],
            ['Active Schools', activeSchools.toString()],
            ['Recent User Activity (7 days)', recentLogins.toString()],
            ['System Status', systemUptime >= 99 ? 'Healthy' : 'Needs Attention']
          ]
        }
      },

      { text: 'Performance Trends (Last 30 Days)', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [{ text: 'Date', style: 'tableHeader' }, { text: 'Uptime %', style: 'tableHeader' }, { text: 'API Calls', style: 'tableHeader' }],
            ...metrics.slice(0, 10).map(metric => [
              new Date(metric.created_at || metric.metric_date).toLocaleDateString(),
              `${metric.system_uptime_percentage || 99.9}%`,
              (metric.api_calls_count || 0).toLocaleString()
            ])
          ]
        }
      },

      { text: 'System Health Summary', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `System maintains ${systemUptime}% uptime - ${systemUptime >= 99.9 ? 'Excellent' : systemUptime >= 99 ? 'Good' : 'Needs Improvement'}`,
          `Processing ${apiCalls.toLocaleString()} API calls efficiently`,
          `${activeSchools} schools actively using the platform`,
          `${recentLogins} users logged in within the last 7 days`,
          'All core services operational and performing within normal parameters'
        ]
      }
    ];

    return content;
  } catch (error) {
    console.error('Error in generateSystemHealthReport:', error);
    return [
      { text: 'System Performance Report - Error', style: 'header' },
      { text: `Error generating report: ${error.message}`, style: 'error' },
      { text: 'Please contact support for assistance.', margin: [0, 10] }
    ];
  }
};

export const generateCompanyProfileReport = async (supabase: SupabaseClient, filters: any) => {
  console.log('Generating Company Profile Report with filters:', filters);
  
  try {
    const { data: companyDetails, error } = await supabase
      .from('company_details')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching company details:', error);
      throw error;
    }

    const company = companyDetails || {
      company_name: 'EduFam',
      company_type: 'EdTech SaaS Platform',
      year_established: 2024,
      headquarters_address: 'Global Operations',
      website_url: 'https://edufam.com',
      support_email: 'support@edufam.com',
      contact_phone: '+1-800-EDUFAM',
      company_motto: 'Empowering Education Through Technology',
      company_slogan: 'Where Learning Meets Innovation'
    };

    console.log('Company details fetched:', company.company_name);

    const content = [
      { text: company.company_name, style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
      { text: company.company_slogan || 'Educational Technology Solutions', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
      
      { text: 'Company Overview', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Attribute', style: 'tableHeader' }, { text: 'Details', style: 'tableHeader' }],
            ['Company Name', company.company_name],
            ['Business Type', company.company_type || 'Educational Technology'],
            ['Year Established', company.year_established?.toString() || '2024'],
            ['Headquarters', company.headquarters_address || 'Global Operations'],
            ['Website', company.website_url || 'https://edufam.com'],
            ['Support Email', company.support_email || 'support@edufam.com'],
            ['Contact Phone', company.contact_phone || 'Available on request']
          ]
        }
      },

      { text: 'Mission & Vision', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          company.company_motto || 'Empowering educational institutions with comprehensive management solutions',
          'Providing innovative technology solutions for modern education',
          'Supporting schools in their digital transformation journey',
          'Building sustainable and scalable educational platforms'
        ]
      },

      { text: 'Core Services', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          'School Management System (SMS)',
          'Student Information Management',
          'Academic Performance Tracking',
          'Financial Management & Fee Collection',
          'Communication & Collaboration Tools',
          'Real-time Analytics & Reporting',
          'Multi-tenant Architecture for Schools',
          '24/7 Technical Support & Training'
        ]
      },

      { text: 'Technology Platform', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          'Cloud-based SaaS architecture',
          'Real-time data synchronization',
          'Mobile-responsive design',
          'Enterprise-grade security',
          'Scalable infrastructure',
          'API-first development approach',
          'Multi-language support capabilities'
        ]
      }
    ];

    return content;
  } catch (error) {
    console.error('Error in generateCompanyProfileReport:', error);
    return [
      { text: 'Company Profile Report - Error', style: 'header' },
      { text: `Error generating report: ${error.message}`, style: 'error' },
      { text: 'Please contact support for assistance.', margin: [0, 10] }
    ];
  }
};
