
import { supabase } from '@/integrations/supabase/client';

export interface UpdateUserStatusResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class UserStatusService {
  static async updateUserStatus(userId: string, newStatus: 'active' | 'inactive'): Promise<UpdateUserStatusResponse> {
    try {
      // Call the RPC function for updating user status
      const { data, error } = await supabase.rpc('update_user_status', {
        target_user_id: userId,
        new_status: newStatus
      });

      if (error) {
        console.error('Error updating user status:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to update user status' 
        };
      }

      // Type assertion for the response
      const response = data as { success?: boolean; message?: string; error?: string };

      if (response?.success) {
        return { 
          success: true, 
          message: response.message || 'User status updated successfully' 
        };
      } else {
        return { 
          success: false, 
          error: response?.error || 'Failed to update user status' 
        };
      }
    } catch (error: any) {
      console.error('Unexpected error in updateUserStatus:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }
  }

  static async getCurrentUserPermissions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          canManageUsers: false,
          userRole: null,
          isSystemAdmin: false
        };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        return {
          canManageUsers: false,
          userRole: null,
          isSystemAdmin: false
        };
      }

      const isSystemAdmin = ['elimisha_admin', 'edufam_admin'].includes(profile.role);
      const canManageUsers = isSystemAdmin || ['school_owner', 'principal'].includes(profile.role);

      return {
        canManageUsers,
        userRole: profile.role,
        isSystemAdmin
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return {
        canManageUsers: false,
        userRole: null,
        isSystemAdmin: false
      };
    }
  }
}
