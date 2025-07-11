import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { CommunicationsService } from '@/services/communicationsService';
import { AdminCommunication, AdminCommunicationCreate, AdminCommunicationUpdate } from '@/types/communications';
import { useToast } from '@/hooks/use-toast';

export const useAdminCommunications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get communications for current user
  const {
    data: communications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-communications', user?.role, user?.id],
    queryFn: async () => {
      if (!user?.role || !user?.id) return [];
      return await CommunicationsService.getUserCommunications(user.role, user.id);
    },
    enabled: !!user?.role && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  // Get all communications (for admin management)
  const {
    data: allCommunications = [],
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll
  } = useQuery({
    queryKey: ['all-admin-communications'],
    queryFn: async () => {
      return await CommunicationsService.getAllCommunications();
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create communication mutation
  const createMutation = useMutation({
    mutationFn: async (communication: AdminCommunicationCreate) => {
      return await CommunicationsService.createCommunication(communication);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: "Communication created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
        queryClient.invalidateQueries({ queryKey: ['all-admin-communications'] });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create communication",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create communication",
        variant: "destructive",
      });
    }
  });

  // Update communication mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AdminCommunicationUpdate }) => {
      return await CommunicationsService.updateCommunication(id, updates);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: "Communication updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
        queryClient.invalidateQueries({ queryKey: ['all-admin-communications'] });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update communication",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update communication",
        variant: "destructive",
      });
    }
  });

  // Delete communication mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await CommunicationsService.deleteCommunication(id);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: "Communication deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
        queryClient.invalidateQueries({ queryKey: ['all-admin-communications'] });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete communication",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete communication",
        variant: "destructive",
      });
    }
  });

  // Dismiss communication mutation
  const dismissMutation = useMutation({
    mutationFn: async (communicationId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return await CommunicationsService.dismissCommunication(communicationId, user.id);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Don't show toast for dismissals, just update the cache
        queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      }
    },
    onError: (error) => {
      console.error('Failed to dismiss communication:', error);
    }
  });

  // Get communication stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['communication-stats'],
    queryFn: async () => {
      return await CommunicationsService.getCommunicationStats();
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    // Data
    communications,
    allCommunications,
    stats,
    
    // Loading states
    isLoading,
    isLoadingAll,
    isLoadingStats,
    
    // Errors
    error,
    allError,
    statsError,
    
    // Mutations
    createCommunication: createMutation.mutate,
    updateCommunication: updateMutation.mutate,
    deleteCommunication: deleteMutation.mutate,
    dismissCommunication: dismissMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDismissing: dismissMutation.isPending,
    
    // Refetch functions
    refetch,
    refetchAll
  };
}; 