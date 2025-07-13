import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string;
  school_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  academic_context?: {
    academic_year_id?: string;
    term_id?: string;
    class_id?: string;
    subject_id?: string;
  };
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SystemEvent {
  id: string;
  event_type: string;
  event_data?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  school_id: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async logAuditEvent(
    action: string,
    tableName: string,
    recordId?: string,
    oldValues?: any,
    newValues?: any,
    academicContext?: {
      academic_year_id?: string;
      term_id?: string;
      class_id?: string;
      subject_id?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          performed_by_user_id: user.id,
          performed_by_role: 'user',
          action,
          target_entity: `${tableName}:${recordId}`,
          old_value: oldValues,
          new_value: newValues,
          metadata: academicContext,
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error logging audit event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log a system event
   */
  static async logSystemEvent(
    eventType: string,
    eventData?: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    schoolId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let effectiveSchoolId = schoolId;
      if (!effectiveSchoolId && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single();
        effectiveSchoolId = profile?.school_id;
      }

      // Use audit_logs table for system events
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          performed_by_user_id: user?.id,
          performed_by_role: 'system',
          action: `SYSTEM_${eventType}`,
          target_entity: 'system',
          metadata: { event_data: eventData, severity },
          school_id: effectiveSchoolId,
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error logging system event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(
    filters: {
      schoolId?: string;
      userId?: string;
      action?: string;
      tableName?: string;
      startDate?: string;
      endDate?: string;
      academicContext?: {
        academic_year_id?: string;
        term_id?: string;
        class_id?: string;
        subject_id?: string;
      };
    },
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: AuditLog[]; count: number; error?: string }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.schoolId) {
        query = query.eq('school_id', filters.schoolId);
      }
      if (filters.userId) {
        query = query.eq('performed_by_user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.tableName) {
        query = query.ilike('target_entity', `${filters.tableName}:%`);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.academicContext) {
        if (filters.academicContext.academic_year_id) {
          query = query.eq('metadata->academic_year_id', filters.academicContext.academic_year_id);
        }
        if (filters.academicContext.term_id) {
          query = query.eq('metadata->term_id', filters.academicContext.term_id);
        }
        if (filters.academicContext.class_id) {
          query = query.eq('metadata->class_id', filters.academicContext.class_id);
        }
        if (filters.academicContext.subject_id) {
          query = query.eq('metadata->subject_id', filters.academicContext.subject_id);
        }
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Transform data to match AuditLog interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        user_id: item.performed_by_user_id,
        school_id: item.school_id,
        action: item.action,
        table_name: item.target_entity?.split(':')[0] || 'unknown',
        record_id: item.target_entity?.split(':')[1],
        old_values: item.old_value,
        new_values: item.new_value,
        academic_context: typeof item.metadata === 'object' ? item.metadata as any : undefined,
        ip_address: typeof item.ip_address === 'string' ? item.ip_address : undefined,
        user_agent: item.user_agent,
        created_at: item.created_at
      }));

      return { data: transformedData, count: count || 0 };
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      return { data: [], count: 0, error: error.message };
    }
  }

  /**
   * Get system events with filtering
   */
  static async getSystemEvents(
    filters: {
      schoolId?: string;
      eventType?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      startDate?: string;
      endDate?: string;
      unprocessedOnly?: boolean;
    },
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: SystemEvent[]; count: number; error?: string }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .like('action', 'SYSTEM_%')
        .order('created_at', { ascending: false });

      if (filters.schoolId) {
        query = query.eq('school_id', filters.schoolId);
      }
      if (filters.eventType) {
        query = query.eq('action', `SYSTEM_${filters.eventType}`);
      }
      if (filters.severity) {
        query = query.eq('metadata->severity', filters.severity);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Transform data to match SystemEvent interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        event_type: item.action.replace('SYSTEM_', ''),
        event_data: typeof item.metadata === 'object' && item.metadata ? (item.metadata as any).event_data : undefined,
        severity: (typeof item.metadata === 'object' && item.metadata ? (item.metadata as any).severity : undefined) || 'medium',
        school_id: item.school_id,
        created_at: item.created_at
      }));

      return { data: transformedData, count: count || 0 };
    } catch (error: any) {
      console.error('Error fetching system events:', error);
      return { data: [], count: 0, error: error.message };
    }
  }

  /**
   * Mark system event as processed
   */
  static async markSystemEventProcessed(
    eventId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('audit_logs')
        .update({
          metadata: { processed_at: new Date().toISOString(), processed_by: user?.id }
        })
        .eq('id', eventId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error marking system event as processed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit summary statistics
   */
  static async getAuditSummary(
    schoolId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ data: any; error?: string }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('action, target_entity, created_at')
        .eq('school_id', schoolId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data to create summary
      const summary = {
        totalActions: data?.length || 0,
        actionsByType: {} as Record<string, number>,
        actionsByTable: {} as Record<string, number>,
        actionsByDay: {} as Record<string, number>,
      };

      data?.forEach(log => {
        // Count by action type
        summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;
        
        // Count by table
        const tableName = log.target_entity?.split(':')[0] || 'unknown';
        summary.actionsByTable[tableName] = (summary.actionsByTable[tableName] || 0) + 1;
        
        // Count by day
        const day = new Date(log.created_at).toISOString().split('T')[0];
        summary.actionsByDay[day] = (summary.actionsByDay[day] || 0) + 1;
      });

      return { data: summary };
    } catch (error: any) {
      console.error('Error getting audit summary:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Academic context-aware audit helpers
   */
  static async logGradeSubmission(
    teacherId: string,
    gradeData: any,
    academicContext: {
      academic_year_id: string;
      term_id: string;
      class_id: string;
      subject_id: string;
    }
  ): Promise<void> {
    await this.logAuditEvent(
      'GRADE_SUBMISSION',
      'grades',
      gradeData.id,
      undefined,
      gradeData,
      academicContext
    );

    await this.logSystemEvent(
      'GRADE_SUBMITTED',
      {
        teacher_id: teacherId,
        grade_count: gradeData.length || 1,
        class_id: academicContext.class_id,
        subject_id: academicContext.subject_id,
      },
      'medium'
    );
  }

  static async logGradeApproval(
    principalId: string,
    gradeData: any,
    academicContext: {
      academic_year_id: string;
      term_id: string;
      class_id: string;
      subject_id: string;
    }
  ): Promise<void> {
    await this.logAuditEvent(
      'GRADE_APPROVAL',
      'grades',
      gradeData.id,
      undefined,
      gradeData,
      academicContext
    );

    await this.logSystemEvent(
      'GRADE_APPROVED',
      {
        principal_id: principalId,
        grade_count: gradeData.length || 1,
        class_id: academicContext.class_id,
        subject_id: academicContext.subject_id,
      },
      'medium'
    );
  }

  static async logGradeRejection(
    principalId: string,
    gradeData: any,
    reason: string,
    academicContext: {
      academic_year_id: string;
      term_id: string;
      class_id: string;
      subject_id: string;
    }
  ): Promise<void> {
    await this.logAuditEvent(
      'GRADE_REJECTION',
      'grades',
      gradeData.id,
      undefined,
      { ...gradeData, rejection_reason: reason },
      academicContext
    );

    await this.logSystemEvent(
      'GRADE_REJECTED',
      {
        principal_id: principalId,
        grade_count: gradeData.length || 1,
        class_id: academicContext.class_id,
        subject_id: academicContext.subject_id,
        reason,
      },
      'high'
    );
  }

  static async logAttendanceMarking(
    teacherId: string,
    attendanceData: any,
    academicContext: {
      academic_year_id: string;
      term_id: string;
      class_id: string;
    }
  ): Promise<void> {
    await this.logAuditEvent(
      'ATTENDANCE_MARKED',
      'attendance',
      attendanceData.id,
      undefined,
      attendanceData,
      academicContext
    );
  }

  static async logExamCreation(
    principalId: string,
    examData: any,
    academicContext: {
      academic_year_id: string;
      term_id: string;
    }
  ): Promise<void> {
    await this.logAuditEvent(
      'EXAM_CREATED',
      'examinations',
      examData.id,
      undefined,
      examData,
      academicContext
    );

    await this.logSystemEvent(
      'EXAM_CREATED',
      {
        principal_id: principalId,
        exam_name: examData.name,
        exam_type: examData.type,
        start_date: examData.start_date,
        end_date: examData.end_date,
      },
      'medium'
    );
  }

  static async logReportGeneration(
    userId: string,
    reportData: any,
    academicContext?: {
      academic_year_id?: string;
      term_id?: string;
      class_id?: string;
      subject_id?: string;
    }
  ): Promise<void> {
    await this.logAuditEvent(
      'REPORT_GENERATED',
      'reports',
      reportData.id,
      undefined,
      reportData,
      academicContext
    );
  }

  static async logDataIntegrityCheck(
    schoolId: string,
    checkResults: any
  ): Promise<void> {
    await this.logSystemEvent(
      'DATA_INTEGRITY_CHECK',
      {
        school_id: schoolId,
        results: checkResults,
      },
      checkResults.hasIssues ? 'high' : 'low'
    );
  }

  static async logUserActivity(
    userId: string,
    activity: string,
    details?: any
  ): Promise<void> {
    await this.logAuditEvent(
      'USER_ACTIVITY',
      'user_activities',
      undefined,
      undefined,
      { activity, details },
      undefined
    );
  }
}

export default AuditService; 