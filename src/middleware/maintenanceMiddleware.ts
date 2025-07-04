import { MaintenanceModeService } from '@/services/system/maintenanceModeService';

export interface MaintenanceMiddlewareConfig {
  checkOnRouteChange?: boolean;
  checkOnApiCall?: boolean;
  redirectToMaintenancePage?: boolean;
  allowedRoutes?: string[];
  allowedApiEndpoints?: string[];
}

export class MaintenanceMiddleware {
  private static instance: MaintenanceMiddleware;
  private config: MaintenanceMiddlewareConfig;
  private maintenanceStatus: {
    inMaintenance: boolean;
    message?: string;
    canBypass: boolean;
    estimatedDuration?: string;
  } | null = null;
  private lastCheck: number = 0;
  private readonly CACHE_DURATION = 10 * 1000; // 10 seconds

  constructor(config: MaintenanceMiddlewareConfig = {}) {
    this.config = {
      checkOnRouteChange: true,
      checkOnApiCall: true,
      redirectToMaintenancePage: true,
      allowedRoutes: ['/maintenance', '/login', '/auth'],
      allowedApiEndpoints: ['/api/maintenance', '/api/auth'],
      ...config
    };
  }

  static getInstance(config?: MaintenanceMiddlewareConfig): MaintenanceMiddleware {
    if (!MaintenanceMiddleware.instance) {
      MaintenanceMiddleware.instance = new MaintenanceMiddleware(config);
    }
    return MaintenanceMiddleware.instance;
  }

  /**
   * Check if the current route should be allowed during maintenance
   */
  private isRouteAllowed(pathname: string): boolean {
    if (!this.config.allowedRoutes) return false;
    return this.config.allowedRoutes.some(route => pathname.startsWith(route));
  }

  /**
   * Check if the current API endpoint should be allowed during maintenance
   */
  private isApiEndpointAllowed(endpoint: string): boolean {
    if (!this.config.allowedApiEndpoints) return false;
    return this.config.allowedApiEndpoints.some(allowed => endpoint.startsWith(allowed));
  }

  /**
   * Get maintenance status with caching
   */
  async getMaintenanceStatus(userRole?: string): Promise<{
    inMaintenance: boolean;
    message?: string;
    canBypass: boolean;
    estimatedDuration?: string;
  }> {
    const now = Date.now();
    
    // Return cached status if still valid
    if (this.maintenanceStatus && (now - this.lastCheck) < this.CACHE_DURATION) {
      return this.maintenanceStatus;
    }

    try {
      const status = await MaintenanceModeService.getMaintenanceStatus(userRole);
      this.maintenanceStatus = status;
      this.lastCheck = now;
      return status;
    } catch (error) {
      console.error('Error checking maintenance status:', error);
      // Return safe default
      return { inMaintenance: false, canBypass: true };
    }
  }

  /**
   * Check if user can access a specific route
   */
  async canAccessRoute(pathname: string, userRole?: string): Promise<{
    allowed: boolean;
    reason?: string;
    redirectTo?: string;
  }> {
    // Always allow maintenance-related routes
    if (this.isRouteAllowed(pathname)) {
      return { allowed: true };
    }

    const status = await this.getMaintenanceStatus(userRole);
    
    if (!status.inMaintenance) {
      return { allowed: true };
    }

    if (status.canBypass) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: status.message || 'System is under maintenance',
      redirectTo: this.config.redirectToMaintenancePage ? '/maintenance' : undefined
    };
  }

  /**
   * Check if user can access a specific API endpoint
   */
  async canAccessApi(endpoint: string, userRole?: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Always allow maintenance-related API endpoints
    if (this.isApiEndpointAllowed(endpoint)) {
      return { allowed: true };
    }

    const status = await this.getMaintenanceStatus(userRole);
    
    if (!status.inMaintenance) {
      return { allowed: true };
    }

    if (status.canBypass) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: status.message || 'System is under maintenance'
    };
  }

  /**
   * Clear cached maintenance status
   */
  clearCache(): void {
    this.maintenanceStatus = null;
    this.lastCheck = 0;
  }

  /**
   * Force refresh maintenance status
   */
  async refreshStatus(userRole?: string): Promise<void> {
    this.clearCache();
    await this.getMaintenanceStatus(userRole);
  }

  /**
   * Get current maintenance configuration
   */
  getConfig(): MaintenanceMiddlewareConfig {
    return { ...this.config };
  }

  /**
   * Update middleware configuration
   */
  updateConfig(newConfig: Partial<MaintenanceMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export a default instance
export const maintenanceMiddleware = MaintenanceMiddleware.getInstance();

// Export utility functions for common use cases
export const checkMaintenanceAccess = async (userRole?: string) => {
  return await maintenanceMiddleware.getMaintenanceStatus(userRole);
};

export const canAccessDuringMaintenance = async (userRole?: string) => {
  const status = await maintenanceMiddleware.getMaintenanceStatus(userRole);
  return !status.inMaintenance || status.canBypass;
};

export const isBlockedByMaintenance = async (userRole?: string) => {
  const status = await maintenanceMiddleware.getMaintenanceStatus(userRole);
  return status.inMaintenance && !status.canBypass;
}; 