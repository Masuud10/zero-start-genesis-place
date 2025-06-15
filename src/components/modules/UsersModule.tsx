import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { AdminUserService } from '@/services/adminUserService';
import UserStatsCards from './users/UserStatsCards';
import CreateUserDialog from './users/CreateUserDialog';
import UsersFilter from './users/UsersFilter';
import UsersTable from './users/UsersTable';
import { Button } from '@/components/ui/button';
import { UserPlus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UsersModuleProps {
  onDataChanged?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  school_id?: string;
  school?: {
    name: string;
  };
}

const UsersModule: React.FC<UsersModuleProps> = ({ onDataChanged }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSystemAdmin, getCurrentSchoolId, validateSchoolAccess } = useSchoolScopedData();

  console.log('🔍 UsersModule: Current user state:', {
    user: user,
    userRole: user?.role,
    userEmail: user?.email,
    isSystemAdmin,
    schoolId: getCurrentSchoolId()
  });

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 UsersModule: Fetching users for role:', user?.role, 'isSystemAdmin:', isSystemAdmin);

      // Check if user has permission to view users
      if (!user || !['elimisha_admin', 'edufam_admin', 'school_owner', 'principal'].includes(user.role)) {
        throw new Error('You do not have permission to view users');
      }

      // Use AdminUserService for better multi-tenant support
      const { data, error: fetchError } = await AdminUserService.getUsersForSchool();

      if (fetchError) {
        console.error('🔍 UsersModule: Fetch error:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.warn('🔍 UsersModule: No data returned from service');
        setUsers([]);
        return;
      }

      console.log('🔍 UsersModule: Raw data from service:', data);
      
      // Transform the data to match our User interface
      const transformedUsers: User[] = data.map((profile: any) => {
        let schoolInfo: { name: string } | undefined = undefined;
        
        // Handle school data - it can come as null, object, or array
        if (profile.school) {
          if (Array.isArray(profile.school)) {
            // If school is an array, take the first element
            schoolInfo = profile.school.length > 0 ? { name: profile.school[0].name } : undefined;
          } else if (profile.school && typeof profile.school === 'object' && profile.school.name) {
            // If school is already an object with name property
            schoolInfo = { name: profile.school.name };
          }
        }
        
        return {
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          role: profile.role || '',
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || '',
          school_id: profile.school_id || undefined,
          school: schoolInfo
        };
      });
      
      // Additional filtering for non-system admins
      const finalUsers = isSystemAdmin ? transformedUsers : transformedUsers.filter(u => {
        const userSchoolId = getCurrentSchoolId();
        return userSchoolId && u.school_id === userSchoolId;
      });
      
      console.log('🔍 UsersModule: Final filtered users:', finalUsers);
      setUsers(finalUsers);

      if (onDataChanged) onDataChanged(); // Notify parent dashboard after fetch/refresh

    } catch (error: any) {
      console.error('🔍 UsersModule: Error in fetchUsers:', {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        cause: error?.cause
      });
      
      const errorMessage = error?.message || 'Unknown error occurred while fetching users';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: `Failed to fetch users: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Check if user can add users - simplified logic
  const canAddUsers = user && (
    user.role === 'elimisha_admin' || 
    user.role === 'edufam_admin' || 
    user.role === 'school_owner' || 
    user.role === 'principal'
  );
  
  console.log('👤 UsersModule: Permission check:', {
    userRole: user?.role,
    canAddUsers,
    userEmail: user?.email
  });

  // Permission check - show error if user doesn't have access
  if (user && !['elimisha_admin', 'edufam_admin', 'school_owner', 'principal'].includes(user.role)) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to access user management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Only school owners, principals, and system administrators can manage users.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground">
            {isSystemAdmin 
              ? 'Manage all users across the Elimisha platform'
              : 'Manage users in your school'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {canAddUsers && (
            <CreateUserDialog onUserCreated={fetchUsers}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </CreateUserDialog>
          )}
        </div>
      </div>

      <UserStatsCards users={users} />

      <UsersFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      <UsersTable 
        users={filteredUsers} 
        loading={loading} 
        error={error}
        onRetry={fetchUsers}
      />
    </div>
  );
};

export default UsersModule;
