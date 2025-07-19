import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseBackupService, BackupRecord, BackupSettings } from '@/services/system/databaseBackupService';
import { useToast } from '@/hooks/use-toast';

export const useDatabaseBackup = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for backup history
  const {
    data: backupHistory = [],
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['backup-history'],
    queryFn: async () => {
      console.log('🗄️ useDatabaseBackup: Fetching backup history...');
      const data = await DatabaseBackupService.getBackupHistory();
      console.log('🗄️ useDatabaseBackup: Backup history fetched successfully');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Query for backup settings
  const {
    data: backupSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['backup-settings'],
    queryFn: async () => {
      console.log('🗄️ useDatabaseBackup: Fetching backup settings...');
      const { data, error } = await DatabaseBackupService.getBackupSettings();
      if (error) {
        console.error('🗄️ useDatabaseBackup: Error fetching backup settings:', error);
        throw new Error(error);
      }
      console.log('🗄️ useDatabaseBackup: Backup settings fetched successfully');
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Mutation for creating backup
  const createBackupMutation = useMutation({
    mutationFn: async (type: 'full' | 'incremental' | 'configuration') => {
      console.log('🗄️ useDatabaseBackup: Creating backup of type:', type);
      const result = await DatabaseBackupService.createBackup(type);
      if (!result.success) {
        console.error('🗄️ useDatabaseBackup: Failed to create backup:', result.error);
        throw new Error(result.error || 'Failed to create backup');
      }
      console.log('🗄️ useDatabaseBackup: Backup created successfully');
      return result;
    },
    onSuccess: (_, backupType) => {
      console.log('🗄️ useDatabaseBackup: Backup created successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
      
      toast({
        title: "Backup Created",
        description: `${backupType} backup has been created successfully.`,
      });
    },
    onError: (error: unknown) => {
      console.error('🗄️ useDatabaseBackup: Error creating backup:', error);
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : "Failed to create backup",
        variant: "destructive",
      });
    }
  });

  // Mutation for downloading backup
  const downloadBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      console.log('🗄️ useDatabaseBackup: Downloading backup:', backupId);
      const result = await DatabaseBackupService.downloadBackup(backupId);
      if (!result.success) {
        console.error('🗄️ useDatabaseBackup: Failed to download backup:', result.error);
        throw new Error(result.error || 'Failed to download backup');
      }
      console.log('🗄️ useDatabaseBackup: Backup downloaded successfully');
      return result;
    },
    onSuccess: () => {
      console.log('🗄️ useDatabaseBackup: Backup downloaded successfully');
      toast({
        title: "Backup Downloaded",
        description: "Backup has been downloaded successfully.",
      });
    },
    onError: (error: unknown) => {
      console.error('🗄️ useDatabaseBackup: Error downloading backup:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download backup",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating backup settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: BackupSettings) => {
      console.log('🗄️ useDatabaseBackup: Updating backup settings...');
      const result = await DatabaseBackupService.updateBackupSettings(settings);
      if (!result.success) {
        console.error('🗄️ useDatabaseBackup: Failed to update backup settings:', result.error);
        throw new Error(result.error || 'Failed to update backup settings');
      }
      console.log('🗄️ useDatabaseBackup: Backup settings updated successfully');
      return result;
    },
    onSuccess: () => {
      console.log('🗄️ useDatabaseBackup: Settings updated successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] });
      
      toast({
        title: "Settings Updated",
        description: "Backup settings have been updated successfully.",
      });
    },
    onError: (error: unknown) => {
      console.error('🗄️ useDatabaseBackup: Error updating backup settings:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update backup settings",
        variant: "destructive",
      });
    }
  });

  // Wrapper functions
  const createBackup = (type: 'full' | 'incremental' | 'configuration' = 'full') => {
    console.log('🗄️ useDatabaseBackup: createBackup called with type:', type);
    createBackupMutation.mutate(type);
  };

  const downloadBackup = (backupId: string) => {
    console.log('🗄️ useDatabaseBackup: downloadBackup called with ID:', backupId);
    downloadBackupMutation.mutate(backupId);
  };

  const updateSettings = (settings: BackupSettings) => {
    console.log('🗄️ useDatabaseBackup: updateSettings called');
    updateSettingsMutation.mutate(settings);
  };

  // Get latest backup info
  const latestBackup = backupHistory.length > 0 ? backupHistory[0] : null;
  const lastBackupDate = latestBackup ? new Date(latestBackup.created_at) : null;
  const isBackupRecent = lastBackupDate ? 
    (Date.now() - lastBackupDate.getTime()) < 24 * 60 * 60 * 1000 : false; // Within 24 hours

  return {
    // Data
    backupHistory,
    backupSettings,
    latestBackup,
    lastBackupDate,
    isBackupRecent,
    
    // Loading states
    isLoadingHistory,
    isLoadingSettings,
    isLoading: isLoadingHistory || isLoadingSettings,
    
    // Mutation states
    isCreatingBackup: createBackupMutation.isPending,
    isDownloadingBackup: downloadBackupMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
    
    // Errors
    historyError,
    settingsError,
    
    // Actions
    createBackup,
    downloadBackup,
    updateSettings,
    
    // Refetch functions
    refetchHistory,
    refetchSettings,
    refetch: () => {
      console.log('🗄️ useDatabaseBackup: Manual refetch called');
      refetchHistory();
      refetchSettings();
    }
  };
}; 