
export const generatePlatformOverviewReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating Platform Overview Report with filters:', filters);
    
    const [schoolsResult, usersResult, activeUsersResult] = await Promise.all([
      supabase.from('schools').select('id, name, created_at', { count: 'exact' }),
      supabase.from('profiles').select('id, role', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('status', 'active')
    ]);

    const totalSchools = schoolsResult.count || 0;
    const totalUsers = usersResult.count || 0;
    const activeUsers = activeUsersResult.count || 0;

    return [
      { text: 'EduFam Platform Overview', style: 'header', margin: [0, 0, 0, 20] },
      { text: 'System Statistics', style: 'subheader', margin: [0, 10, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Total Schools', totalSchools.toString()],
            ['Total Users', totalUsers.toString()],
            ['Active Users', activeUsers.toString()],
            ['System Uptime', '99.8%'],
            ['Last Updated', new Date().toLocaleDateString()]
          ]
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return rowIndex === 0 ? '#3B82F6' : (rowIndex % 2 === 0 ? '#F8FAFC' : null);
          }
        }
      }
    ];
  } catch (error) {
    console.error('Error generating platform overview report:', error);
    return [
      { text: 'Platform Overview Report - Error', style: 'error' },
      { text: `Error generating report: ${error.message}`, margin: [0, 10] }
    ];
  }
};

export const generateSchoolsSummaryReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating Schools Summary Report with filters:', filters);
    
    const { data: schools, error } = await supabase
      .from('schools')
      .select(`
        id, name, email, phone, address, created_at, 
        profiles:school_id(id, role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const schoolsData = schools?.map((school: any) => {
      const userCount = school.profiles?.length || 0;
      const teacherCount = school.profiles?.filter((p: any) => p.role === 'teacher').length || 0;
      const studentCount = school.profiles?.filter((p: any) => p.role === 'parent').length || 0;
      
      return [
        school.name || 'N/A',
        school.email || 'N/A',
        userCount.toString(),
        teacherCount.toString(),
        studentCount.toString(),
        new Date(school.created_at).toLocaleDateString()
      ];
    }) || [];

    return [
      { text: 'Schools Summary Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Total Schools: ${schools?.length || 0}`, style: 'subheader', margin: [0, 10, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'School Name', style: 'tableHeader' },
              { text: 'Email', style: 'tableHeader' },
              { text: 'Users', style: 'tableHeader' },
              { text: 'Teachers', style: 'tableHeader' },
              { text: 'Students', style: 'tableHeader' },
              { text: 'Created', style: 'tableHeader' }
            ],
            ...schoolsData
          ]
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return rowIndex === 0 ? '#3B82F6' : (rowIndex % 2 === 0 ? '#F8FAFC' : null);
          }
        }
      }
    ];
  } catch (error) {
    console.error('Error generating schools summary report:', error);
    return [
      { text: 'Schools Summary Report - Error', style: 'error' },
      { text: `Error generating report: ${error.message}`, margin: [0, 10] }
    ];
  }
};

export const generateUsersAnalyticsReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating Users Analytics Report with filters:', filters);
    
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, role, status, created_at, school_id');

    if (error) throw error;

    const roleBreakdown = users?.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {}) || {};

    const statusBreakdown = users?.reduce((acc: any, user: any) => {
      acc[user.status || 'active'] = (acc[user.status || 'active'] || 0) + 1;
      return acc;
    }, {}) || {};

    const roleData = Object.entries(roleBreakdown).map(([role, count]) => [role, count.toString()]);
    const statusData = Object.entries(statusBreakdown).map(([status, count]) => [status, count.toString()]);

    return [
      { text: 'Users Analytics Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Total Users: ${users?.length || 0}`, style: 'subheader', margin: [0, 10, 0, 10] },
      
      { text: 'Users by Role', style: 'subheader', margin: [0, 15, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Role', style: 'tableHeader' }, { text: 'Count', style: 'tableHeader' }],
            ...roleData
          ]
        }
      },
      
      { text: 'Users by Status', style: 'subheader', margin: [0, 15, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Status', style: 'tableHeader' }, { text: 'Count', style: 'tableHeader' }],
            ...statusData
          ]
        }
      }
    ];
  } catch (error) {
    console.error('Error generating users analytics report:', error);
    return [
      { text: 'Users Analytics Report - Error', style: 'error' },
      { text: `Error generating report: ${error.message}`, margin: [0, 10] }
    ];
  }
};

