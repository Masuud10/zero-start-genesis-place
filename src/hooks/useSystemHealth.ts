
import { useQuery } from '@tanstack/react-query';
import { SystemHealthService } from '@/services/system/systemHealthService';
import { useAuth } from '@/contexts/AuthContext';

export const useSystemMetrics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => SystemHealthService.getSystemMetrics(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    select: (response) => response.data,
  });
};

export const useSystemHealth = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['system-health'],
    queryFn: () => SystemHealthService.getSystemHealth(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    select: (response) => response.data,
  });
};
