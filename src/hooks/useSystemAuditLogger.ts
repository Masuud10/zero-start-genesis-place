
import { useCallback } from 'react';
import { useAuditLogger } from './useAuditLogger';
import { useAuth } from '@/contexts/AuthContext';

export const useSystemAuditLogger = () => {
  const { logSystemAction, logUserAction, logSchoolAction } = useAuditLogger();
  const { user } = useAuth();

  const logUserStatusChange = useCallback(async (targetUserId: string, oldStatus: string, newStatus: string) => {
    if (!user) return;

    try {
      await logUserAction(
        'Status Change',
        targetUserId,
        { status: oldStatus },
        { status: newStatus }
      );
    } catch (auditError) {
      console.error('Failed to log user status change:', auditError);
    }
  }, [logUserAction, user]);

  const logSchoolCreation = useCallback(async (schoolData: any) => {
    if (!user) return;

    try {
      await logSchoolAction(
        'Create',
        schoolData.id,
        null,
        {
          name: schoolData.name,
          email: schoolData.email,
          address: schoolData.address
        }
      );
    } catch (auditError) {
      console.error('Failed to log school creation:', auditError);
    }
  }, [logSchoolAction, user]);

  const logSystemSettingChange = useCallback(async (settingKey: string, oldValue: any, newValue: any) => {
    if (!user) return;

    try {
      await logSystemAction(
        'Setting Change',
        {
          setting_key: settingKey,
          old_value: oldValue,
          new_value: newValue
        }
      );
    } catch (auditError) {
      console.error('Failed to log system setting change:', auditError);
    }
  }, [logSystemAction, user]);

  const logReportGeneration = useCallback(async (reportType: string, parameters: any) => {
    if (!user) return;

    try {
      await logSystemAction(
        'Report Generated',
        {
          report_type: reportType,
          parameters
        }
      );
    } catch (auditError) {
      console.error('Failed to log report generation:', auditError);
    }
  }, [logSystemAction, user]);

  return {
    logUserStatusChange,
    logSchoolCreation,
    logSystemSettingChange,
    logReportGeneration
  };
};
