import { MaintenanceModeService } from '@/services/system/maintenanceModeService';

export interface MaintenanceCheckResult {
  inMaintenance: boolean;
  canAccess: boolean;
  message?: string;
  redirectTo?: string;
}

export class MaintenanceCheck {
  static async checkAccess(userRole?: string): Promise<MaintenanceCheckResult> {
    try {
      console.log('🔍 MaintenanceCheck: Checking access for role:', userRole);
      
      const status = await MaintenanceModeService.getMaintenanceStatus(userRole);
      
      console.log('🔍 MaintenanceCheck: Maintenance status:', status);
      
      if (!status.inMaintenance) {
        return {
          inMaintenance: false,
          canAccess: true
        };
      }

      // If in maintenance mode, check if user can bypass
      if (status.canBypass) {
        return {
          inMaintenance: true,
          canAccess: true,
          message: 'System is in maintenance mode, but you have admin access.'
        };
      }

      // User is blocked by maintenance mode
      return {
        inMaintenance: true,
        canAccess: false,
        message: status.message || 'System is currently under maintenance. Please try again later.',
        redirectTo: '/maintenance'
      };
    } catch (error) {
      console.error('🔍 MaintenanceCheck: Error checking maintenance status:', error);
      // On error, allow access to prevent blocking legitimate users
      return {
        inMaintenance: false,
        canAccess: true
      };
    }
  }

  static async shouldRedirectToMaintenance(userRole?: string): Promise<boolean> {
    const result = await this.checkAccess(userRole);
    return result.inMaintenance && !result.canAccess;
  }

  static async getMaintenanceMessage(): Promise<string> {
    try {
      return await MaintenanceModeService.getMaintenanceMessage();
    } catch (error) {
      console.error('🔍 MaintenanceCheck: Error getting maintenance message:', error);
      return 'System is currently under maintenance. Please try again later.';
    }
  }

  static canRoleBypassMaintenance(userRole?: string): boolean {
    return MaintenanceModeService.canRoleAccessDuringMaintenance(userRole);
  }
}

