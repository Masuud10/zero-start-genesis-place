
import { supabase } from '@/integrations/supabase/client';

export class AdminAnalyticsService {
  static async getUserGrowthData() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching user growth data...');
      
      const { data, error } = await supabase
        .from('user_profiles')
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
      
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          students:user_profiles!school_id(count)
        `)
        .limit(10);

      if (error) {
        console.error('❌ AdminAnalyticsService: Enrollment fetch error:', error);
        throw new Error(`Failed to fetch enrollment data: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('📊 AdminAnalyticsService: No enrollment data available');
        return [];
      }

      const result = data
        .map(school => ({
          school: school.name || 'Unknown School',
          students: school.students?.[0]?.count || 0
        }))
        .sort((a, b) => b.students - a.students)
        .slice(0, 10);

      console.log('✅ AdminAnalyticsService: Enrollment data processed:', result.length);
      return result;

    } catch (error) {
      console.error('❌ AdminAnalyticsService: getEnrollmentBySchoolData error:', error);
      throw error;
    }
  }

  static async getUserRoleDistributionData() {
    try {
      console.log('📊 AdminAnalyticsService: Fetching user role distribution...');
      
      const { data, error } = await supabase
        .from('user_profiles')
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
      
      const { data, error } = await supabase
        .from('schools')
        .select('curriculum_type');

      if (error) {
        console.error('❌ AdminAnalyticsService: Curriculum distribution fetch error:', error);
        throw new Error(`Failed to fetch curriculum data: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('📊 AdminAnalyticsService: No curriculum data available');
        return [];
      }

      const curriculumCount = data.reduce((acc: Record<string, number>, school) => {
        const curriculum = school.curriculum_type || 'Standard';
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
}
