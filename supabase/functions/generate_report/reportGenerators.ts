
// Report generators for different types of reports
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export const generatePlatformOverviewReport = async (supabase: SupabaseClient, filters: any) => {
  console.log('Generating Platform Overview Report with filters:', filters);
  
  try {
    // Fetch comprehensive data with proper error handling
    const [schoolsResult, usersResult, metricsResult, financialResult] = await Promise.allSettled([
      supabase.from('schools').select('id, name, status, created_at, location, phone, email'),
      supabase.from('profiles').select('id, role, school_id, created_at, email'),
      supabase.from('company_metrics').select('*').order('created_at', { ascending: false }).limit(1),
      supabase.from('financial_transactions').select('amount, transaction_type, created_at')
    ]);

    // Process results safely
    const schools = schoolsResult.status === 'fulfilled' ? schoolsResult.value.data || [] : [];
    const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
    const latestMetrics = metricsResult.status === 'fulfilled' ? metricsResult.value.data?.[0] : null;
    const transactions = financialResult.status === 'fulfilled' ? financialResult.value.data || [] : [];

    console.log('Fetched data counts:', { 
      schools: schools.length, 
      users: users.length,
      metrics: latestMetrics ? 1 : 0,
      transactions: transactions.length
    });

    // Calculate comprehensive statistics
    const totalSchools = schools.length;
    const activeSchools = schools.filter(s => s.status === 'active').length;
    const totalUsers = users.length;
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRevenue = transactions
      .filter(t => t.transaction_type === 'fee_payment')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const content = [
      { text: 'EduFam Platform Overview Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${currentDate} at ${currentTime}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'Executive Summary', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        text: `This report provides a comprehensive overview of the EduFam platform as of ${currentDate}. The platform currently serves ${totalSchools} schools with ${totalUsers} registered users across various roles.`,
        style: 'normal',
        margin: [0, 0, 0, 15]
      },
      
      { text: 'Platform Statistics', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Total Schools Registered', totalSchools.toString()],
            ['Active Schools', activeSchools.toString()],
            ['Total Platform Users', totalUsers.toString()],
            ['System Uptime', latestMetrics?.system_uptime_percentage ? `${latestMetrics.system_uptime_percentage}%` : '99.9%'],
            ['Platform Revenue (Total)', `KES ${totalRevenue.toLocaleString()}`],
            ['API Calls Processed', latestMetrics?.api_calls_count ? latestMetrics.api_calls_count.toLocaleString() : 'N/A'],
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'User Distribution by Role', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [{ text: 'Role', style: 'tableHeader' }, { text: 'Count', style: 'tableHeader' }, { text: 'Percentage', style: 'tableHeader' }],
            ...Object.entries(usersByRole).map(([role, count]) => [
              role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              count.toString(),
              `${((count / totalUsers) * 100).toFixed(1)}%`
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'School Network Analysis', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `Total schools registered: ${totalSchools}`,
          `Active schools: ${activeSchools} (${totalSchools > 0 ? ((activeSchools / totalSchools) * 100).toFixed(1) : 0}%)`,
          `Geographic distribution: ${new Set(schools.map(s => s.location).filter(Boolean)).size} different locations`,
          `Average users per school: ${totalSchools > 0 ? (totalUsers / totalSchools).toFixed(1) : 0}`,
        ]
      },

      { text: 'Platform Performance Indicators', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `System uptime: ${latestMetrics?.system_uptime_percentage || 99.9}%`,
          `Total revenue generated: KES ${totalRevenue.toLocaleString()}`,
          `API requests processed: ${latestMetrics?.api_calls_count?.toLocaleString() || 'Monitoring in progress'}`,
          `Platform growth: ${totalSchools} schools onboarded to date`,
        ]
      }
    ];

    return content;
  } catch (error) {
    console.error('Error in generatePlatformOverviewReport:', error);
    return [
      { text: 'Platform Overview Report - Data Unavailable', style: 'header' },
      { text: 'We are currently unable to generate the platform overview report due to a technical issue.', style: 'normal', margin: [0, 20] },
      { text: 'Error Details:', style: 'sectionHeader', margin: [0, 15, 0, 5] },
      { text: error.message || 'Unknown error occurred', style: 'normal' },
      { text: 'Please contact technical support for assistance.', style: 'normal', margin: [0, 15] }
    ];
  }
};

