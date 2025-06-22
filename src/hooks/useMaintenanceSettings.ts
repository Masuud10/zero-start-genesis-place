
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  updated_at: string;
}

export const useMaintenanceSettings = () => {
  return useQuery({
    queryKey: ['maintenance-settings'],
    queryFn: async (): Promise<MaintenanceSettings> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .single();

      if (error) throw error;

      return data.setting_value as MaintenanceSettings;
    },
  });
};

export const useUpdateMaintenanceSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ enabled, message }: { enabled: boolean; message: string }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          setting_value: {
            enabled,
            message,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('setting_key', 'maintenance_mode')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-settings'] });
      toast({
        title: "Success",
        description: "Maintenance settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance settings",
        variant: "destructive",
      });
    },
  });
};
