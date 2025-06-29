
import { supabase } from '@/integrations/supabase/client';

export interface SystemAnalyticsData {
  userLogins: Array<{
    date: string;
    admin: number;
    teacher: number;
    principal: number;
    parent: number;
    finance_officer: number;
    school_owner: number;
  }>;
  performanceTrends: Array<{
    month: string;
    average_grade: number;
    total_grades: number;
  }>;
  schoolsOnboarded: Array<{
    month: string;
    count: number;
  }>;
  userDistribution: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  curriculumTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  financeSummary: {
    total_subscriptions: number;
    setup_fees: number;
    monthly_revenue: number;
  };
}

export class SystemAnalyticsService {
  static async getComprehensiveAnalytics(): Promise<SystemAnalyticsData> {
    try {
      console.log('🔄 SystemAnalyticsService: Fetching comprehensive analytics...');

      // Fetch user login data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: loginData, error: loginError } = await supabase
        .from('profiles')
        .select('role, last_login_at')
        .gte('last_login_at', thirtyDaysAgo.toISOString());

      if (loginError) {
        console.error('❌ Error fetching login data:', loginError);
        throw loginError;
      }

      // Process user login data by date and role
      const userLogins = this.processUserLoginData(loginData || []);

      // Fetch performance trends (grades data)
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('score, created_at')
        .order('created_at', { ascending: true });

      if (gradesError) {
        console.error('❌ Error fetching grades data:', gradesError);
      }

      const performanceTrends = this.processPerformanceData(gradesData || []);

      // Fetch schools onboarded data
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (schoolsError) {
        console.error('❌ Error fetching schools data:', schoolsError);
      }

      const schoolsOnboarded = this.processSchoolsData(schoolsData || []);

      // Fetch user distribution
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('role');

      if (usersError) {
        console.error('❌ Error fetching users data:', usersError);
      }

      const userDistribution = this.processUserDistribution(usersData || []);

      // Fetch curriculum types distribution
      const { data: curriculumData, error: curriculumError } = await supabase
        .from('schools')
        .select('curriculum_type');

      if (curriculumError) {
        console.error('❌ Error fetching curriculum data:', curriculumError);
      }

      const curriculumTypes = this.processCurriculumData(curriculumData || []);

      // Fetch financial summary
      const { data: billingData, error: billingError } = await supabase
        .from('school_billing_records')
        .select('amount, billing_type, status');

      if (billingError) {
        console.error('❌ Error fetching billing data:', billingError);
      }

      const financeSummary = this.processFinancialData(billingData || []);

      const result: SystemAnalyticsData = {
        userLogins,
        performanceTrends,
        schoolsOnboarded,
        userDistribution,
        curriculumTypes,
        financeSummary
      };

      console.log('✅ SystemAnalyticsService: Analytics data processed successfully');
      return result;

    } catch (error) {
      console.error('❌ SystemAnalyticsService: Failed to fetch analytics:', error);
      throw error;
    }
  }

  private static processUserLoginData(data: any[]): SystemAnalyticsData['userLogins'] {
    const roleMap = new Map<string, Map<string, number>>();
    
    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      roleMap.set(dateStr, new Map([
        ['admin', 0],
        ['teacher', 0],
        ['principal', 0],
        ['parent', 0],
        ['finance_officer', 0],
        ['school_owner', 0]
      ]));
    }

    // Process actual data
    data.forEach(user => {
      if (user.last_login_at) {
        const loginDate = new Date(user.last_login_at).toISOString().split('T')[0];
        const roleData = roleMap.get(loginDate);
        if (roleData && roleData.has(user.role)) {
          roleData.set(user.role, (roleData.get(user.role) || 0) + 1);
        }
      }
    });

    return Array.from(roleMap.entries()).map(([date, roles]) => ({
      date,
      admin: roles.get('admin') || 0,
      teacher: roles.get('teacher') || 0,
      principal: roles.get('principal') || 0,
      parent: roles.get('parent') || 0,
      finance_officer: roles.get('finance_officer') || 0,
      school_owner: roles.get('school_owner') || 0
    }));
  }

  private static processPerformanceData(data: any[]): SystemAnalyticsData['performanceTrends'] {
    const monthlyData = new Map<string, { total: number; sum: number }>();

    data.forEach(grade => {
      if (grade.score && grade.created_at) {
        const month = new Date(grade.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const current = monthlyData.get(month) || { total: 0, sum: 0 };
        current.total += 1;
        current.sum += parseFloat(grade.score);
        monthlyData.set(month, current);
      }
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      average_grade: data.sum / data.total,
      total_grades: data.total
    }));
  }

  private static processSchoolsData(data: any[]): SystemAnalyticsData['schoolsOnboarded'] {
    const monthlyCount = new Map<string, number>();

    data.forEach(school => {
      if (school.created_at) {
        const month = new Date(school.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyCount.set(month, (monthlyCount.get(month) || 0) + 1);
      }
    });

    return Array.from(monthlyCount.entries()).map(([month, count]) => ({
      month,
      count
    }));
  }

  private static processUserDistribution(data: any[]): SystemAnalyticsData['userDistribution'] {
    const roleCounts = new Map<string, number>();
    const total = data.length;

    data.forEach(user => {
      const role = user.role || 'unknown';
      roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
    });

    return Array.from(roleCounts.entries()).map(([role, count]) => ({
      role: role.replace('_', ' ').toUpperCase(),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  private static processCurriculumData(data: any[]): SystemAnalyticsData['curriculumTypes'] {
    const curriculumCounts = new Map<string, number>();
    const total = data.length;

    data.forEach(school => {
      const curriculum = school.curriculum_type || 'unknown';
      curriculumCounts.set(curriculum, (curriculumCounts.get(curriculum) || 0) + 1);
    });

    return Array.from(curriculumCounts.entries()).map(([type, count]) => ({
      type: type.toUpperCase(),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  private static processFinancialData(data: any[]): SystemAnalyticsData['financeSummary'] {
    let totalSubscriptions = 0;
    let setupFees = 0;
    let monthlyRevenue = 0;

    data.forEach(record => {
      if (record.status === 'paid' && record.amount) {
        const amount = parseFloat(record.amount);
        if (record.billing_type === 'subscription') {
          totalSubscriptions += amount;
        } else if (record.billing_type === 'setup_fee') {
          setupFees += amount;
        }
        
        // Calculate monthly revenue (last 30 days)
        monthlyRevenue += amount;
      }
    });

    return {
      total_subscriptions: totalSubscriptions,
      setup_fees: setupFees,
      monthly_revenue: monthlyRevenue
    };
  }
}
