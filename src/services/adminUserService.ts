
import { supabase } from '@/integrations/supabase/client';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  school_id?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user_id?: string;
  school_id?: string;
  message?: string;
  error?: string;
}

export class AdminUserService {
  static async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      console.log('👤 AdminUserService: Creating user', userData);

      // Get current user scope for multi-tenancy validation
      const scope = await MultiTenantUtils.getCurrentUserScope();
      
      if (!scope.userId) {
        throw new Error('Authentication required');
      }

      // Validate permissions
      if (!['elimisha_admin', 'edufam_admin', 'school_owner', 'principal'].includes(scope.userRole || '')) {
        throw new Error('Insufficient permissions to create users');
      }

      // For school-level admins, ensure they can only create users in their school
      let targetSchoolId = userData.school_id;
      if (!scope.isSystemAdmin) {
        if (!scope.schoolId) {
          throw new Error('School assignment required');
        }
        targetSchoolId = scope.schoolId; // Force school-level users to create users in their own school
      }

      // Use the database function to create the user
      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_name: userData.name,
        user_role: userData.role,
        user_school_id: targetSchoolId || null
      });

      if (error) {
        console.error('👤 AdminUserService: Database function error:', error);
        throw error;
      }

      // Handle the JSONB response
      if (data && typeof data === 'object' && data !== null) {
        const result = data as Record<string, any>;
        
        if ('error' in result && typeof result.error === 'string') {
          console.error('👤 AdminUserService: Function returned error:', result.error);
          return {
            success: false,
            error: result.error
          };
        }

        if ('success' in result && result.success === true) {
          console.log('👤 AdminUserService: User created successfully:', result);
          return {
            success: true,
            user_id: typeof result.user_id === 'string' ? result.user_id : undefined,
            school_id: typeof result.school_id === 'string' ? result.school_id : undefined,
            message: typeof result.message === 'string' ? result.message : 'User created successfully'
          };
        }
      }

      return {
        success: false,
        error: 'Unexpected response from server'
      };

    } catch (error: any) {
      console.error('👤 AdminUserService: Service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }

  static async getUsersForSchool() {
    try {
      console.log('👤 AdminUserService: Fetching users for current school');

      const scope = await MultiTenantUtils.getCurrentUserScope();
      
      if (!scope.userId) {
        throw new Error('Authentication required');
      }

      // Build query based on user scope
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          role,
          school_id,
          created_at,
          updated_at,
          school:schools(name)
        `);

      // Apply school filtering for non-system admins
      if (!scope.isSystemAdmin && scope.schoolId) {
        query = query.eq('school_id', scope.schoolId);
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('👤 AdminUserService: Error fetching users:', error);
        throw error;
      }

      console.log('👤 AdminUserService: Successfully fetched users:', data?.length || 0);
      return { data, error: null };

    } catch (error) {
      console.error('👤 AdminUserService: Service error:', error);
      return { data: null, error };
    }
  }

  static async updateUserRole(userId: string, newRole: string) {
    try {
      console.log('👤 AdminUserService: Updating user role:', { userId, newRole });

      const scope = await MultiTenantUtils.getCurrentUserScope();
      
      if (!scope.userId) {
        throw new Error('Authentication required');
      }

      // Only system admins can update roles
      if (!scope.isSystemAdmin) {
        throw new Error('Only system administrators can update user roles');
      }

      // Use the database function to update the role
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) {
        console.error('👤 AdminUserService: Role update error:', error);
        throw error;
      }

      console.log('👤 AdminUserService: Role updated successfully');
      return { success: true, error: null };

    } catch (error: any) {
      console.error('👤 AdminUserService: Service error:', error);
      return { success: false, error: error.message || 'Failed to update role' };
    }
  }

  static async deleteUser(userId: string) {
    try {
      console.log('👤 AdminUserService: Deleting user:', userId);

      const scope = await MultiTenantUtils.getCurrentUserScope();
      
      if (!scope.userId) {
        throw new Error('Authentication required');
      }

      // Check permissions - only system admins or school admins can delete users
      if (!['elimisha_admin', 'edufam_admin', 'school_owner', 'principal'].includes(scope.userRole || '')) {
        throw new Error('Insufficient permissions to delete users');
      }

      // For school-level admins, ensure they can only delete users from their school
      if (!scope.isSystemAdmin) {
        const { data: userToDelete, error: fetchError } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', userId)
          .single();

        if (fetchError) {
          throw new Error('User not found');
        }

        if (userToDelete.school_id !== scope.schoolId) {
          throw new Error('Cannot delete users from other schools');
        }
      }

      // Delete from profiles table (this will cascade to related tables)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('👤 AdminUserService: Delete error:', error);
        throw error;
      }

      console.log('👤 AdminUserService: User deleted successfully');
      return { success: true, error: null };

    } catch (error: any) {
      console.error('👤 AdminUserService: Service error:', error);
      return { success: false, error: error.message || 'Failed to delete user' };
    }
  }
}
