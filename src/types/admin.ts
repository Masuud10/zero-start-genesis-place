export type AdminRole = 'super_admin' | 'software_engineer' | 'support_hr' | 'sales_marketing' | 'finance';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: AdminRole;
  app_type: 'admin';
  permissions: Record<string, boolean>;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id?: string;
  action: string;
  resource?: string;
  resource_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
}

export interface AdminPermissions {
  // User Management
  manage_admin_users: boolean;
  view_admin_users: boolean;
  
  // School Management
  manage_schools: boolean;
  view_schools: boolean;
  
  // Analytics & Reports
  view_system_analytics: boolean;
  view_school_analytics: boolean;
  export_reports: boolean;
  
  // Technical
  view_logs: boolean;
  manage_database: boolean;
  manage_deployments: boolean;
  view_api_usage: boolean;
  
  // Support & HR
  manage_support_tickets: boolean;
  view_support_tickets: boolean;
  manage_hr_records: boolean;
  view_hr_records: boolean;
  
  // Sales & Marketing
  manage_marketing_campaigns: boolean;
  view_marketing_analytics: boolean;
  manage_events: boolean;
  send_notifications: boolean;
  
  // Finance
  manage_billing: boolean;
  view_billing: boolean;
  export_financial_reports: boolean;
  
  // System Settings
  manage_global_settings: boolean;
  view_audit_logs: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, Partial<AdminPermissions>> = {
  super_admin: {
    // Full access to everything
    manage_admin_users: true,
    view_admin_users: true,
    manage_schools: true,
    view_schools: true,
    view_system_analytics: true,
    view_school_analytics: true,
    export_reports: true,
    view_logs: true,
    manage_database: true,
    manage_deployments: true,
    view_api_usage: true,
    manage_support_tickets: true,
    view_support_tickets: true,
    manage_hr_records: true,
    view_hr_records: true,
    manage_marketing_campaigns: true,
    view_marketing_analytics: true,
    manage_events: true,
    send_notifications: true,
    manage_billing: true,
    view_billing: true,
    export_financial_reports: true,
    manage_global_settings: true,
    view_audit_logs: true,
  },
  software_engineer: {
    // Technical modules only
    view_logs: true,
    manage_database: true,
    manage_deployments: true,
    view_api_usage: true,
    view_system_analytics: true,
    export_reports: true,
  },
  support_hr: {
    // CRM, tickets, HR modules
    manage_support_tickets: true,
    view_support_tickets: true,
    manage_hr_records: true,
    view_hr_records: true,
    view_school_analytics: true,
    view_schools: true,
  },
  sales_marketing: {
    // Sales, marketing, events
    manage_marketing_campaigns: true,
    view_marketing_analytics: true,
    manage_events: true,
    send_notifications: true,
    view_school_analytics: true,
    view_schools: true,
  },
  finance: {
    // Finance and billing only
    manage_billing: true,
    view_billing: true,
    export_financial_reports: true,
    view_schools: true,
  },
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  software_engineer: 'Software Engineer',
  support_hr: 'Support & HR Analyst',
  sales_marketing: 'Sales & Marketing Associate',
  finance: 'Finance Officer',
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: 'Full access to everything in the Admin Application. Can manage other admin users and override any role.',
  software_engineer: 'Access to all technical modules including logs, database, deployments, and API usage analytics.',
  support_hr: 'Access to CRM, support tickets, school feedback, and internal HR modules.',
  sales_marketing: 'Access to sales, marketing dashboard, leads, academic trips, and event modules.',
  finance: 'Access to all finance and billing tools only. Can manage subscriptions and generate financial reports.',
};