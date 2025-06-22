
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SystemMaintenanceService } from '@/services/system/systemMaintenanceService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMaintenanceSettings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['maintenance-settings'],
    queryFn: () => SystemMaintenanceService.getMaintenanceStatus(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 30 * 1000, // 30 seconds
    select: (response) => response.data,
  });
};

export const useUpdateMaintenanceSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string }) => 
      SystemMaintenanceService.updateMaintenanceStatus(enabled, message),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Maintenance Status Updated",
          description: "System maintenance settings have been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['maintenance-settings'] });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update maintenance settings",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update maintenance settings",
        variant: "destructive",
      });
    },
  });
};
