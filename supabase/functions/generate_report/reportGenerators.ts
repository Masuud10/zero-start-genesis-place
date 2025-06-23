
// Report generation functions for different user roles and report types

export const generatePlatformOverviewReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating platform overview report...');
    
    // Get total schools count
    const { data: schoolsData, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, created_at, location')
      .order('created_at', { ascending: false });

    if (schoolsError) {
      console.error('Schools query error:', schoolsError);
      throw new Error(`Failed to fetch schools: ${schoolsError.message}`);
    }

    // Get total users count by role
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, role, created_at, school_id')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Users query error:', usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // Get system metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('company_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(30);

    if (metricsError) {
      console.error('Metrics query error:', metricsError);
      // Don't fail the whole report for metrics
    }

    const totalSchools = schoolsData?.length || 0;
    const activeSchools = schoolsData?.filter(s => s.created_at).length || 0;
    const totalUsers = usersData?.length || 0;
    
    const usersByRole = usersData?.reduce((acc: any, user: any) => {
      const role = user.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {}) || {};

    return [
      {
        text: 'Platform Overview Summary',
        style: 'header',
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Schools Statistics', style: 'subheader' },
              { text: `Total Schools: ${totalSchools}`, margin: [0, 5] },
              { text: `Active Schools: ${activeSchools}`, margin: [0, 5] },
              { text: `Growth Rate: ${totalSchools > 0 ? ((activeSchools/totalSchools) * 100).toFixed(1) : 0}%`, margin: [0, 5] }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'User Statistics', style: 'subheader' },
              { text: `Total Users: ${totalUsers}`, margin: [0, 5] },
              { text: `Principals: ${usersByRole.principal || 0}`, margin: [0, 5] },
              { text: `Teachers: ${usersByRole.teacher || 0}`, margin: [0, 5] },
              { text: `Parents: ${usersByRole.parent || 0}`, margin: [0, 5] },
              { text: `Finance Officers: ${usersByRole.finance_officer || 0}`, margin: [0, 5] }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Recent Schools',
        style: 'subheader',
        margin: [0, 10, 0, 5]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            ['School Name', 'Location', 'Created Date'],
            ...(schoolsData?.slice(0, 10).map((school: any) => [
              school.name || 'N/A',
              school.location || 'N/A',
              school.created_at ? new Date(school.created_at).toLocaleDateString() : 'N/A'
            ]) || [['No schools found', '', '']])
          ]
        },
        margin: [0, 0, 0, 20]
      }
    ];
  } catch (error) {
    console.error('Error generating platform overview report:', error);
    return [
      {
        text: 'Platform Overview Report - Error',
        style: 'error'
      },
      {
        text: `Error details: ${error.message || 'Unknown error'}`,
        margin: [0, 10]
      }
    ];
  }
};