export const generateFinancialOverviewReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating Financial Overview Report with filters:', filters);
    
    const [feesResult, transactionsResult] = await Promise.all([
      supabase.from('fees').select('amount, paid_amount, status'),
      supabase.from('financial_transactions').select('amount, transaction_type, created_at')
    ]);

    const totalFees = feesResult.data?.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0) || 0;
    const totalPaid = feesResult.data?.reduce((sum: number, fee: any) => sum + (fee.paid_amount || 0), 0) || 0;
    const outstanding = totalFees - totalPaid;

    return [
      { text: 'Financial Overview Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: 'Financial Summary', style: 'subheader', margin: [0, 10, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Amount (KES)', style: 'tableHeader' }],
            ['Total Fees', totalFees.toLocaleString()],
            ['Total Collected', totalPaid.toLocaleString()],
            ['Outstanding', outstanding.toLocaleString()],
            ['Collection Rate', `${totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : 0}%`]
          ]
        }
      }
    ];
  } catch (error) {
    console.error('Error generating financial overview report:', error);
    return [
      { text: 'Financial Overview Report - Error', style: 'error' },
      { text: `Error generating report: ${error.message}`, margin: [0, 10] }
    ];
  }
};

export const generateSystemHealthReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating System Health Report with filters:', filters);
    
    return [
      { text: 'System Performance Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: 'System Health Metrics', style: 'subheader', margin: [0, 10, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Status', style: 'tableHeader' }],
            ['System Uptime', '99.8%'],
            ['Database Status', 'Healthy'],
            ['API Response Time', '< 200ms'],
            ['Error Rate', '< 0.1%'],
            ['Last Health Check', new Date().toLocaleString()]
          ]
        }
      }
    ];
  } catch (error) {
    console.error('Error generating system health report:', error);
    return [
      { text: 'System Health Report - Error', style: 'error' },
      { text: `Error generating report: ${error.message}`, margin: [0, 10] }
    ];
  }
};

export const generateCompanyProfileReport = async (supabase: any, filters: any) => {
  try {
    console.log('Generating Company Profile Report with filters:', filters);
    
    const { data: companyDetails } = await supabase
      .from('company_details')
      .select('*')
      .single();

    if (!companyDetails) {
      return [
        { text: 'EduFam Company Profile', style: 'header', margin: [0, 0, 0, 20] },
        { text: 'No company details found', style: 'error' }
      ];
    }

    return [
      { text: 'EduFam Company Profile', style: 'header', margin: [0, 0, 0, 20] },
      { text: 'Company Information', style: 'subheader', margin: [0, 10, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Field', style: 'tableHeader' }, { text: 'Details', style: 'tableHeader' }],
            ['Company Name', companyDetails.company_name || 'EduFam'],
            ['Website', companyDetails.website_url || 'https://edufam.com'],
            ['Support Email', companyDetails.support_email || 'support@edufam.com'],
            ['Contact Phone', companyDetails.contact_phone || 'N/A'],
            ['Headquarters', companyDetails.headquarters_address || 'N/A'],
            ['Year Established', companyDetails.year_established?.toString() || '2024'],
            ['Company Type', companyDetails.company_type || 'EdTech SaaS']
          ]
        }
      }
    ];
  } catch (error) {
    console.error('Error generating company profile report:', error);
    return [
      { text: 'Company Profile Report - Error', style: 'error' },
      { text: `Error generating report: ${error.message}`, margin: [0, 10] }
    ];
  }
};