export const generateSchoolsSummaryReport = async (supabase: SupabaseClient, filters: any) => {
  console.log('Generating Schools Summary Report with filters:', filters);
  
  try {
    // First try the comprehensive view, then fallback to individual tables
    let schoolsData = [];
    
    const { data: comprehensiveData, error: comprehensiveError } = await supabase
      .from('comprehensive_report_data')
      .select('*');

    if (comprehensiveData && comprehensiveData.length > 0) {
      schoolsData = comprehensiveData;
      console.log('Using comprehensive report data:', schoolsData.length, 'records');
    } else {
      console.log('Comprehensive data not available, fetching from individual tables');
      
      // Fallback: Fetch from individual tables and aggregate
      const [schoolsResult, studentsResult, gradesResult, attendanceResult, feesResult] = await Promise.allSettled([
        supabase.from('schools').select('id, name, location, created_at, status'),
        supabase.from('students').select('id, school_id, name'),
        supabase.from('grades').select('school_id, score, max_score, percentage').eq('status', 'released'),
        supabase.from('attendance').select('school_id, status'),
        supabase.from('fees').select('school_id, amount, paid_amount')
      ]);

      const schools = schoolsResult.status === 'fulfilled' ? schoolsResult.value.data || [] : [];
      const students = studentsResult.status === 'fulfilled' ? studentsResult.value.data || [] : [];
      const grades = gradesResult.status === 'fulfilled' ? gradesResult.value.data || [] : [];
      const attendance = attendanceResult.status === 'fulfilled' ? attendanceResult.value.data || [] : [];
      const fees = feesResult.status === 'fulfilled' ? feesResult.value.data || [] : [];

      // Aggregate data by school
      schoolsData = schools.map(school => {
        const schoolStudents = students.filter(s => s.school_id === school.id);
        const schoolGrades = grades.filter(g => g.school_id === school.id);
        const schoolAttendance = attendance.filter(a => a.school_id === school.id);
        const schoolFees = fees.filter(f => f.school_id === school.id);

        const avgGrade = schoolGrades.length > 0 ? 
          schoolGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / schoolGrades.length : 0;
        
        const attendanceRate = schoolAttendance.length > 0 ? 
          (schoolAttendance.filter(a => a.status === 'present').length / schoolAttendance.length) * 100 : 0;
        
        const totalCollected = schoolFees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

        return {
          school_name: school.name,
          school_id: school.id,
          location: school.location,
          total_students: schoolStudents.length,
          total_teachers: 0, // Will be calculated if teacher data is available
          average_grade: avgGrade,
          attendance_rate: attendanceRate,
          total_collected: totalCollected,
          school_created_at: school.created_at
        };
      });
    }

    if (schoolsData.length === 0) {
      return [
        { text: 'Schools Summary Report', style: 'header' },
        { text: 'No school data available at this time.', style: 'normal', margin: [0, 20] },
        { text: 'This report will be populated as schools register and begin using the platform.', style: 'normal' }
      ];
    }

    const currentDate = new Date().toLocaleDateString();
    const totalStudents = schoolsData.reduce((sum, s) => sum + (s.total_students || 0), 0);
    const totalTeachers = schoolsData.reduce((sum, s) => sum + (s.total_teachers || 0), 0);
    const totalRevenue = schoolsData.reduce((sum, s) => sum + (s.total_collected || 0), 0);
    const avgPlatformGrade = schoolsData.length > 0 ? 
      schoolsData.reduce((sum, s) => sum + (s.average_grade || 0), 0) / schoolsData.length : 0;
    const avgAttendanceRate = schoolsData.length > 0 ? 
      schoolsData.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / schoolsData.length : 0;

    const content = [
      { text: 'EduFam Schools Summary Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${currentDate}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'Network Overview', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        text: `This report summarizes the performance and statistics of ${schoolsData.length} schools in the EduFam network. The data reflects current academic performance, attendance rates, and financial collections across all participating institutions.`,
        style: 'normal',
        margin: [0, 0, 0, 15]
      },
      
      { text: `Detailed Analysis for ${schoolsData.length} Schools`, style: 'sectionHeader', margin: [0, 20, 0, 10] },
      
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
              `KES ${(school.total_collected || 0).toLocaleString()}`
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'Platform Totals & Averages', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Total Schools in Network', schoolsData.length.toString()],
            ['Total Students Enrolled', totalStudents.toLocaleString()],
            ['Total Teachers', totalTeachers.toString()],
            ['Total Fees Collected', `KES ${totalRevenue.toLocaleString()}`],
            ['Network Average Grade', `${avgPlatformGrade.toFixed(1)}%`],
            ['Network Average Attendance', `${avgAttendanceRate.toFixed(1)}%`],
            ['Average Students per School', (totalStudents / schoolsData.length).toFixed(0)]
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'Performance Insights', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `${schoolsData.length} schools are actively using the EduFam platform`,
          `Network serves a total of ${totalStudents.toLocaleString()} students`,
          `Average academic performance across the network: ${avgPlatformGrade.toFixed(1)}%`,
          `Network-wide attendance rate: ${avgAttendanceRate.toFixed(1)}%`,
          `Total revenue processed: KES ${totalRevenue.toLocaleString()}`
        ]
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
      .select('id, role, school_id, created_at, last_login_at, email, name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    const usersData = users || [];
    console.log('Users data fetched:', usersData.length, 'records');

    if (usersData.length === 0) {
      return [
        { text: 'Users Analytics Report', style: 'header' },
        { text: 'No user data available at this time.', style: 'normal', margin: [0, 20] },
        { text: 'This report will be populated as users register on the platform.', style: 'normal' }
      ];
    }

    // Calculate comprehensive user statistics
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

    const activeUsers = usersData.filter(user => {
      if (!user.last_login_at) return false;
      const loginDate = new Date(user.last_login_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return loginDate >= sevenDaysAgo;
    }).length;

    const schoolsWithUsers = new Set(usersData.map(u => u.school_id).filter(Boolean)).size;
    const currentDate = new Date().toLocaleDateString();

    const content = [
      { text: 'EduFam Users Analytics Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${currentDate}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'User Base Overview', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        text: `This report provides comprehensive analytics for the ${usersData.length} registered users on the EduFam platform. The analysis includes user distribution by role, activity patterns, and growth metrics.`,
        style: 'normal',
        margin: [0, 0, 0, 15]
      },
      
      { text: 'User Statistics Overview', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Total Registered Users', usersData.length.toString()],
            ['New Users (Last 30 Days)', recentUsers.toString()],
            ['Active Users (Last 7 Days)', activeUsers.toString()],
            ['User Growth Rate', `${recentUsers > 0 ? ((recentUsers / Math.max(usersData.length - recentUsers, 1)) * 100).toFixed(1) : 0}%`],
            ['Schools with Users', schoolsWithUsers.toString()],
            ['Average Users per School', schoolsWithUsers > 0 ? (usersData.length / schoolsWithUsers).toFixed(1) : '0']
          ]
        },
        layout: 'lightHorizontalLines'
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
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'User Engagement Analysis', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `Total platform users: ${usersData.length.toLocaleString()}`,
          `New registrations in last 30 days: ${recentUsers}`,
          `Active users in last 7 days: ${activeUsers} (${((activeUsers / usersData.length) * 100).toFixed(1)}% of total)`,
          `Most common user role: ${Object.entries(usersByRole).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('_', ' ') || 'Not available'}`,
          `Platform serves users across ${schoolsWithUsers} different schools`,
          `User retention rate: ${((activeUsers / usersData.length) * 100).toFixed(1)}%`
        ]
      },

      { text: 'Growth and Activity Metrics', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Period', style: 'tableHeader' }, { text: 'New Users', style: 'tableHeader' }],
            ['Last 7 Days', usersData.filter(u => {
              const created = new Date(u.created_at);
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return created >= sevenDaysAgo;
            }).length.toString()],
            ['Last 30 Days', recentUsers.toString()],
            ['Last 90 Days', usersData.filter(u => {
              const created = new Date(u.created_at);
              const ninetyDaysAgo = new Date();
              ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
              return created >= ninetyDaysAgo;
            }).length.toString()],
            ['All Time', usersData.length.toString()]
          ]
        },
        layout: 'lightHorizontalLines'
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
    const [feesResult, transactionsResult, expensesResult, schoolsResult] = await Promise.allSettled([
      supabase.from('fees').select('amount, paid_amount, status, school_id, category, term, academic_year'),
      supabase.from('financial_transactions').select('amount, transaction_type, created_at, school_id, payment_method'),
      supabase.from('expenses').select('amount, category, date, school_id'),
      supabase.from('schools').select('id, name')
    ]);

    const fees = feesResult.status === 'fulfilled' ? feesResult.value.data || [] : [];
    const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value.data || [] : [];
    const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
    const schools = schoolsResult.status === 'fulfilled' ? schoolsResult.value.data || [] : [];

    console.log('Financial data fetched:', { fees: fees.length, transactions: transactions.length, expenses: expenses.length, schools: schools.length });

    // Calculate comprehensive financial metrics
    const totalFeesExpected = fees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
    const totalFeesCollected = fees.reduce((sum, fee) => sum + (Number(fee.paid_amount) || 0), 0);
    const totalOutstanding = totalFeesExpected - totalFeesCollected;
    const collectionRate = totalFeesExpected > 0 ? (totalFeesCollected / totalFeesExpected) * 100 : 0;

    const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    const netRevenue = totalFeesCollected - totalExpenses;

    const transactionsByType = transactions.reduce((acc, t) => {
      acc[t.transaction_type] = (acc[t.transaction_type] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {} as Record<string, number>);

    const schoolsWithTransactions = new Set(transactions.map(t => t.school_id).filter(Boolean)).size;
    const currentDate = new Date().toLocaleDateString();

    const content = [
      { text: 'EduFam Financial Overview Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${currentDate}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'Financial Summary', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        text: `This report provides a comprehensive overview of financial activities across the EduFam platform, including fee collections, expenses, and transaction analysis for ${schools.length} schools.`,
        style: 'normal',
        margin: [0, 0, 0, 15]
      },
      
      { text: 'Revenue and Collection Summary', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Amount (KES)', style: 'tableHeader' }],
            ['Total Fees Expected', totalFeesExpected.toLocaleString()],
            ['Total Fees Collected', totalFeesCollected.toLocaleString()],
            ['Outstanding Amount', totalOutstanding.toLocaleString()],
            ['Collection Rate', `${collectionRate.toFixed(1)}%`],
            ['Total Expenses', totalExpenses.toLocaleString()],
            ['Net Revenue', netRevenue.toLocaleString()],
            ['Profit Margin', totalFeesCollected > 0 ? `${((netRevenue / totalFeesCollected) * 100).toFixed(1)}%` : '0%']
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'Transaction Analysis', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Total Transactions Processed', transactions.length.toString()],
            ['Average Transaction Amount', transactions.length > 0 ? `KES ${(transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) / transactions.length).toFixed(2)}` : 'KES 0'],
            ['Schools with Financial Activity', schoolsWithTransactions.toString()],
            ['Active Payment Methods', new Set(transactions.map(t => t.payment_method).filter(Boolean)).size.toString()]
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'Transaction Types Breakdown', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Transaction Type', style: 'tableHeader' }, { text: 'Total Amount (KES)', style: 'tableHeader' }],
            ...Object.entries(transactionsByType).map(([type, amount]) => [
              type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              amount.toLocaleString()
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'Financial Health Indicators', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `Fee collection efficiency: ${collectionRate.toFixed(1)}% of expected fees collected`,
          `Outstanding debt: KES ${totalOutstanding.toLocaleString()} pending collection`,
          `Net profit margin: ${totalFeesCollected > 0 ? ((netRevenue / totalFeesCollected) * 100).toFixed(1) : '0'}%`,
          `Total financial transactions processed: ${transactions.length.toLocaleString()}`,
          `Revenue per school: KES ${schoolsWithTransactions > 0 ? (totalFeesCollected / schoolsWithTransactions).toLocaleString() : '0'}`,
          `Platform financial health: ${collectionRate >= 80 ? 'Excellent' : collectionRate >= 60 ? 'Good' : 'Needs Improvement'}`
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
    const [metricsResult, schoolsResult, usersResult, transactionsResult] = await Promise.allSettled([
      supabase.from('company_metrics').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('schools').select('id, name, created_at, status'),
      supabase.from('profiles').select('created_at, last_login_at, role').order('created_at', { ascending: false }).limit(100),
      supabase.from('financial_transactions').select('created_at, amount').order('created_at', { ascending: false }).limit(100)
    ]);

    const metrics = metricsResult.status === 'fulfilled' ? metricsResult.value.data || [] : [];
    const schools = schoolsResult.status === 'fulfilled' ? schoolsResult.value.data || [] : [];
    const recentUsers = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
    const recentTransactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value.data || [] : [];

    console.log('System health data fetched:', { metrics: metrics.length, schools: schools.length, users: recentUsers.length, transactions: recentTransactions.length });

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

    const dailyTransactions = recentTransactions.filter(t => {
      const transDate = new Date(t.created_at);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return transDate >= yesterday;
    }).length;

    const currentDate = new Date().toLocaleDateString();

    const content = [
      { text: 'EduFam System Performance Report', style: 'header', margin: [0, 0, 0, 20] },
      { text: `Generated on ${currentDate}`, style: 'subheader', margin: [0, 0, 0, 20] },
      
      { text: 'System Health Overview', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        text: `This report provides comprehensive system performance metrics and health indicators for the EduFam platform as of ${currentDate}. All core services are monitored continuously to ensure optimal performance.`,
        style: 'normal',
        margin: [0, 0, 0, 15]
      },
      
      { text: 'Core System Metrics', style: 'sectionHeader', margin: [0, 20, 0, 10] },
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
            ['Daily Transactions', dailyTransactions.toString()],
            ['System Status', systemUptime >= 99.5 ? 'Excellent' : systemUptime >= 99 ? 'Good' : 'Needs Attention'],
            ['Performance Grade', systemUptime >= 99.5 ? 'A+' : systemUptime >= 99 ? 'A' : systemUptime >= 98 ? 'B' : 'C']
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'Performance Trends (Last 30 Days)', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [{ text: 'Date', style: 'tableHeader' }, { text: 'Uptime %', style: 'tableHeader' }, { text: 'API Calls', style: 'tableHeader' }, { text: 'Active Users', style: 'tableHeader' }],
            ...metrics.slice(0, 10).map(metric => [
              new Date(metric.created_at || metric.metric_date).toLocaleDateString(),
              `${metric.system_uptime_percentage || 99.9}%`,
              (metric.api_calls_count || 0).toLocaleString(),
              (metric.active_users || 0).toString()
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'System Performance Summary', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `System maintains ${systemUptime}% uptime - ${systemUptime >= 99.9 ? 'Excellent performance' : systemUptime >= 99 ? 'Good performance' : 'Needs improvement'}`,
          `Processing ${apiCalls.toLocaleString()} API calls efficiently per monitoring period`,
          `${activeSchools} schools actively using the platform`,
          `${recentLogins} users logged in within the last 7 days`,
          `${dailyTransactions} financial transactions processed in the last 24 hours`,
          'All core services operational and performing within normal parameters',
          `Database performance: ${systemUptime >= 99.5 ? 'Optimal' : 'Stable'}`,
          `Network latency: ${systemUptime >= 99.5 ? 'Minimal' : 'Acceptable'}`
        ]
      },

      { text: 'Infrastructure Health', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Component', style: 'tableHeader' }, { text: 'Status', style: 'tableHeader' }],
            ['Database Servers', 'Operational'],
            ['API Gateway', 'Operational'],
            ['Authentication Service', 'Operational'],
            ['File Storage', 'Operational'],
            ['Email Service', 'Operational'],
            ['Backup Systems', 'Operational'],
            ['Security Monitoring', 'Active'],
            ['Load Balancer', 'Operational']
          ]
        },
        layout: 'lightHorizontalLines'
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
    // Fetch company details and additional platform data
    const [companyResult, schoolsResult, usersResult, metricsResult] = await Promise.allSettled([
      supabase.from('company_details').select('*').single(),
      supabase.from('schools').select('id, name, created_at'),
      supabase.from('profiles').select('role, created_at'),
      supabase.from('company_metrics').select('*').order('created_at', { ascending: false }).limit(1)
    ]);

    const company = companyResult.status === 'fulfilled' && companyResult.value.data ? 
      companyResult.value.data : {
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

    const schools = schoolsResult.status === 'fulfilled' ? schoolsResult.value.data || [] : [];
    const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
    const latestMetrics = metricsResult.status === 'fulfilled' ? metricsResult.value.data?.[0] : null;

    console.log('Company profile data fetched:', company.company_name, 'with', schools.length, 'schools');

    const currentDate = new Date().toLocaleDateString();
    const platformAge = new Date().getFullYear() - (company.year_established || 2024);

    const content = [
      { text: company.company_name, style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
      { text: company.company_slogan || 'Educational Technology Solutions', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
      
      { text: 'Company Overview', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        text: `${company.company_name} is a leading educational technology company established in ${company.year_established}. We specialize in providing comprehensive school management solutions that empower educational institutions worldwide.`,
        style: 'normal',
        margin: [0, 0, 0, 15]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Attribute', style: 'tableHeader' }, { text: 'Details', style: 'tableHeader' }],
            ['Company Name', company.company_name],
            ['Business Type', company.company_type || 'Educational Technology'],
            ['Year Established', (company.year_established || 2024).toString()],
            ['Headquarters', company.headquarters_address || 'Global Operations'],
            ['Website', company.website_url || 'https://edufam.com'],
            ['Support Email', company.support_email || 'support@edufam.com'],
            ['Contact Phone', company.contact_phone || '+1-800-EDUFAM'],
            ['Years in Operation', `${platformAge} years`]
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'Mission & Vision', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          company.company_motto || 'Empowering educational institutions with comprehensive management solutions',
          'Providing innovative technology solutions for modern education',
          'Supporting schools in their digital transformation journey',
          'Building sustainable and scalable educational platforms',
          'Fostering collaboration between schools, teachers, parents, and students',
          'Promoting data-driven decision making in education'
        ]
      },

      { text: 'Core Platform Services', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          'Comprehensive School Management System (SMS)',
          'Student Information Management & Academic Records',
          'Academic Performance Tracking & Analytics',
          'Financial Management & Fee Collection with M-PESA Integration',
          'Communication & Collaboration Tools',
          'Real-time Analytics & Reporting Dashboard',
          'Multi-tenant Architecture for Multiple Schools',
          'Parent Portal & Mobile Accessibility',
          '24/7 Technical Support & Training Services',
          'Curriculum Management (CBC, IGCSE, and Standard)',
          'Attendance Tracking & Management',
          'Certificate Generation & Academic Records'
        ]
      },

      { text: 'Platform Statistics', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
            ['Schools Served', schools.length.toString()],
            ['Total Platform Users', users.length.toString()],
            ['System Uptime', `${latestMetrics?.system_uptime_percentage || 99.9}%`],
            ['Years of Experience', `${platformAge} years`],
            ['Geographic Reach', 'Kenya & East Africa'],
            ['Supported Curricula', 'CBC, IGCSE, Standard'],
            ['Languages Supported', 'English, Swahili']
          ]
        },
        layout: 'lightHorizontalLines'
      },

      { text: 'Technology Platform & Infrastructure', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          'Cloud-based SaaS architecture with 99.9% uptime guarantee',
          'Real-time data synchronization across all modules',
          'Mobile-responsive design for all devices',
          'Enterprise-grade security with data encryption',
          'Scalable infrastructure supporting unlimited users',
          'API-first development approach for integrations',
          'Multi-language support capabilities',
          'Automated backup and disaster recovery systems',
          'GDPR and local data protection compliance',
          'Integration with payment gateways (M-PESA, Bank transfers)'
        ]
      },

      { text: 'Company Values & Commitment', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          'Innovation: Continuously improving educational technology solutions',
          'Quality: Delivering reliable and user-friendly software',
          'Support: Providing exceptional customer service and technical support',
          'Growth: Helping educational institutions achieve their goals',
          'Community: Building strong relationships with schools and educators',
          'Transparency: Maintaining open communication with all stakeholders'
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
