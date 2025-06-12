
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import UserStatsCards from './users/UserStatsCards';
import CreateUserDialog from './users/CreateUserDialog';
import UsersFilter from './users/UsersFilter';
import UsersTable from './users/UsersTable';

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

const UsersModule = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();
  const { user } = useAuth();
  const { createSchoolScopedQuery, isSystemAdmin } = useSchoolScopedData();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let query = createSchoolScopedQuery('profiles', `
        *,
        school:schools(name)
      `).order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      console.log('Fetched users with school data:', data);
      
      // Transform the data to match our User interface
      const transformedUsers: User[] = (data || []).map((profile: any) => {
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
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users data",
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
        <CreateUserDialog onUserCreated={fetchUsers} />
      </div>

      <UserStatsCards users={users} />

      <UsersFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      <UsersTable users={filteredUsers} loading={loading} />
    </div>
  );
};

export default UsersModule;
