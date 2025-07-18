import { supabase } from '@/integrations/supabase/client';
import {
  AcademicTrip,
  TripRegistration,
  TripRegistrationWithDetails,
  FeatureFlag,
  SystemHealthLog,
  SystemHealthStatus,
  DetailedAuditLog,
  OnboardingChecklist,
  OnboardingChecklistWithSchool,
  InternalAnnouncement,
  ApiRateLimit,
  ApiUsageMetrics,
  FinancialForecast,
  FinancialMetrics,
  DepartmentBudget,
  BudgetMetrics,
  SchoolHealthMetrics,
  DatabaseQueryPerformance,
  CreateAcademicTripForm,
  UpdateAcademicTripForm,
  CreateFeatureFlagForm,
  CreateInternalAnnouncementForm,
  CreateFinancialForecastForm,
  CreateDepartmentBudgetForm,
  AcademicTripFilter,
  TripRegistrationFilter,
  SystemHealthFilter,
  BudgetFilter,
  AuditLogFilter,
  ApiResponse,
  PaginatedResponse
} from '@/types/advanced-features';

// Academic Trips Service
export class AcademicTripsService {
  static async getTrips(filter?: AcademicTripFilter): Promise<ApiResponse<AcademicTrip[]>> {
    try {
      let query = supabase
        .from('academic_trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.is_active !== undefined) {
        query = query.eq('is_active', filter.is_active);
      }
      if (filter?.destination) {
        query = query.ilike('destination', `%${filter.destination}%`);
      }
      if (filter?.target_age_group) {
        query = query.eq('target_age_group', filter.target_age_group);
      }
      if (filter?.date_from) {
        query = query.gte('start_date', filter.date_from);
      }
      if (filter?.date_to) {
        query = query.lte('end_date', filter.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching academic trips:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getTripById(id: number): Promise<ApiResponse<AcademicTrip | null>> {
    try {
      const { data, error } = await supabase
        .from('academic_trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching academic trip:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createTrip(tripData: CreateAcademicTripForm): Promise<ApiResponse<AcademicTrip>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('academic_trips')
        .insert({
          ...tripData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error creating academic trip:', error);
      return {
        data: {} as AcademicTrip,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateTrip(id: number, tripData: UpdateAcademicTripForm): Promise<ApiResponse<AcademicTrip>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('academic_trips')
        .update({
          ...tripData,
          updated_by: user.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error updating academic trip:', error);
      return {
        data: {} as AcademicTrip,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async deleteTrip(id: number): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academic_trips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: true,
        success: true
      };
    } catch (error) {
      console.error('Error deleting academic trip:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getTripRegistrations(filter?: TripRegistrationFilter): Promise<ApiResponse<TripRegistrationWithDetails[]>> {
    try {
      let query = supabase
        .from('trip_registrations')
        .select(`
          *,
          trip:academic_trips(*),
          student:students(user_id, name, email),
          school:schools(id, name)
        `)
        .order('registration_date', { ascending: false });

      if (filter?.trip_id) {
        query = query.eq('trip_id', filter.trip_id);
      }
      if (filter?.school_id) {
        query = query.eq('school_id', filter.school_id);
      }
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      if (filter?.date_from) {
        query = query.gte('registration_date', filter.date_from);
      }
      if (filter?.date_to) {
        query = query.lte('registration_date', filter.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching trip registrations:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Feature Flags Service
export class FeatureFlagsService {
  static async getFeatureFlags(): Promise<ApiResponse<FeatureFlag[]>> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createFeatureFlag(flagData: CreateFeatureFlagForm): Promise<ApiResponse<FeatureFlag>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feature_flags')
        .insert({
          ...flagData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error creating feature flag:', error);
      return {
        data: {} as FeatureFlag,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateFeatureFlag(id: number, isEnabled: boolean): Promise<ApiResponse<FeatureFlag>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feature_flags')
        .update({
          is_enabled: isEnabled,
          updated_by: user.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error updating feature flag:', error);
      return {
        data: {} as FeatureFlag,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// System Health Service
export class SystemHealthService {
  static async getSystemHealthStatus(): Promise<ApiResponse<SystemHealthStatus[]>> {
    try {
      const { data, error } = await supabase
        .from('system_health_logs')
        .select('*')
        .order('checked_at', { ascending: false });

      if (error) throw error;

      // Process the data to get current status for each service
      const serviceStatus = new Map<string, SystemHealthStatus>();
      
      data?.forEach(log => {
        if (!serviceStatus.has(log.service_name)) {
          serviceStatus.set(log.service_name, {
            service_name: log.service_name,
            current_status: log.status,
            uptime_percentage: 0,
            last_check: log.checked_at,
            average_response_time: 0
          });
        }
      });

      return {
        data: Array.from(serviceStatus.values()),
        success: true
      };
    } catch (error) {
      console.error('Error fetching system health:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async logSystemHealth(serviceName: string, status: 'healthy' | 'degraded' | 'down', responseTime?: number, errorMessage?: string): Promise<ApiResponse<SystemHealthLog>> {
    try {
      const { data, error } = await supabase
        .from('system_health_logs')
        .insert({
          service_name: serviceName,
          status,
          response_time_ms: responseTime,
          error_message: errorMessage
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error logging system health:', error);
      return {
        data: {} as SystemHealthLog,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Audit Logs Service
export class AuditLogsService {
  static async getAuditLogs(filter?: AuditLogFilter): Promise<ApiResponse<DetailedAuditLog[]>> {
    try {
      let query = supabase
        .from('detailed_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.action_type) {
        query = query.eq('action_type', filter.action_type);
      }
      if (filter?.user_id) {
        query = query.eq('user_id', filter.user_id);
      }
      if (filter?.target_school_id) {
        query = query.eq('target_school_id', filter.target_school_id);
      }
      if (filter?.date_from) {
        query = query.gte('created_at', filter.date_from);
      }
      if (filter?.date_to) {
        query = query.lte('created_at', filter.date_to);
      }
      if (filter?.limit) {
        query = query.limit(filter.limit);
      }
      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async logAuditAction(actionType: string, actionDescription: string, targetUserId?: string, targetSchoolId?: string, metadata?: Record<string, unknown>): Promise<ApiResponse<DetailedAuditLog>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('detailed_audit_logs')
        .insert({
          user_id: user.id,
          action_type: actionType,
          action_description: actionDescription,
          target_user_id: targetUserId,
          target_school_id: targetSchoolId,
          metadata,
          ip_address: '127.0.0.1', // In production, get from request
          user_agent: 'Admin Dashboard' // In production, get from request
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error logging audit action:', error);
      return {
        data: {} as DetailedAuditLog,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Onboarding Checklists Service
export class OnboardingChecklistsService {
  static async getOnboardingChecklists(): Promise<ApiResponse<OnboardingChecklistWithSchool[]>> {
    try {
      const { data, error } = await supabase
        .from('onboarding_checklists')
        .select(`
          *,
          school:schools(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching onboarding checklists:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createOnboardingChecklist(schoolId: string, checklistName: string): Promise<ApiResponse<OnboardingChecklist>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('onboarding_checklists')
        .insert({
          school_id: schoolId,
          checklist_name: checklistName,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error creating onboarding checklist:', error);
      return {
        data: {} as OnboardingChecklist,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async completeOnboardingChecklist(id: number, notes?: string): Promise<ApiResponse<OnboardingChecklist>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('onboarding_checklists')
        .update({
          is_completed: true,
          completed_by: user.id,
          completed_at: new Date().toISOString(),
          notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error completing onboarding checklist:', error);
      return {
        data: {} as OnboardingChecklist,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Internal Announcements Service
export class InternalAnnouncementsService {
  static async getAnnouncements(): Promise<ApiResponse<InternalAnnouncement[]>> {
    try {
      const { data, error } = await supabase
        .from('internal_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createAnnouncement(announcementData: CreateInternalAnnouncementForm): Promise<ApiResponse<InternalAnnouncement>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('internal_announcements')
        .insert({
          ...announcementData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error creating announcement:', error);
      return {
        data: {} as InternalAnnouncement,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// API Rate Limits Service
export class ApiRateLimitsService {
  static async getApiUsageMetrics(): Promise<ApiResponse<ApiUsageMetrics[]>> {
    try {
      const { data, error } = await supabase
        .from('api_rate_limits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to get metrics for each endpoint
      const endpointMetrics = new Map<string, ApiUsageMetrics>();
      
      data?.forEach(limit => {
        if (!endpointMetrics.has(limit.endpoint)) {
          endpointMetrics.set(limit.endpoint, {
            endpoint: limit.endpoint,
            total_requests: limit.request_count,
            average_response_time: 0, // Would need additional data
            error_rate: 0, // Would need additional data
            peak_usage_time: limit.created_at
          });
        }
      });

      return {
        data: Array.from(endpointMetrics.values()),
        success: true
      };
    } catch (error) {
      console.error('Error fetching API usage metrics:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Financial Forecasting Service
export class FinancialForecastingService {
  static async getFinancialForecasts(): Promise<ApiResponse<FinancialForecast[]>> {
    try {
      const { data, error } = await supabase
        .from('financial_forecasts')
        .select('*')
        .order('forecast_date', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching financial forecasts:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createFinancialForecast(forecastData: CreateFinancialForecastForm): Promise<ApiResponse<FinancialForecast>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_forecasts')
        .insert({
          ...forecastData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error creating financial forecast:', error);
      return {
        data: {} as FinancialForecast,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getFinancialMetrics(): Promise<ApiResponse<FinancialMetrics>> {
    try {
      // Get the latest forecast
      const { data: forecasts, error } = await supabase
        .from('financial_forecasts')
        .select('*')
        .order('forecast_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      const latestForecast = forecasts?.[0];
      if (!latestForecast) {
        return {
          data: {
            current_mrr: 0,
            growth_rate: 0,
            churn_rate: 0,
            projected_revenue_3_months: 0,
            projected_revenue_6_months: 0,
            projected_revenue_12_months: 0
          },
          success: true
        };
      }

      // Calculate projected revenue for different periods
      const projectedRevenue3Months = latestForecast.projected_revenue * Math.pow(1 + latestForecast.growth_rate / 100, 3);
      const projectedRevenue6Months = latestForecast.projected_revenue * Math.pow(1 + latestForecast.growth_rate / 100, 6);
      const projectedRevenue12Months = latestForecast.projected_revenue * Math.pow(1 + latestForecast.growth_rate / 100, 12);

      return {
        data: {
          current_mrr: latestForecast.mrr,
          growth_rate: latestForecast.growth_rate,
          churn_rate: latestForecast.churn_rate,
          projected_revenue_3_months: projectedRevenue3Months,
          projected_revenue_6_months: projectedRevenue6Months,
          projected_revenue_12_months: projectedRevenue12Months
        },
        success: true
      };
    } catch (error) {
      console.error('Error fetching financial metrics:', error);
      return {
        data: {} as FinancialMetrics,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Department Budgets Service
export class DepartmentBudgetsService {
  static async getDepartmentBudgets(filter?: BudgetFilter): Promise<ApiResponse<DepartmentBudget[]>> {
    try {
      let query = supabase
        .from('department_budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.department_name) {
        query = query.eq('department_name', filter.department_name);
      }
      if (filter?.budget_period) {
        query = query.eq('budget_period', filter.budget_period);
      }
      if (filter?.period_start) {
        query = query.gte('period_start', filter.period_start);
      }
      if (filter?.period_end) {
        query = query.lte('period_end', filter.period_end);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching department budgets:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createDepartmentBudget(budgetData: CreateDepartmentBudgetForm): Promise<ApiResponse<DepartmentBudget>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('department_budgets')
        .insert({
          ...budgetData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error creating department budget:', error);
      return {
        data: {} as DepartmentBudget,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateDepartmentBudget(id: number, spentAmount: number): Promise<ApiResponse<DepartmentBudget>> {
    try {
      const { data, error } = await supabase
        .from('department_budgets')
        .update({
          spent_amount: spentAmount
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error updating department budget:', error);
      return {
        data: {} as DepartmentBudget,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getBudgetMetrics(): Promise<ApiResponse<BudgetMetrics[]>> {
    try {
      const { data: budgets, error } = await supabase
        .from('department_budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const budgetMetrics: BudgetMetrics[] = (budgets || []).map(budget => ({
        department_name: budget.department_name,
        allocated_budget: budget.allocated_budget,
        spent_amount: budget.spent_amount,
        remaining_budget: budget.allocated_budget - budget.spent_amount,
        utilization_percentage: (budget.spent_amount / budget.allocated_budget) * 100,
        period_start: budget.period_start,
        period_end: budget.period_end
      }));

      return {
        data: budgetMetrics,
        success: true
      };
    } catch (error) {
      console.error('Error fetching budget metrics:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// School Health Service
export class SchoolHealthService {
  static async getSchoolHealthMetrics(): Promise<ApiResponse<SchoolHealthMetrics[]>> {
    try {
      // This would typically involve complex queries to calculate health scores
      // For now, we'll return a simplified version
      const { data: schools, error } = await supabase
        .from('schools')
        .select('id, name, email, created_at');

      if (error) throw error;

      const healthMetrics: SchoolHealthMetrics[] = (schools || []).map(school => ({
        school_id: school.id,
        school_name: school.name,
        health_score: Math.floor(Math.random() * 100), // In production, calculate based on actual metrics
        health_status: 'green' as const, // In production, determine based on health_score
        active_users_count: Math.floor(Math.random() * 100),
        support_tickets_count: Math.floor(Math.random() * 10),
        last_activity_date: new Date().toISOString(),
        product_usage_score: Math.floor(Math.random() * 100),
        support_satisfaction_score: Math.floor(Math.random() * 100)
      }));

      return {
        data: healthMetrics,
        success: true
      };
    } catch (error) {
      console.error('Error fetching school health metrics:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Database Query Performance Service
export class DatabaseQueryPerformanceService {
  static async getSlowestQueries(): Promise<ApiResponse<DatabaseQueryPerformance[]>> {
    try {
      // This would typically query PostgreSQL's pg_stat_statements
      // For now, we'll return mock data
      const mockQueries: DatabaseQueryPerformance[] = [
        {
          query_hash: 'abc123',
          query_text: 'SELECT * FROM students WHERE school_id = $1',
          execution_count: 1500,
          total_execution_time: 45000,
          average_execution_time: 30,
          slowest_execution_time: 250,
          last_executed: new Date().toISOString()
        },
        {
          query_hash: 'def456',
          query_text: 'SELECT * FROM academic_trips WHERE is_active = true',
          execution_count: 800,
          total_execution_time: 24000,
          average_execution_time: 30,
          slowest_execution_time: 180,
          last_executed: new Date().toISOString()
        }
      ];

      return {
        data: mockQueries,
        success: true
      };
    } catch (error) {
      console.error('Error fetching slowest queries:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 