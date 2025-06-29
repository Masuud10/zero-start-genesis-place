
import { supabase } from '@/integrations/supabase/client';

export interface SystemAnalyticsData {
  userLogins: {
    date: string;
    admin: number;
    teacher: number;
    principal: number;
    parent: number;
    finance_officer: number;
    school_owner: number;
  }[];
  performanceTrends: {
    month: string;
    average_grade: number;
    total_grades: number;
  }[];
  schoolsOnboarded: {
    month: string;
    count: number;
  }[];
  financeSummary: {
    total_subscriptions: number;
    setup_fees: number;
    monthly_revenue: number;
  };
  userDistribution: {
    role: string;
    count: number;
    percentage: number;
  }[];
  curriculumTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  topActiveSchools: {
    school_name: string;
    activity_score: number;
    total_users: number;
  }[];
  gradeApprovalStats: {
    approved: number;
    pending: number;
    rejected: number;
  };
  announcementEngagement: {
    month: string;
    total_announcements: number;
    engagement_rate: number;
  }[];
}

export class SystemAnalyticsService {
  static async getComprehensiveAnalytics(): Promise<SystemAnalyticsData> {
    try {
      console.log('🔄 Fetching comprehensive system analytics...');

      // Fetch user login data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: loginData, error: loginError } = await supabase
        .from('profiles')
        .select('role, last_login_at, created_at')
        .gte('last_login_at', thirtyDaysAgo.toISOString());

      if (loginError) throw loginError;

      // Process daily login data
      const userLogins = this.processDailyLogins(loginData || []);

      // Fetch performance trends for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('percentage, created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .eq('status', 'released')
        .not('percentage', 'is', null);

      if (gradesError) throw gradesError;

      const performanceTrends = this.processPerformanceTrends(gradesData || []);

      // Fetch schools onboarded by month
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('created_at, status')
        .eq('status', 'active')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (schoolsError) throw schoolsError;

      const schoolsOnboarded = this.processSchoolsOnboarded(schoolsData || []);

      // Fetch financial data
      const { data: billingData, error: billingError } = await supabase
        .from('school_billing_records')
        .select('amount, status, billing_type')
        .eq('status', 'paid');

      if (billingError) throw billingError;

      const financeSummary = this.processFinanceSummary(billingData || []);

      // Fetch user distribution
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('role')
        .eq('status', 'active');

      if (usersError) throw usersError;

      const userDistribution = this.processUserDistribution(usersData || []);

      // Fetch curriculum distribution
      const { data: curriculumData, error: curriculumError } = await supabase
        .from('schools')
        .select('curriculum_type')
        .eq('status', 'active');

      if (curriculumError) throw curriculumError;

      const curriculumTypes = this.processCurriculumTypes(curriculumData || []);

      // Fetch top active schools
      const { data: activeSchoolsData, error: activeSchoolsError } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          profiles!school_id(count)
        `)
        .eq('status', 'active')
        .limit(5);

      if (activeSchoolsError) throw activeSchoolsError;

      const topActiveSchools = this.processTopActiveSchools(activeSchoolsData || []);

      // Fetch grade approval stats
      const { data: gradeStatsData, error: gradeStatsError } = await supabase
        .from('grades')
        .select('status')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (gradeStatsError) throw gradeStatsError;

      const gradeApprovalStats = this.processGradeApprovalStats(gradeStatsData || []);

      // Fetch announcement engagement
      const { data: announcementData, error: announcementError } = await supabase
        .from('announcements')
        .select('created_at, read_count, total_recipients')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (announcementError) throw announcementError;

      const announcementEngagement = this.processAnnouncementEngagement(announcementData || []);

      return {
        userLogins,
        performanceTrends,
        schoolsOnboarded,
        financeSummary,
        userDistribution,
        curriculumTypes,
        topActiveSchools,
        gradeApprovalStats,
        announcementEngagement
      };

    } catch (error) {
      console.error('❌ Error fetching system analytics:', error);
      throw error;
    }
  }

  private static processDailyLogins(data: any[]): SystemAnalyticsData['userLogins'] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayLogins = data.filter(user => 
        user.last_login_at && user.last_login_at.startsWith(date)
      );

      return {
        date,
        admin: dayLogins.filter(u => u.role === 'edufam_admin' || u.role === 'elimisha_admin').length,
        teacher: dayLogins.filter(u => u.role === 'teacher').length,
        principal: dayLogins.filter(u => u.role === 'principal').length,
        parent: dayLogins.filter(u => u.role === 'parent').length,
        finance_officer: dayLogins.filter(u => u.role === 'finance_officer').length,
        school_owner: dayLogins.filter(u => u.role === 'school_owner').length
      };
    });
  }

  private static processPerformanceTrends(data: any[]): SystemAnalyticsData['performanceTrends'] {
    const monthlyData = new Map();
    
    data.forEach(grade => {
      const month = new Date(grade.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { total: 0, sum: 0, count: 0 });
      }
      
      const monthStats = monthlyData.get(month);
      monthStats.sum += grade.percentage;
      monthStats.count += 1;
    });

    return Array.from(monthlyData.entries()).map(([month, stats]) => ({
      month,
      average_grade: stats.count > 0 ? stats.sum / stats.count : 0,
      total_grades: stats.count
    }));
  }

  private static processSchoolsOnboarded(data: any[]): SystemAnalyticsData['schoolsOnboarded'] {
    const monthlyCount = new Map();
    
    data.forEach(school => {
      const month = new Date(school.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyCount.set(month, (monthlyCount.get(month) || 0) + 1);
    });

    return Array.from(monthlyCount.entries()).map(([month, count]) => ({
      month,
      count
    }));
  }

  private static processFinanceSummary(data: any[]): SystemAnalyticsData['financeSummary'] {
    const subscriptions = data.filter(record => record.billing_type === 'subscription');
    const setupFees = data.filter(record => record.billing_type === 'setup');
    
    return {
      total_subscriptions: subscriptions.reduce((sum, record) => sum + Number(record.amount), 0),
      setup_fees: setupFees.reduce((sum, record) => sum + Number(record.amount), 0),
      monthly_revenue: data.reduce((sum, record) => sum + Number(record.amount), 0) / 12
    };
  }

  private static processUserDistribution(data: any[]): SystemAnalyticsData['userDistribution'] {
    const roleCounts = new Map();
    const total = data.length;
    
    data.forEach(user => {
      roleCounts.set(user.role, (roleCounts.get(user.role) || 0) + 1);
    });

    return Array.from(roleCounts.entries()).map(([role, count]) => ({
      role: role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  private static processCurriculumTypes(data: any[]): SystemAnalyticsData['curriculumTypes'] {
    const typeCounts = new Map();
    const total = data.length;
    
    data.forEach(school => {
      const type = school.curriculum_type || 'Unknown';
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    return Array.from(typeCounts.entries()).map(([type, count]) => ({
      type: type.toUpperCase(),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  private static processTopActiveSchools(data: any[]): SystemAnalyticsData['topActiveSchools'] {
    return data.map(school => ({
      school_name: school.name,
      activity_score: Math.random() * 100, // This would be calculated based on actual activity metrics
      total_users: Array.isArray(school.profiles) ? school.profiles.length : 0
    }))
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 5);
  }

  private static processGradeApprovalStats(data: any[]): SystemAnalyticsData['gradeApprovalStats'] {
    const stats = {
      approved: data.filter(g => g.status === 'approved' || g.status === 'released').length,
      pending: data.filter(g => g.status === 'submitted' || g.status === 'draft').length,
      rejected: data.filter(g => g.status === 'rejected').length
    };

    return stats;
  }

  private static processAnnouncementEngagement(data: any[]): SystemAnalyticsData['announcementEngagement'] {
    const monthlyEngagement = new Map();
    
    data.forEach(announcement => {
      const month = new Date(announcement.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyEngagement.has(month)) {
        monthlyEngagement.set(month, { total: 0, totalReads: 0, totalRecipients: 0 });
      }
      
      const monthStats = monthlyEngagement.get(month);
      monthStats.total += 1;
      monthStats.totalReads += announcement.read_count || 0;
      monthStats.totalRecipients += announcement.total_recipients || 0;
    });

    return Array.from(monthlyEngagement.entries()).map(([month, stats]) => ({
      month,
      total_announcements: stats.total,
      engagement_rate: stats.totalRecipients > 0 ? (stats.totalReads / stats.totalRecipients) * 100 : 0
    }));
  }
}