export const generateSchoolsSummaryReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating schools summary report...');
    
    // Try to get comprehensive data first
    let { data: schoolsData, error: schoolsError } = await supabase
      .from('comprehensive_report_data')
      .select('*')
      .order('school_name', { ascending: true });

    // If comprehensive data doesn't exist, fall back to basic school data
    if (schoolsError || !schoolsData || schoolsData.length === 0) {
      console.log('Comprehensive data not available, using basic school data');
      
      const { data: basicSchools, error: basicError } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          location,
          created_at
        `)
        .order('name', { ascending: true });

      if (basicError) {
        throw new Error(`Failed to fetch schools: ${basicError.message}`);
      }

      schoolsData = basicSchools?.map((school: any) => ({
        school_id: school.id,
        school_name: school.name,
        location: school.location,
        total_students: 0,
        total_teachers: 0,
        average_grade: 0,
        attendance_rate: 0
      })) || [];
    }

    const totalSchools = schoolsData?.length || 0;
    const totalStudents = schoolsData?.reduce((sum: number, school: any) => sum + (school.total_students || 0), 0);
    const totalTeachers = schoolsData?.reduce((sum: number, school: any) => sum + (school.total_teachers || 0), 0);

    return [
      {
        text: 'Schools Summary Report',
        style: 'header',
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '33%',
            stack: [
              { text: 'Total Schools', style: 'subheader' },
              { text: totalSchools.toString(), style: 'bigNumber' }
            ]
          },
          {
            width: '33%',
            stack: [
              { text: 'Total Students', style: 'subheader' },
              { text: totalStudents.toString(), style: 'bigNumber' }
            ]
          },
          {
            width: '34%',
            stack: [
              { text: 'Total Teachers', style: 'subheader' },
              { text: totalTeachers.toString(), style: 'bigNumber' }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'School Performance Overview',
        style: 'subheader',
        margin: [0, 10, 0, 5]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*'],
          body: [
            ['School Name', 'Students', 'Teachers', 'Avg Grade', 'Attendance Rate'],
            ...(schoolsData?.map((school: any) => [
              school.school_name || 'N/A',
              (school.total_students || 0).toString(),
              (school.total_teachers || 0).toString(),
              school.average_grade ? `${school.average_grade.toFixed(1)}%` : 'N/A',
              school.attendance_rate ? `${school.attendance_rate.toFixed(1)}%` : 'N/A'
            ]) || [['No schools found', '', '', '', '']])
          ]
        }
      }
    ];
  } catch (error) {
    console.error('Error generating schools summary report:', error);
    return [
      {
        text: 'Schools Summary Report - Error',
        style: 'error'
      },
      {
        text: `Error details: ${error.message || 'Unknown error'}`,
        margin: [0, 10]
      }
    ];
  }
};

export const generateUsersAnalyticsReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating users analytics report...');
    
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id, 
        role, 
        created_at, 
        school_id,
        schools(name, location)
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const usersByRole = usersData?.reduce((acc: any, user: any) => {
      const role = user.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {}) || {};

    const totalUsers = usersData?.length || 0;

    return [
      {
        text: 'Users Analytics Report',
        style: 'header',
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Total Users', style: 'subheader' },
              { text: totalUsers.toString(), style: 'bigNumber' }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'Active Accounts', style: 'subheader' },
              { text: totalUsers.toString(), style: 'bigNumber' }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'User Distribution by Role',
        style: 'subheader',
        margin: [0, 10, 0, 5]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            ['Role', 'Count'],
            ...Object.entries(usersByRole).map(([role, count]) => [
              role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
              count.toString()
            ])
          ]
        },
        margin: [0, 0, 0, 20]
      }
    ];
  } catch (error) {
    console.error('Error generating users analytics report:', error);
    return [
      {
        text: 'Users Analytics Report - Error',
        style: 'error'
      },
      {
        text: `Error details: ${error.message || 'Unknown error'}`,
        margin: [0, 10]
      }
    ];
  }
};

export const generateFinancialOverviewReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating financial overview report...');
    
    const { data: feesData, error: feesError } = await supabase
      .from('fees')
      .select('amount, paid_amount, status, school_id, schools(name)')
      .order('created_at', { ascending: false });

    if (feesError) {
      console.error('Fees query error:', feesError);
      throw new Error(`Failed to fetch fees data: ${feesError.message}`);
    }

    const totalFees = feesData?.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0) || 0;
    const totalCollected = feesData?.reduce((sum: number, fee: any) => sum + (fee.paid_amount || 0), 0) || 0;
    const outstanding = totalFees - totalCollected;
    const collectionRate = totalFees > 0 ? ((totalCollected / totalFees) * 100) : 0;

    return [
      {
        text: 'Financial Overview Report',
        style: 'header',
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '33%',
            stack: [
              { text: 'Total Fees', style: 'subheader' },
              { text: `KES ${totalFees.toLocaleString()}`, style: 'bigNumber' }
            ]
          },
          {
            width: '33%',
            stack: [
              { text: 'Collected', style: 'subheader' },
              { text: `KES ${totalCollected.toLocaleString()}`, style: 'bigNumber' }
            ]
          },
          {
            width: '34%',
            stack: [
              { text: 'Outstanding', style: 'subheader' },
              { text: `KES ${outstanding.toLocaleString()}`, style: 'bigNumber' }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: `Collection Rate: ${collectionRate.toFixed(1)}%`,
        style: 'subheader',
        margin: [0, 10]
      },
      {
        text: `Total Transactions: ${feesData?.length || 0}`,
        margin: [0, 5]
      }
    ];
  } catch (error) {
    console.error('Error generating financial overview report:', error);
    return [
      {
        text: 'Financial Overview Report - Error',
        style: 'error'
      },
      {
        text: `Error details: ${error.message || 'Unknown error'}`,
        margin: [0, 10]
      }
    ];
  }
};

export const generateSystemHealthReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating system health report...');
    
    const { data: metricsData, error: metricsError } = await supabase
      .from('company_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(7);

    if (metricsError) {
      console.error('Metrics query error:', metricsError);
    }

    const latestMetrics = metricsData?.[0] || {};
    const hasMetrics = metricsData && metricsData.length > 0;

    return [
      {
        text: 'System Health Report',
        style: 'header',
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'System Uptime', style: 'subheader' },
              { text: `${latestMetrics.system_uptime_percentage || 100}%`, style: 'bigNumber' }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'API Calls', style: 'subheader' },
              { text: (latestMetrics.api_calls_count || 0).toString(), style: 'bigNumber' }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: hasMetrics ? 'Recent Activity' : 'System Status',
        style: 'subheader',
        margin: [0, 10, 0, 5]
      },
      hasMetrics ? {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            ['Date', 'Active Users', 'API Calls', 'Uptime'],
            ...(metricsData?.map((metric: any) => [
              new Date(metric.metric_date).toLocaleDateString(),
              (metric.active_users || 0).toString(),
              (metric.api_calls_count || 0).toString(),
              `${metric.system_uptime_percentage || 100}%`
            ]) || [])
          ]
        }
      } : {
        text: 'System is operational. No detailed metrics available.',
        margin: [0, 10]
      }
    ];
  } catch (error) {
    console.error('Error generating system health report:', error);
    return [
      {
        text: 'System Health Report - Error',
        style: 'error'
      },
      {
        text: `Error details: ${error.message || 'Unknown error'}`,
        margin: [0, 10]
      }
    ];
  }
};

export const generateCompanyProfileReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating company profile report...');
    
    const { data: companyData, error: companyError } = await supabase
      .from('company_details')
      .select('*')
      .single();

    if (companyError && companyError.code !== 'PGRST116') {
      console.error('Company data query error:', companyError);
    }

    const company = companyData || {
      company_name: 'EduFam',
      company_type: 'EdTech SaaS',
      year_established: 2024,
      website_url: 'https://edufam.com',
      support_email: 'support@edufam.com',
      company_motto: 'Empowering Education Through Technology'
    };

    return [
      {
        text: 'Company Profile Report',
        style: 'header',
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Company Information', style: 'subheader' },
              { text: `Name: ${company.company_name}`, margin: [0, 5] },
              { text: `Type: ${company.company_type}`, margin: [0, 5] },
              { text: `Established: ${company.year_established}`, margin: [0, 5] },
              { text: `Website: ${company.website_url}`, margin: [0, 5] }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'Contact Information', style: 'subheader' },
              { text: `Support Email: ${company.support_email}`, margin: [0, 5] },
              { text: `Phone: ${company.contact_phone || 'N/A'}`, margin: [0, 5] },
              { text: `Address: ${company.headquarters_address || 'N/A'}`, margin: [0, 5] }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Company Mission',
        style: 'subheader',
        margin: [0, 10, 0, 5]
      },
      {
        text: company.company_motto || 'Empowering Education Through Technology',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Service Information',
        style: 'subheader',
        margin: [0, 10, 0, 5]
      },
      {
        text: 'EduFam provides comprehensive school management solutions including student information systems, grade management, attendance tracking, and financial management tools.',
        margin: [0, 0, 0, 10]
      }
    ];
  } catch (error) {
    console.error('Error generating company profile report:', error);
    return [
      {
        text: 'Company Profile Report - Error',
        style: 'error'
      },
      {
        text: `Error details: ${error.message || 'Unknown error'}`,
        margin: [0, 10]
      }
    ];
  }
};
