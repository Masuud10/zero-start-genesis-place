
import { useQuery } from '@tanstack/react-query';
import { AdminUserService } from '@/services/adminUserService';

export function useAdminUsersData(refreshKey: number) {
  return useQuery({
    queryKey: ['admin-users', refreshKey],
    queryFn: async () => {
      console.log('👥 EduFamAdmin: Fetching users data');
      try {
        const { data, error } = await AdminUserService.getUsersForSchool();
        if (error) {
          console.error('👥 EduFamAdmin: User fetch error:', error);
          throw new Error(error.message || 'Failed to fetch users');
        }
        const users = data || [];
        console.log('👥 EduFamAdmin: Users fetched successfully:', users.length);
        return users.filter(user => user && typeof user === 'object' && user.id);
      } catch (error) {
        console.error('👥 EduFamAdmin: Exception fetching users:', error);
        throw error;
      }
    },
    retry: (failureCount) => {
      console.log('👥 EduFamAdmin: Retry attempt', failureCount, 'for users');
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });
}
