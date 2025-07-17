
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenanceService';
import { useToast } from '@/hooks/use-toast';

export const useMaintenanceSettings = () => {
  return useQuery({
    queryKey: ['maintenance-settings'],
    queryFn: () => MaintenanceService.getMaintenanceStatus(),
    select: (response) => response.data,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUpdateMaintenanceSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message: string }) => 
      MaintenanceService.updateMaintenanceStatus(enabled, message),
    onSuccess: (result: any) => {
      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "Maintenance settings have been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['maintenance-settings'] });
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update maintenance settings",
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
