
import { supabase } from '@/integrations/supabase/client';

interface MultiTenantAnalyticsConfig {
  enforceStrictTenancy: boolean;
  allowCrossTenantQueries: boolean;
  auditAccess: boolean;
}

export class MultiTenantAnalyticsService {
  private static instance: MultiTenantAnalyticsService;
  private config: MultiTenantAnalyticsConfig = {
    enforceStrictTenancy: true,
    allowCrossTenantQueries: false,
    auditAccess: true
  };

  static getInstance(): MultiTenantAnalyticsService {
    if (!MultiTenantAnalyticsService.instance) {
      MultiTenantAnalyticsService.instance = new MultiTenantAnalyticsService();
    }
    return MultiTenantAnalyticsService.instance;
  }

  private constructor() {}

  async validateSchoolAccess(requestedSchoolId: string, userSchoolId?: string, userRole?: string): Promise<boolean> {
    // System admins can access any school
    if (userRole === 'elimisha_admin' || userRole === 'edufam_admin') {
      if (this.config.auditAccess) {
        await this.auditAccess('system_admin_access', requestedSchoolId, userRole);
      }
      return true;
    }

    // School users can only access their own school
    if (userSchoolId && userSchoolId === requestedSchoolId) {
      if (this.config.auditAccess) {
        await this.auditAccess('school_user_access', requestedSchoolId, userRole);
      }
      return true;
    }

    // Access denied
    if (this.config.auditAccess) {
      await this.auditAccess('access_denied', requestedSchoolId, userRole, 'School access violation');
    }
    
    return false;
  }

  private async auditAccess(
    accessType: string, 
    schoolId: string, 
    userRole?: string, 
    details?: string
  ): Promise<void> {
    try {
      await (supabase as any)
        .from('analytics_events')
        .insert({
          event_type: 'analytics_access',
          event_category: 'security',
          school_id: schoolId,
          metadata: {
            access_type: accessType,
            user_role: userRole,
            details,
            timestamp: new Date().toISOString(),
            client_info: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Failed to audit analytics access:', error);
    }
  }

  async getSchoolAnalytics(
    schoolId: string,
    userSchoolId?: string,
    userRole?: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      categories?: string[];
    }
  ) {
    // Validate access
    const hasAccess = await this.validateSchoolAccess(schoolId, userSchoolId, userRole);
    if (!hasAccess) {
      throw new Error('Insufficient permissions to access school analytics');
    }

    try {
      let query = (supabase as any)
        .from('analytics_events')
        .select('*')
        .eq('school_id', schoolId);

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('event_category', filters.categories);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      return this.processAnalyticsData(data || []);
    } catch (error) {
      console.error('Failed to fetch school analytics:', error);
      throw error;
    }
  }

  private processAnalyticsData(events: any[]) {
    const summary = {
      totalEvents: events.length,
      categoryBreakdown: {} as Record<string, number>,
      hourlyDistribution: {} as Record<string, number>,
      userActivity: {} as Record<string, number>,
      trends: {
        grades: this.calculateTrend(events, 'grades'),
        attendance: this.calculateTrend(events, 'attendance'),
        finance: this.calculateTrend(events, 'finance'),
        user_activity: this.calculateTrend(events, 'user_activity')
      }
    };

    events.forEach(event => {
      // Category breakdown
      summary.categoryBreakdown[event.event_category] = 
        (summary.categoryBreakdown[event.event_category] || 0) + 1;

      // Hourly distribution
      const hour = new Date(event.timestamp).getHours();
      summary.hourlyDistribution[hour] = (summary.hourlyDistribution[hour] || 0) + 1;

      // User activity
      if (event.user_id) {
        summary.userActivity[event.user_id] = (summary.userActivity[event.user_id] || 0) + 1;
      }
    });

    return summary;
  }

  private calculateTrend(events: any[], category: string): { change: number; direction: 'up' | 'down' | 'stable' } {
    const categoryEvents = events.filter(e => e.event_category === category);
    
    if (categoryEvents.length < 2) {
      return { change: 0, direction: 'stable' };
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const recentCount = categoryEvents.filter(e => new Date(e.timestamp) >= yesterday).length;
    const previousCount = categoryEvents.filter(e => 
      new Date(e.timestamp) >= twoDaysAgo && new Date(e.timestamp) < yesterday
    ).length;

    if (previousCount === 0) {
      return { change: recentCount > 0 ? 100 : 0, direction: recentCount > 0 ? 'up' : 'stable' };
    }

    const change = ((recentCount - previousCount) / previousCount) * 100;
    const direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

    return { change: Math.abs(change), direction };
  }

  async getSystemWidePulse(userRole?: string) {
    // Only system admins can access system-wide data
    if (userRole !== 'elimisha_admin' && userRole !== 'edufam_admin') {
      throw new Error('Insufficient permissions for system-wide analytics');
    }

    try {
      const { data: events, error } = await (supabase as any)
        .from('analytics_events')
        .select('event_category, school_id, timestamp')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const schoolMetrics = new Map();
      
      (events || []).forEach((event: any) => {
        if (!schoolMetrics.has(event.school_id)) {
          schoolMetrics.set(event.school_id, {
            totalEvents: 0,
            grades: 0,
            attendance: 0,
            finance: 0,
            user_activity: 0
          });
        }
        
        const metrics = schoolMetrics.get(event.school_id);
        metrics.totalEvents++;
        metrics[event.event_category] = (metrics[event.event_category] || 0) + 1;
      });

      return {
        totalSchools: schoolMetrics.size,
        totalEvents: events?.length || 0,
        schoolMetrics: Object.fromEntries(schoolMetrics),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch system-wide analytics:', error);
      throw error;
    }
  }
}

export const multiTenantAnalyticsService = MultiTenantAnalyticsService.getInstance();
