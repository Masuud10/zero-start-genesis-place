import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceModeService, MaintenanceModeSettings, MaintenanceStatus } from '@/services/system/maintenanceModeService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMaintenanceMode = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for maintenance settings
  const {
    data: maintenanceSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['maintenance-settings'],
    queryFn: async () => {
      console.log('🔄 useMaintenanceMode: Fetching maintenance settings...');
      const { data, error } = await MaintenanceModeService.getMaintenanceModeSettings();
      if (error) {
        console.error('🔄 useMaintenanceMode: Error fetching settings:', error);
        throw error;
      }
      console.log('🔄 useMaintenanceMode: Settings fetched successfully:', data);
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
    retryDelay: 1000,
  });

  // Query for maintenance status
  const {
    data: maintenanceStatus,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['maintenance-status', user?.role],
    queryFn: async () => {
      console.log('🔄 useMaintenanceMode: Fetching maintenance status for role:', user?.role);
      const status = await MaintenanceModeService.getMaintenanceStatus(user?.role);
      console.log('🔄 useMaintenanceMode: Status fetched:', status);
      return status;
    },
    enabled: !!user?.role,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });

  // Mutation for enabling maintenance mode
  const enableMaintenanceMutation = useMutation({
    mutationFn: async ({ message, estimatedDuration }: { message: string; estimatedDuration?: string }) => {
      console.log('🔄 useMaintenanceMode: Enabling maintenance mode with message:', message);
      const result = await MaintenanceModeService.enableMaintenanceMode(message, estimatedDuration);
      if (!result.success) {
        console.error('🔄 useMaintenanceMode: Failed to enable maintenance mode:', result.error);
        throw new Error(result.error as string || 'Failed to enable maintenance mode');
      }
      console.log('🔄 useMaintenanceMode: Successfully enabled maintenance mode');
      return result;
    },
    onSuccess: async (_, variables) => {
      console.log('🔄 useMaintenanceMode: Maintenance mode enabled successfully, logging action...');
      await MaintenanceModeService.logMaintenanceAction('enabled', variables.message);
      
      // Invalidate and refetch queries
      console.log('🔄 useMaintenanceMode: Invalidating queries...');
      await queryClient.invalidateQueries({ queryKey: ['maintenance-settings'] });
      await queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
      
      toast({
        title: "Maintenance Mode Enabled",
        description: "System is now in maintenance mode. All users except EduFam Administrators are blocked.",
        variant: "destructive",
      });
    },
    onError: (error: unknown) => {
      console.error('🔄 useMaintenanceMode: Error enabling maintenance mode:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enable maintenance mode",
        variant: "destructive",
      });
    }
  });

  // Mutation for disabling maintenance mode
  const disableMaintenanceMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 useMaintenanceMode: Disabling maintenance mode...');
      const result = await MaintenanceModeService.disableMaintenanceMode();
      if (!result.success) {
        console.error('🔄 useMaintenanceMode: Failed to disable maintenance mode:', result.error);
        throw new Error(result.error as string || 'Failed to disable maintenance mode');
      }
      console.log('🔄 useMaintenanceMode: Successfully disabled maintenance mode');
      return result;
    },
    onSuccess: async () => {
      console.log('🔄 useMaintenanceMode: Maintenance mode disabled successfully, logging action...');
      await MaintenanceModeService.logMaintenanceAction('disabled', 'Maintenance mode disabled');
      
      // Invalidate and refetch queries
      console.log('🔄 useMaintenanceMode: Invalidating queries...');
      await queryClient.invalidateQueries({ queryKey: ['maintenance-settings'] });
      await queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
      
      toast({
        title: "Maintenance Mode Disabled",
        description: "System is now accessible to all users.",
      });
    },
    onError: (error: unknown) => {
      console.error('🔄 useMaintenanceMode: Error disabling maintenance mode:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disable maintenance mode",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating maintenance message
  const updateMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      console.log('🔄 useMaintenanceMode: Updating maintenance message:', message);
      if (!maintenanceSettings) {
        throw new Error('No maintenance settings available');
      }
      
      const result = await MaintenanceModeService.updateMaintenanceMode({
        ...maintenanceSettings,
        message
      });
      
      if (!result.success) {
        console.error('🔄 useMaintenanceMode: Failed to update maintenance message:', result.error);
        throw new Error(result.error as string || 'Failed to update maintenance message');
      }
      console.log('🔄 useMaintenanceMode: Successfully updated maintenance message');
      return result;
    },
    onSuccess: () => {
      console.log('🔄 useMaintenanceMode: Message updated successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['maintenance-settings'] });
      toast({
        title: "Success",
        description: "Maintenance message updated successfully",
      });
    },
    onError: (error: unknown) => {
      console.error('🔄 useMaintenanceMode: Error updating maintenance message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update maintenance message",
        variant: "destructive",
      });
    }
  });

  // Check if user can access during maintenance
  const canAccessDuringMaintenance = useCallback(() => {
    if (!maintenanceStatus) return true;
    return !maintenanceStatus.inMaintenance || maintenanceStatus.canBypass;
  }, [maintenanceStatus]);

  // Check if user is blocked by maintenance
  const isBlockedByMaintenance = useCallback(() => {
    if (!maintenanceStatus) return false;
    return maintenanceStatus.inMaintenance && !maintenanceStatus.canBypass;
  }, [maintenanceStatus]);

  // Wrapper function for enabling maintenance mode
  const enableMaintenance = useCallback(({ message, estimatedDuration }: { message: string; estimatedDuration?: string }) => {
    console.log('🔄 useMaintenanceMode: enableMaintenance called with:', { message, estimatedDuration });
    enableMaintenanceMutation.mutate({ message, estimatedDuration });
  }, [enableMaintenanceMutation]);

  // Wrapper function for disabling maintenance mode
  const disableMaintenance = useCallback(() => {
    console.log('🔄 useMaintenanceMode: disableMaintenance called');
    disableMaintenanceMutation.mutate();
  }, [disableMaintenanceMutation]);

  // Wrapper function for updating message
  const updateMessage = useCallback((message: string) => {
    console.log('🔄 useMaintenanceMode: updateMessage called with:', message);
    updateMessageMutation.mutate(message);
  }, [updateMessageMutation]);

  return {
    // Data
    maintenanceSettings,
    maintenanceStatus,
    
    // Loading states
    isLoadingSettings,
    isLoadingStatus,
    isLoading: isLoadingSettings || isLoadingStatus,
    
    // Errors
    settingsError,
    statusError,
    
    // Mutations
    enableMaintenance,
    disableMaintenance,
    updateMessage,
    
    // Mutation states
    isEnabling: enableMaintenanceMutation.isPending,
    isDisabling: disableMaintenanceMutation.isPending,
    isUpdatingMessage: updateMessageMutation.isPending,
    
    // Utility functions
    canAccessDuringMaintenance,
    isBlockedByMaintenance,
    
    // Refetch functions
    refetchSettings,
    refetchStatus,
    refetch: () => {
      console.log('🔄 useMaintenanceMode: Manual refetch called');
      refetchSettings();
      refetchStatus();
    }
  };
}; 