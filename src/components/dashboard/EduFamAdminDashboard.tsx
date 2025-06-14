
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, BarChart3, Shield, School, UserPlus, TrendingUp, Activity, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import CreateUserDialog from '@/components/modules/users/CreateUserDialog';
import { useQuery } from '@tanstack/react-query';
import { SchoolService } from '@/services/schoolService';
import { AdminUserService } from '@/services/adminUserService';

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
    retry: (failureCount, error) => {
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
    retry: (failureCount, error) => {
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

  const handleRetryUsers = () => {
    console.log('👥 EduFamAdmin: Retrying users fetch');
    refetchUsers();
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

  // System overview cards configuration
  const systemOverviewCards = [
    {
      title: "Total Schools",
      value: Array.isArray(schoolsData) ? schoolsData.length : 0,
      description: "Active school tenants",
      icon: Building2,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: "+12%",
      trend: "up" as const,
      loading: schoolsLoading || schoolsRefetching
    },
    {
      title: "Total Users",
      value: userStats.totalUsers,
      description: "Across all schools",
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      change: "+8%",
      trend: "up" as const,
      loading: usersLoading || usersRefetching
    },
    {
      title: "Users Assigned",
      value: userStats.usersWithSchools,
      description: "Users linked to schools",
      icon: CheckCircle,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+15%",
      trend: "up" as const,
      loading: usersLoading || usersRefetching
    },
    {
      title: "Unassigned Users",
      value: userStats.usersWithoutSchools,
      description: "Need school assignment",
      icon: Activity,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      change: "-5%",
      trend: "down" as const,
      loading: usersLoading || usersRefetching
    }
  ];

  // Show comprehensive error state if both queries failed
  if (schoolsError && usersError) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Dashboard Loading Failed</h3>
            <p className="text-red-700 mb-4">
              Unable to load dashboard data. Please check your connection and try again.
            </p>
            <div className="space-y-2 text-sm text-red-600 mb-4">
              {schoolsError && <p>Schools Error: {schoolsError.message}</p>}
              {usersError && <p>Users Error: {usersError.message}</p>}
            </div>
            <Button onClick={handleRetryAll} variant="outline" className="border-red-300 text-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry All
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {systemOverviewCards.map((card, index) => (
          <Card key={index} className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-40`}></div>
            <CardContent className="p-3 relative">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-md bg-gradient-to-r ${card.gradient} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  <card.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className={`h-3 w-3 ${card.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`} />
                  <span className={`font-medium ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">{card.title}</p>
                <p className="text-lg font-bold text-gray-900">
                  {card.loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    card.value
                  )}
                </p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            Administrative Hub
          </CardTitle>
          <CardDescription className="text-sm">
            Quick access to essential system management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 border-2 hover:border-blue-200 transition-all duration-200 group"
              onClick={() => onModalOpen('schools')}
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-105 transition-transform duration-200">
                <School className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium text-xs">Manage Schools</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100 border-2 hover:border-emerald-200 transition-all duration-200 group"
              onClick={() => onModalOpen('users')}
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:scale-105 transition-transform duration-200">
                <Users className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium text-xs">Manage Users</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 border-2 hover:border-purple-200 transition-all duration-200 group"
              onClick={() => onModalOpen('analytics')}
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 group-hover:scale-105 transition-transform duration-200">
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium text-xs">System Analytics</span>
            </Button>
            
            <CreateUserDialog onUserCreated={handleUserCreated}>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 border-2 hover:border-orange-200 transition-all duration-200 group w-full"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 group-hover:scale-105 transition-transform duration-200">
                  <UserPlus className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-medium text-xs">Create User</span>
              </Button>
            </CreateUserDialog>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recent Schools Section */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            Recent Schools
            {schoolsLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
          </CardTitle>
          <CardDescription>
            Latest educational institutions joining the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading schools...</span>
            </div>
          ) : schoolsError ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 mb-3">Failed to load schools</p>
              <p className="text-sm text-red-500 mb-3">{schoolsError.message}</p>
              <Button onClick={handleRetrySchools} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : Array.isArray(schoolsData) && schoolsData.length > 0 ? (
            <div className="space-y-3">
              {schoolsData.slice(0, 5).map((school: any) => (
                <div key={school.id} className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-blue-50 hover:to-white border hover:border-blue-200 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-105 transition-transform duration-200">
                      <Building2 className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{school.name || 'Unnamed School'}</h4>
                      <p className="text-xs text-gray-600">{school.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {school.created_at ? new Date(school.created_at).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-3">No schools created yet</p>
              <p className="text-gray-500 text-xs mb-4">Start building your educational network</p>
              <Button onClick={() => onModalOpen('schools')} variant="outline">
                Create School
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced User Role Breakdown */}
      {userStats.totalUsers > 0 && (
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                <Users className="h-4 w-4 text-white" />
              </div>
              User Role Distribution
              {usersLoading && <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />}
            </CardTitle>
            <CardDescription>
              Active user breakdown across all educational institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(userStats.roleBreakdown).map(([role, count], index) => {
                const gradients = [
                  'from-blue-500 to-blue-600',
                  'from-emerald-500 to-emerald-600',
                  'from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600'
                ];
                const bgGradients = [
                  'from-blue-50 to-blue-100',
                  'from-emerald-50 to-emerald-100', 
                  'from-purple-50 to-purple-100',
                  'from-orange-50 to-orange-100'
                ];
                return (
                  <div key={role} className={`text-center p-4 bg-gradient-to-br ${bgGradients[index % 4]} rounded-lg hover:shadow-md transition-all duration-200 group border`}>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradients[index % 4]} w-fit mx-auto mb-2 group-hover:scale-105 transition-transform duration-200`}>
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{count as number}</p>
                    <p className="text-xs text-gray-600 capitalize font-medium">{role.replace('_', ' ')}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Error Display */}
      {(schoolsError || usersError) && !(schoolsError && usersError) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Partial Data Loading Issue</span>
            </div>
            <div className="mt-2 text-sm text-yellow-600">
              {schoolsError && <p>Schools: {schoolsError.message}</p>}
              {usersError && <p>Users: {usersError.message}</p>}
            </div>
            <Button onClick={handleRetryAll} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Failed Requests
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EduFamAdminDashboard;
