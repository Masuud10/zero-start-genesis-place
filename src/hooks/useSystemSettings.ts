
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SystemSettingsService } from '@/services/system/systemSettingsService';

export const useSystemMaintenance = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (action: string) => {
      console.log('🔧 Running system maintenance action:', action);
      
      // Mock maintenance actions for now
      switch (action) {
        case 'cleanup_audit_logs':
          // Simulate cleanup
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { success: true, message: 'Audit logs cleaned successfully' };
          
        case 'reset_rate_limits':
          // Reset rate limits
          const { error } = await supabase
            .from('rate_limits')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          
          if (error) throw error;
          return { success: true, message: 'Rate limits reset successfully' };
          
        case 'optimize_database':
          // Simulate optimization
          await new Promise(resolve => setTimeout(resolve, 3000));
          return { success: true, message: 'Database optimization completed' };
          
        default:
          throw new Error(`Unknown maintenance action: ${action}`);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      console.error('Maintenance error:', error);
      toast({
        title: "Error",
        description: error.message || "Maintenance operation failed",
        variant: "destructive",
      });
    },
  });
};

export const useUserManagementStats = () => {
  return useQuery({
    queryKey: ['user-management-stats'],
    queryFn: async () => {
      const { data, error } = await SystemSettingsService.getUserManagementStats();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useSecuritySettings = () => {
  return useQuery({
    queryKey: ['security-settings'],
    queryFn: async () => {
      const { data, error } = await SystemSettingsService.getSecuritySettings();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
