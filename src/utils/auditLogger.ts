
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  metadata?: any;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private logQueue: AuditLogEntry[] = [];
  private isProcessing = false;

  private constructor() {
    // Process logs every 5 seconds
    setInterval(() => this.processLogQueue(), 5000);
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(entry: AuditLogEntry): Promise<void> {
    // Enhance entry with client info
    const enhancedEntry: AuditLogEntry = {
      ...entry,
      ip_address: entry.ip_address || this.getClientIP(),
      user_agent: entry.user_agent || navigator.userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...entry.metadata
      }
    };

    console.log('📋 Audit:', enhancedEntry.action, enhancedEntry.resource, enhancedEntry.success ? '✅' : '❌');

    // Add to queue for batch processing
    this.logQueue.push(enhancedEntry);

    // If critical action, process immediately
    if (this.isCriticalAction(entry.action)) {
      await this.processLogQueue();
    }
  }

  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) return;

    this.isProcessing = true;
    const logsToProcess = [...this.logQueue];
    this.logQueue = [];

    try {
      // Insert audit logs into Supabase
      const { error } = await supabase
        .from('security_audit_logs')
        .insert(logsToProcess.map(log => ({
          user_id: log.user_id,
          action: log.action,
          resource: log.resource,
          resource_id: log.resource_id,
          success: log.success,
          error_message: log.error_message,
          metadata: {
            ip_address: log.ip_address,
            user_agent: log.user_agent,
            old_values: log.old_values,
            new_values: log.new_values,
            ...log.metadata
          }
        })));

      if (error) {
        console.error('Failed to insert audit logs:', error);
        // Re-queue failed logs
        this.logQueue.unshift(...logsToProcess);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // Re-queue failed logs
      this.logQueue.unshift(...logsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      'LOGIN_FAILED',
      'LOGIN_SUCCESS',
      'GRADE_SUBMIT',
      'MPESA_TRANSACTION',
      'USER_CREATE',
      'USER_DELETE',
      'PASSWORD_RESET',
      'ROLE_CHANGE'
    ];
    return criticalActions.includes(action.toUpperCase());
  }

  private getClientIP(): string {
    // In a real application, this would be handled server-side
    return 'client-side-unknown';
  }

  // Convenience methods for common audit events
  async logLogin(userId: string, success: boolean, error?: string): Promise<void> {
    await this.log({
      user_id: userId,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      resource: 'authentication',
      success,
      error_message: error
    });
  }

  async logGradeSubmission(userId: string, gradeData: any, success: boolean, error?: string): Promise<void> {
    await this.log({
      user_id: userId,
      action: 'GRADE_SUBMIT',
      resource: 'grades',
      resource_id: gradeData.student_id,
      new_values: gradeData,
      success,
      error_message: error
    });
  }

  async logMpesaTransaction(userId: string, transactionData: any, success: boolean, error?: string): Promise<void> {
    await this.log({
      user_id: userId,
      action: 'MPESA_TRANSACTION',
      resource: 'mpesa_transactions',
      resource_id: transactionData.reference_number,
      new_values: {
        amount: transactionData.amount,
        phone_number: transactionData.phone_number?.replace(/(\d{3})\d{6}(\d{3})/, '$1******$2') // Mask phone number
      },
      success,
      error_message: error
    });
  }

  async logDataAccess(userId: string, resource: string, resourceId?: string, success: boolean = true): Promise<void> {
    await this.log({
      user_id: userId,
      action: 'DATA_ACCESS',
      resource,
      resource_id: resourceId,
      success
    });
  }

  async logDataModification(userId: string, resource: string, resourceId: string, oldValues: any, newValues: any, success: boolean, error?: string): Promise<void> {
    await this.log({
      user_id: userId,
      action: 'DATA_MODIFY',
      resource,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      success,
      error_message: error
    });
  }
}

export const auditLogger = AuditLogger.getInstance();
