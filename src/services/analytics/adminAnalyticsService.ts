import { supabase } from '@/integrations/supabase/client';

interface GrowthDataItem {
  created_at: string;
}

interface UsageDataItem {
  last_login_at: string;
  role: string;
}

interface BillingRecord {
  created_at: string;
  amount: string | number;
}

interface TransactionRecord {
  processed_at: string;
  amount: string | number;
}

interface GradeRecord {
  created_at: string;
  percentage: number;
}

interface AttendanceRecord {
  date: string;
  status: string;
}

export class AdminAnalyticsService {
  static async getUserGrowthData() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching user growth data...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ AdminAnalyticsService: User growth fetch error:', error);
        throw new Error(`Failed to fetch user growth data: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('📊 AdminAnalyticsService: No user growth data available');
        return [];
      }

      // Group users by month
      const monthlyGrowth = data.reduce((acc: Record<string, number>, user) => {
        if (!user.created_at) return acc;
        
        try {
          const date = new Date(user.created_at);
          const monthKey = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          acc[monthKey] = (acc[monthKey] || 0) + 1;
        } catch (error) {
          console.warn('📊 AdminAnalyticsService: Invalid date for user:', user.created_at);
        }
        
        return acc;
      }, {});

      const result = Object.entries(monthlyGrowth)
        .map(([month, count]) => ({ month, count }))
        .slice(-12); // Last 12 months

      console.log('✅ AdminAnalyticsService: User growth data processed:', result.length);
      return result;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getUserGrowthData error:', error);
      throw error;
    }
  }

  static async getSchoolGrowthData() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching school growth data...');
      
      const { data, error } = await supabase
        .from('schools')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ AdminAnalyticsService: School growth fetch error:', error);
        throw new Error(`Failed to fetch school growth data: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('📊 AdminAnalyticsService: No school growth data available');
        return [];
      }

      // Group schools by month
      const monthlyGrowth = data.reduce((acc: Record<string, number>, school) => {
        if (!school.created_at) return acc;
        
        try {
          const date = new Date(school.created_at);
          const monthKey = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          acc[monthKey] = (acc[monthKey] || 0) + 1;
        } catch (error) {
          console.warn('📊 AdminAnalyticsService: Invalid date for school:', school.created_at);
        }
        
        return acc;
      }, {});

      const result = Object.entries(monthlyGrowth)
        .map(([month, count]) => ({ month, count }))
        .slice(-12); // Last 12 months

