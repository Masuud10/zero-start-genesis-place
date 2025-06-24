
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  action: string;
  performed_by_user_id: string;
  performed_by_role: string;
  school_id?: string;
  timestamp: string;
  target_entity?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: string;
}

export interface CreateAuditLogParams {
  action: string;
  target_entity?: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
}

class AuditLogService {
  // Log an action to the audit system
  async logAction(params: CreateAuditLogParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_audit_action', {
        p_action: params.action,
        p_target_entity: params.target_entity || null,
        p_old_value: params.old_value || null,
        p_new_value: params.new_value || null,
        p_metadata: params.metadata || {}
      });

      if (error) {
        console.error('Failed to log audit action:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging audit action:', error);
      return null;
    }
  }

  // Get audit logs for school users (principals, teachers)
  async getSchoolAuditLogs(filters?: {
    limit?: number;
    offset?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: AuditLogEntry[]; error: any }> {
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        performed_by_user_id,
        performed_by_role,
        school_id,
        timestamp,
        target_entity,
        old_value,
        new_value,
        ip_address,
        user_agent,
        metadata,
        created_at
      `)
      .order('timestamp', { ascending: false });

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    // Transform the data to match our interface, handling the ip_address type properly
    const transformedData: AuditLogEntry[] = (data || []).map(item => ({
      ...item,
      ip_address: item.ip_address ? String(item.ip_address) : undefined,
      school_id: item.school_id || undefined,
      target_entity: item.target_entity || undefined,
      user_agent: item.user_agent || undefined,
      metadata: item.metadata || undefined
    }));

    return { data: transformedData, error };
  }

  // Get all audit logs for system admins
  async getSystemAuditLogs(filters?: {
    limit?: number;
    offset?: number;
    action?: string;
    school_id?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: AuditLogEntry[]; error: any }> {
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        performed_by_user_id,
        performed_by_role,
        school_id,
        timestamp,
        target_entity,
        old_value,
        new_value,
        ip_address,
        user_agent,
        metadata,
        created_at
      `)
      .order('timestamp', { ascending: false });

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.school_id) {
      query = query.eq('school_id', filters.school_id);
    }

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    // Transform the data to match our interface, handling the ip_address type properly
    const transformedData: AuditLogEntry[] = (data || []).map(item => ({
      ...item,
      ip_address: item.ip_address ? String(item.ip_address) : undefined,
      school_id: item.school_id || undefined,
      target_entity: item.target_entity || undefined,
      user_agent: item.user_agent || undefined,
      metadata: item.metadata || undefined
    }));

    return { data: transformedData, error };
  }

  // Convenience methods for logging specific actions
  async logGradeAction(action: string, gradeId: string, oldValue?: any, newValue?: any) {
    return this.logAction({
      action: `Grade ${action}`,
      target_entity: `grade_id: ${gradeId}`,
      old_value: oldValue,
      new_value: newValue
    });
  }

  async logAttendanceAction(action: string, studentId: string, date: string, oldValue?: any, newValue?: any) {
    return this.logAction({
      action: `Attendance ${action}`,
      target_entity: `student_id: ${studentId}, date: ${date}`,
      old_value: oldValue,
      new_value: newValue
    });
  }

  async logStudentAction(action: string, studentId: string, oldValue?: any, newValue?: any) {
    return this.logAction({
      action: `Student ${action}`,
      target_entity: `student_id: ${studentId}`,
      old_value: oldValue,
      new_value: newValue
    });
  }

  async logPaymentAction(action: string, paymentId: string, amount?: number, metadata?: any) {
    return this.logAction({
      action: `Payment ${action}`,
      target_entity: `payment_id: ${paymentId}`,
      new_value: { amount },
      metadata
    });
  }

  async logUserAction(action: string, userId: string, oldValue?: any, newValue?: any) {
    return this.logAction({
      action: `User ${action}`,
      target_entity: `user_id: ${userId}`,
      old_value: oldValue,
      new_value: newValue
    });
  }

  async logSchoolAction(action: string, schoolId: string, oldValue?: any, newValue?: any) {
    return this.logAction({
      action: `School ${action}`,
      target_entity: `school_id: ${schoolId}`,
      old_value: oldValue,
      new_value: newValue
    });
  }

  async logSystemAction(action: string, metadata?: any) {
    return this.logAction({
      action: `System ${action}`,
      metadata
    });
  }
}

export const auditLogService = new AuditLogService();
