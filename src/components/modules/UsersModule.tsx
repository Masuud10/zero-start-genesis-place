import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          school:schools(name)
        `)
        .order('created_at', { ascending: false });

      // If user is not a system admin, only show users from their school
      if (user?.role !== 'elimisha_admin' && user?.role !== 'edufam_admin' && user?.school_id) {
        query = query.eq('school_id', user.school_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('Fetched users with school data:', data);
      
      // Transform the data to match our User interface
      const transformedUsers: User[] = (data || []).map(user => ({
        ...user,
        school: Array.isArray(user.school) && user.school.length > 0 ? user.school[0] : user.school || undefined
      }));
      
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
            {user?.role === 'elimisha_admin' || user?.role === 'edufam_admin' 
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
