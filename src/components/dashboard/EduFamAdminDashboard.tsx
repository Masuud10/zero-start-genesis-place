
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SchoolService } from '@/services/schoolService';
import { AdminUserService } from '@/services/adminUserService';
import SystemOverviewCards from './admin/SystemOverviewCards';
import AdministrativeHub from './admin/AdministrativeHub';
import RecentSchoolsSection from './admin/RecentSchoolsSection';
import UserRoleBreakdown from './admin/UserRoleBreakdown';
import ErrorDisplay from './admin/ErrorDisplay';
import CommunicationCenterModule from '@/components/modules/CommunicationCenterModule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

interface EduFamAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const EduFamAdminDashboard = ({ onModalOpen }: EduFamAdminDashboardProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch schools data with comprehensive error handling
  const { 
    data: schoolsData = [], 
    isLoading: schoolsLoading, 
    error: schoolsError, 
    refetch: refetchSchools,
    isRefetching: schoolsRefetching 
  } = useQuery({
    queryKey: ['admin-schools', refreshKey],
    queryFn: async () => {
      console.log('🏫 EduFamAdmin: Fetching schools data');
      try {
        const result = await SchoolService.getAllSchools();
        if (result.error) {
          console.error('🏫 EduFamAdmin: School fetch error:', result.error);
          throw new Error(result.error.message || 'Failed to fetch schools');
        }
        
        const schools = result.data || [];
        console.log('🏫 EduFamAdmin: Schools fetched successfully:', schools.length);
        
        // Validate and clean school data
        return schools.filter(school => school && typeof school === 'object' && school.id);
      } catch (error) {
        console.error('🏫 EduFamAdmin: Exception fetching schools:', error);
        throw error;
      }
    },
    retry: (failureCount) => {
      console.log('🏫 EduFamAdmin: Retry attempt', failureCount, 'for schools');
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  // Fetch users data with comprehensive error handling
  const { 
    data: usersData = [], 
    isLoading: usersLoading, 
    error: usersError, 
    refetch: refetchUsers,
    isRefetching: usersRefetching 
  } = useQuery({
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
        
        // Validate and clean user data
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

  const handleUserCreated = () => {
    console.log('👥 EduFamAdmin: User created, refreshing data');
    setRefreshKey(prev => prev + 1);
  };

  const handleRetryAll = () => {
    console.log('🔄 EduFamAdmin: Retrying all data fetch');
    setRefreshKey(prev => prev + 1);
    refetchSchools();
    refetchUsers();
  };

  const handleRetrySchools = () => {
    console.log('🏫 EduFamAdmin: Retrying schools fetch');
    refetchSchools();
  };

  // Calculate user statistics with enhanced validation
  const userStats = React.useMemo(() => {
    try {
      if (!Array.isArray(usersData)) {
        console.warn('👥 EduFamAdmin: Invalid users data format:', typeof usersData);
        return {
          totalUsers: 0,
          usersWithSchools: 0,
          usersWithoutSchools: 0,
          roleBreakdown: {}
        };
      }

      const validUsers = usersData.filter(user => user && typeof user === 'object' && user.id);
      
      const stats = {
        totalUsers: validUsers.length,
        usersWithSchools: validUsers.filter(u => u.school_id).length,
        usersWithoutSchools: validUsers.filter(u => !u.school_id).length,
        roleBreakdown: validUsers.reduce((acc: Record<string, number>, user) => {
          const role = user.role || 'unknown';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {})
      };
      
      console.log('📊 EduFamAdmin: User stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('📊 EduFamAdmin: Error calculating user stats:', error);
      return {
        totalUsers: 0,
        usersWithSchools: 0,
        usersWithoutSchools: 0,
        roleBreakdown: {}
      };
    }
  }, [usersData]);

  // Early return for comprehensive error state
  if (schoolsError && usersError) {
    return <ErrorDisplay schoolsError={schoolsError} usersError={usersError} onRetryAll={handleRetryAll} />;
  }

  return (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <SystemOverviewCards
        schoolsCount={Array.isArray(schoolsData) ? schoolsData.length : 0}
        totalUsers={userStats.totalUsers}
        usersWithSchools={userStats.usersWithSchools}
        usersWithoutSchools={userStats.usersWithoutSchools}
        schoolsLoading={schoolsLoading}
        usersLoading={usersLoading}
        schoolsRefetching={schoolsRefetching}
        usersRefetching={usersRefetching}
      />

      {/* Communication Center for Broadcasting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Global Communication Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommunicationCenterModule />
        </CardContent>
      </Card>

      {/* Administrative Hub */}
      <AdministrativeHub 
        onModalOpen={onModalOpen}
        onUserCreated={handleUserCreated}
      />

      {/* Recent Schools Section */}
      <RecentSchoolsSection
        schoolsData={schoolsData}
        schoolsLoading={schoolsLoading}
        schoolsError={schoolsError}
        onModalOpen={onModalOpen}
        onRetrySchools={handleRetrySchools}
      />

      {/* User Role Breakdown */}
      <UserRoleBreakdown
        roleBreakdown={userStats.roleBreakdown}
        totalUsers={userStats.totalUsers}
        usersLoading={usersLoading}
      />

      {/* Error Display for partial errors */}
      <ErrorDisplay 
        schoolsError={schoolsError} 
        usersError={usersError} 
        onRetryAll={handleRetryAll} 
      />
    </div>
  );
};

export default EduFamAdminDashboard;