      console.log('✅ AdminAnalyticsService: School growth data processed:', result.length);
      return result;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getSchoolGrowthData error:', error);
      throw error;
    }
  }

  static async getEnrollmentBySchoolData() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching enrollment by school data...');
      
      // Get schools with student count via separate queries to avoid complex joins
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .limit(10);

      if (schoolsError) {
        console.error('❌ AdminAnalyticsService: Schools fetch error:', schoolsError);
        throw new Error(`Failed to fetch schools: ${schoolsError.message}`);
      }

      if (!schools || !Array.isArray(schools)) {
        console.warn('📊 AdminAnalyticsService: No schools data available');
        return [];
      }

      // Get student counts for each school
      const result = [];
      for (const school of schools) {
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', school.id);

        if (!studentsError) {
          result.push({
            school: school.name || 'Unknown School',
            students: students || 0
          });
        }
      }

      const sortedResult = result
        .sort((a, b) => b.students - a.students)
        .slice(0, 10);

      console.log('✅ AdminAnalyticsService: Enrollment data processed:', sortedResult.length);
      return sortedResult;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getEnrollmentBySchoolData error:', error);
      throw error;
    }
  }

  static async getUserRoleDistributionData() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching user role distribution...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role');

      if (error) {
        console.error('❌ AdminAnalyticsService: Role distribution fetch error:', error);
        throw new Error(`Failed to fetch user role data: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('📊 AdminAnalyticsService: No role distribution data available');
        return [];
      }

      const roleCount = data.reduce((acc: Record<string, number>, user) => {
        const role = user.role || 'Unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const result = Object.entries(roleCount)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);

      console.log('✅ AdminAnalyticsService: Role distribution processed:', result.length);
      return result;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getUserRoleDistributionData error:', error);
      throw error;
    }
  }

  static async getCurriculumDistributionData() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching curriculum distribution...');
      
      // Get curriculum distribution from classes table instead of schools
      const { data, error } = await supabase
        .from('classes')
        .select('curriculum_type');

      if (error) {
        console.error('❌ AdminAnalyticsService: Curriculum distribution fetch error:', error);
        throw new Error(`Failed to fetch curriculum data: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('📊 AdminAnalyticsService: No curriculum data available');
        return [];
      }

      const curriculumCount = data.reduce((acc: Record<string, number>, classData) => {
        const curriculum = classData.curriculum_type || 'CBC';
        acc[curriculum] = (acc[curriculum] || 0) + 1;
        return acc;
      }, {});

      const total = Object.values(curriculumCount).reduce((sum, count) => sum + count, 0);
      
      const result = Object.entries(curriculumCount)
        .map(([curriculum, count]) => ({
          curriculum,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      console.log('✅ AdminAnalyticsService: Curriculum distribution processed:', result.length);
      return result;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getCurriculumDistributionData error:', error);
      throw error;
    }
  }

  static async getFinancialSummaryData() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching financial summary...');
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type, amount, status')
        .eq('status', 'active');

      if (error) {
        console.error('❌ AdminAnalyticsService: Financial summary fetch error:', error);
        throw new Error(`Failed to fetch financial data: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('📊 AdminAnalyticsService: No financial data available');
        return [];
      }

      const planRevenue = data.reduce((acc: Record<string, number>, subscription) => {
        const plan = subscription.plan_type || 'Unknown';
        const amount = subscription.amount || 0;
        acc[plan] = (acc[plan] || 0) + amount;
        return acc;
      }, {});

      const total = Object.values(planRevenue).reduce((sum, amount) => sum + amount, 0);
      
      const result = Object.entries(planRevenue)
        .map(([plan, amount]) => ({
          plan,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount);

      console.log('✅ AdminAnalyticsService: Financial summary processed:', result.length);
      return result;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getFinancialSummaryData error:', error);
      throw error;
    }
  }

  static async getSystemGrowthTrends() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching system growth trends...');
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Get combined growth data for students, teachers, and schools
      const [studentsData, teachersData, schoolsData] = await Promise.all([
        // Students growth
        supabase
          .from('students')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString())
          .order('created_at', { ascending: true }),
        
        // Teachers growth  
        supabase
          .from('profiles')
          .select('created_at')
          .eq('role', 'teacher')
          .gte('created_at', sixMonthsAgo.toISOString())
          .order('created_at', { ascending: true }),
        
        // Schools growth
        supabase
          .from('schools')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString())
          .order('created_at', { ascending: true })
      ]);

      if (studentsData.error) throw studentsData.error;
      if (teachersData.error) throw teachersData.error;
      if (schoolsData.error) throw schoolsData.error;

      // Process monthly growth data
      const monthlyGrowth = this.processMonthlyGrowthData({
        students: studentsData.data || [],
        teachers: teachersData.data || [],
        schools: schoolsData.data || []
      });

      console.log('✅ AdminAnalyticsService: System growth trends processed:', monthlyGrowth.length);
      return monthlyGrowth;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getSystemGrowthTrends error:', error);
      throw error;
    }
  }

  static async getPlatformUsageTrends() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching platform usage trends...');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('profiles')
        .select('role, last_login_at')
        .not('last_login_at', 'is', null)
        .gte('last_login_at', thirtyDaysAgo.toISOString())
        .order('last_login_at', { ascending: true });

      if (error) throw error;

      // Process daily login trends by role
      const usageTrends = this.processUsageTrends(data || []);

      console.log('✅ AdminAnalyticsService: Platform usage trends processed:', usageTrends.length);
      return usageTrends;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getPlatformUsageTrends error:', error);
      throw error;
    }
  }

  static async getRevenueAnalytics() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching revenue analytics...');
      
      const [billingData, transactionData] = await Promise.all([
        supabase
          .from('school_billing_records')
          .select('amount, created_at, status, billing_type')
          .eq('status', 'paid'),
        
        supabase
          .from('financial_transactions')
          .select('amount, processed_at, transaction_type')
          .eq('transaction_type', 'payment')
          .not('processed_at', 'is', null)
      ]);

      if (billingData.error) throw billingData.error;
      if (transactionData.error) throw transactionData.error;

      const revenueData = this.processRevenueData({
        billing: billingData.data || [],
        transactions: transactionData.data || []
      });

      console.log('✅ AdminAnalyticsService: Revenue analytics processed:', revenueData.length);
      return revenueData;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getRevenueAnalytics error:', error);
      throw error;
    }
  }

  static async getPerformanceInsights() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching performance insights...');
      
      const [gradesData, attendanceData] = await Promise.all([
        supabase
          .from('grades')
          .select('percentage, created_at, school_id')
          .not('percentage', 'is', null)
          .eq('status', 'released'),
        
        supabase
          .from('attendance')
          .select('status, date, school_id')
          .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      ]);

      if (gradesData.error) throw gradesData.error;
      if (attendanceData.error) throw attendanceData.error;

      const performanceData = this.processPerformanceData({
        grades: gradesData.data || [],
        attendance: attendanceData.data || []
      });

      console.log('✅ AdminAnalyticsService: Performance insights processed');
      return performanceData;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getPerformanceInsights error:', error);
      throw error;
    }
  }

  // Helper methods for data processing
  private static processMonthlyGrowthData(data: { 
    students: GrowthDataItem[], 
    teachers: GrowthDataItem[], 
    schools: GrowthDataItem[] 
  }) {
    const monthlyData = new Map();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData.set(monthKey, { month: monthKey, students: 0, teachers: 0, schools: 0 });
    }

    // Process each data type
    ['students', 'teachers', 'schools'].forEach(type => {
      data[type as keyof typeof data].forEach(item => {
        if (item.created_at) {
          const month = new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          if (monthlyData.has(month)) {
            monthlyData.get(month)[type]++;
          }
        }
      });
    });

    return Array.from(monthlyData.values());
  }

  private static processUsageTrends(data: UsageDataItem[]) {
    const dailyUsage = new Map();
    
    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyUsage.set(dateKey, { 
        date: dateKey, 
        total: 0,
        admin: 0, 
        teacher: 0, 
        principal: 0, 
        parent: 0,
        finance_officer: 0,
        school_owner: 0
      });
    }

    data.forEach(user => {
      if (user.last_login_at) {
        const loginDate = user.last_login_at.split('T')[0];
        if (dailyUsage.has(loginDate)) {
          const dayData = dailyUsage.get(loginDate);
          dayData.total++;
          if (dayData[user.role as keyof typeof dayData] !== undefined) {
            (dayData[user.role as keyof typeof dayData] as number)++;
          }
        }
      }
    });

    return Array.from(dailyUsage.values());
  }

  private static processRevenueData(data: { 
    billing: BillingRecord[], 
    transactions: TransactionRecord[] 
  }) {
    const monthlyRevenue = new Map();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyRevenue.set(monthKey, {
        month: monthKey,
        billing: 0,
        payments: 0,
        total: 0
      });
    }

    // Process billing data
    data.billing.forEach(record => {
      if (record.created_at && record.amount) {
        const month = new Date(record.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (monthlyRevenue.has(month)) {
          monthlyRevenue.get(month).billing += parseFloat(String(record.amount));
        }
      }
    });

    // Process transaction data
    data.transactions.forEach(transaction => {
      if (transaction.processed_at && transaction.amount) {
        const month = new Date(transaction.processed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (monthlyRevenue.has(month)) {
          monthlyRevenue.get(month).payments += parseFloat(String(transaction.amount));
        }
      }
    });

    // Calculate totals
    Array.from(monthlyRevenue.values()).forEach(monthData => {
      monthData.total = monthData.billing + monthData.payments;
    });

    return Array.from(monthlyRevenue.values());
  }

  private static processPerformanceData(data: { 
    grades: GradeRecord[], 
    attendance: AttendanceRecord[] 
  }) {
    // Calculate network-wide averages
    const totalGrades = data.grades.length;
    const averageGrade = totalGrades > 0 
      ? data.grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / totalGrades 
      : 0;

    const totalAttendance = data.attendance.length;
    const presentCount = data.attendance.filter(record => record.status === 'present').length;
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // Monthly performance trends
    const monthlyPerformance = new Map();
    
    // Initialize last 3 months
    for (let i = 2; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyPerformance.set(monthKey, {
        month: monthKey,
        avgGrade: 0,
        attendanceRate: 0,
        gradeCount: 0,
        attendanceCount: 0,
        presentCount: 0
      });
    }

    // Process grades by month
    data.grades.forEach(grade => {
      if (grade.created_at && grade.percentage) {
        const month = new Date(grade.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (monthlyPerformance.has(month)) {
          const monthData = monthlyPerformance.get(month);
          monthData.avgGrade += grade.percentage;
          monthData.gradeCount++;
        }
      }
    });

    // Process attendance by month
    data.attendance.forEach(record => {
      if (record.date) {
        const month = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (monthlyPerformance.has(month)) {
          const monthData = monthlyPerformance.get(month);
          monthData.attendanceCount++;
          if (record.status === 'present') {
            monthData.presentCount++;
          }
        }
      }
    });

    // Calculate averages
    Array.from(monthlyPerformance.values()).forEach(monthData => {
      monthData.avgGrade = monthData.gradeCount > 0 ? monthData.avgGrade / monthData.gradeCount : 0;
      monthData.attendanceRate = monthData.attendanceCount > 0 ? (monthData.presentCount / monthData.attendanceCount) * 100 : 0;
    });

    return {
      summary: {
        averageGrade,
        attendanceRate,
        totalGrades,
        totalAttendance
      },
      trends: Array.from(monthlyPerformance.values())
    };
  }
}
