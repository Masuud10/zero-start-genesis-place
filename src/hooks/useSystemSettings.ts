
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SystemSettingsService } from '@/services/system/systemSettingsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useUserManagementStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-management-stats'],
    queryFn: () => SystemSettingsService.getUserManagementStats(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data,
  });
};

export const useSecuritySettings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['security-settings'],
    queryFn: () => SystemSettingsService.getSecuritySettings(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (response) => response.data,
  });
};

export const useSystemMaintenance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (action: string) => SystemSettingsService.performSystemMaintenance(action),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Maintenance Completed",
          description: result.message,
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['security-settings'] });
        queryClient.invalidateQueries({ queryKey: ['user-management-stats'] });
      } else {
        toast({
          title: "Maintenance Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to perform maintenance operation",
        variant: "destructive",
      });
    },
  });
};
