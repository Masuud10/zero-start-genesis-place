import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string;
  table_name: string;
  action: string;
  old_value?: any;
  new_value?: any;
  old_values?: any; // Alias for compatibility
  new_values?: any; // Alias for compatibility
  timestamp: string;
  created_at?: string; // For compatibility
  user_role: string;
  metadata?: any;
  record_id?: string; // For compatibility
  academic_context?: any; // For compatibility
}

export interface AuditFilters {
  userId?: string;
  tableName?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  academicContext?: {
    academic_year_id?: string;
    term_id?: string;
    class_id?: string;
    subject_id?: string;
  };
}

export interface SystemEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata?: any;
  timestamp: string;
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async logAuditEvent(
    action: string,
    target_entity: string,
    old_value?: any,
    new_value?: any,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action,
          target_entity,
          old_value: old_value ? JSON.stringify(old_value) : null,
          new_value: new_value ? JSON.stringify(new_value) : null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          performed_by_role: 'user',
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(
    schoolId: string,
    filters: AuditFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: AuditLog[]; total: number; error?: string }> {
    try {
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get total count
      const { count } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      const transformedLogs: AuditLog[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.performed_by_user_id || '',
        table_name: item.target_entity || '',
        action: item.action,
        old_value: item.old_value,
        new_value: item.new_value,
        old_values: item.old_value, // Alias for compatibility
        new_values: item.new_value, // Alias for compatibility
        timestamp: item.created_at || new Date().toISOString(),
        created_at: item.created_at || new Date().toISOString(),
        user_role: item.performed_by_role || 'unknown',
        metadata: item.metadata,
        record_id: item.id, // For compatibility
        academic_context: item.metadata // For compatibility
      }));

      return {
        logs: transformedLogs,
        total: count || 0
      };
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      return {
        logs: [],
        total: 0,
        error: error.message
      };
    }
  }

  /**
   * Get system events
   */
  static async getSystemEvents(
    filters: { 
      severity?: string; 
      startDate?: string; 
      endDate?: string;
      limit?: number;
    } = {}
  ): Promise<{ events: SystemEvent[]; error?: string }> {
    try {
      // Use audit_logs as system events
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters.limit || 100);

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedEvents: SystemEvent[] = (data || []).map(item => ({
        id: item.id,
        event_type: item.action,
        severity: 'medium' as const,
        message: `${item.action} on ${item.target_entity}`,
        metadata: item.metadata,
        timestamp: item.created_at || new Date().toISOString()
      }));

      return { events: transformedEvents };
    } catch (error: any) {
      console.error('Error fetching system events:', error);
      return {
        events: [],
        error: error.message
      };
    }
  }

  /**
   * Generate audit report
   */
  static async generateAuditReport(
    schoolId: string,
    filters: AuditFilters & { 
      reportType: 'summary' | 'detailed' | 'compliance';
      format: 'json' | 'csv' | 'pdf';
    }
  ): Promise<{ report: any; error?: string }> {
    try {
      const { logs } = await this.getAuditLogs(schoolId, filters, 1, 1000);
      
      const report = {
        title: `Audit Report - ${filters.reportType}`,
        generated_at: new Date().toISOString(),
        school_id: schoolId,
        filters,
        summary: {
          total_events: logs.length,
          unique_users: new Set(logs.map(log => log.user_id)).size,
          date_range: {
            start: filters.startDate,
            end: filters.endDate
          }
        },
        logs: filters.reportType === 'summary' ? logs.slice(0, 10) : logs
      };

      return { report };
    } catch (error: any) {
      console.error('Error generating audit report:', error);
      return {
        report: null,
        error: error.message
      };
    }
  }
}

export default AuditService;