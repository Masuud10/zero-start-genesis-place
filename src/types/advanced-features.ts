// Advanced Features TypeScript Types
// Date: 2025-07-19

// Academic Trips Types
export interface AcademicTrip {
  id: number;
  trip_name: string;
  destination: string;
  start_date: string;
  end_date: string;
  price_per_student: number;
  capacity: number;
  target_age_group?: string;
  itinerary_details?: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface TripRegistration {
  id: number;
  trip_id: number;
  student_id: string;
  school_id: string;
  registration_date: string;
  status: 'registered' | 'paid' | 'cancelled';
  payment_amount?: number;
  payment_date?: string;
  notes?: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
}

export interface TripRegistrationWithDetails extends TripRegistration {
  trip: AcademicTrip;
  student: {
    id: string;
    name: string;
    email: string;
  };
  school: {
    id: string;
    name: string;
  };
}

// Feature Flags Types
export interface FeatureFlag {
  id: number;
  flag_name: string;
  flag_description?: string;
  is_enabled: boolean;
  target_scope: 'global' | 'school_specific' | 'user_specific';
  target_schools?: string[];
  target_users?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// System Health Types
export interface SystemHealthLog {
  id: number;
  service_name: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms?: number;
  error_message?: string;
  checked_at: string;
}

export interface SystemHealthStatus {
  service_name: string;
  current_status: 'healthy' | 'degraded' | 'down';
  uptime_percentage: number;
  last_check: string;
  average_response_time: number;
}

// Detailed Audit Logs Types
export interface DetailedAuditLog {
  id: number;
  user_id?: string;
  action_type: string;
  action_description: string;
  target_user_id?: string;
  target_school_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogFilter {
  action_type?: string;
  user_id?: string;
  target_school_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Onboarding Checklists Types
export interface OnboardingChecklist {
  id: number;
  school_id: string;
  checklist_name: string;
  is_completed: boolean;
  completed_by?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingChecklistWithSchool extends OnboardingChecklist {
  school: {
    id: string;
    name: string;
    email: string;
  };
}

// Internal Announcements Types
export interface InternalAnnouncement {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// API Rate Limit Types
export interface ApiRateLimit {
  id: number;
  endpoint: string;
  user_id?: string;
  school_id?: string;
  request_count: number;
  limit_count: number;
  window_start: string;
  window_end: string;
  created_at: string;
  updated_at: string;
}

export interface ApiUsageMetrics {
  endpoint: string;
  total_requests: number;
  average_response_time: number;
  error_rate: number;
  peak_usage_time: string;
}

// Financial Forecasting Types
export interface FinancialForecast {
  id: number;
  forecast_date: string;
  mrr: number;
  growth_rate: number;
  churn_rate: number;
  projected_revenue: number;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface FinancialMetrics {
  current_mrr: number;
  growth_rate: number;
  churn_rate: number;
  projected_revenue_3_months: number;
  projected_revenue_6_months: number;
  projected_revenue_12_months: number;
}

// Department Budgets Types
export interface DepartmentBudget {
  id: number;
  department_name: string;
  budget_period: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  allocated_budget: number;
  spent_amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetMetrics {
  department_name: string;
  allocated_budget: number;
  spent_amount: number;
  remaining_budget: number;
  utilization_percentage: number;
  period_start: string;
  period_end: string;
}

// School Health Score Types
export interface SchoolHealthMetrics {
  school_id: string;
  school_name: string;
  health_score: number; // 0-100
  health_status: 'green' | 'yellow' | 'red';
  active_users_count: number;
  support_tickets_count: number;
  last_activity_date: string;
  product_usage_score: number;
  support_satisfaction_score: number;
}

// Database Query Performance Types
export interface DatabaseQueryPerformance {
  query_hash: string;
  query_text: string;
  execution_count: number;
  total_execution_time: number;
  average_execution_time: number;
  slowest_execution_time: number;
  last_executed: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Form Types
export interface CreateAcademicTripForm {
  trip_name: string;
  destination: string;
  start_date: string;
  end_date: string;
  price_per_student: number;
  capacity: number;
  target_age_group?: string;
  itinerary_details?: Record<string, string>;
}

export interface UpdateAcademicTripForm extends Partial<CreateAcademicTripForm> {
  is_active?: boolean;
}

export interface CreateFeatureFlagForm {
  flag_name: string;
  flag_description?: string;
  is_enabled: boolean;
  target_scope: 'global' | 'school_specific' | 'user_specific';
  target_schools?: string[];
  target_users?: string[];
}

export interface CreateInternalAnnouncementForm {
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface CreateFinancialForecastForm {
  forecast_date: string;
  mrr: number;
  growth_rate: number;
  churn_rate: number;
  projected_revenue: number;
  notes?: string;
}

export interface CreateDepartmentBudgetForm {
  department_name: string;
  budget_period: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  allocated_budget: number;
  notes?: string;
}

// Filter Types
export interface AcademicTripFilter {
  is_active?: boolean;
  destination?: string;
  target_age_group?: string;
  date_from?: string;
  date_to?: string;
}

export interface TripRegistrationFilter {
  trip_id?: number;
  school_id?: string;
  status?: 'registered' | 'paid' | 'cancelled';
  date_from?: string;
  date_to?: string;
}

export interface SystemHealthFilter {
  service_name?: string;
  status?: 'healthy' | 'degraded' | 'down';
  date_from?: string;
  date_to?: string;
}

export interface BudgetFilter {
  department_name?: string;
  budget_period?: 'monthly' | 'quarterly' | 'yearly';
  period_start?: string;
  period_end?: string;
} 