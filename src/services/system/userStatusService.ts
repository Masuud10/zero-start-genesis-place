
import { supabase } from '@/integrations/supabase/client';

export interface UpdateUserStatusResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class UserStatusService {
  static async updateUserStatus(userId: string, newStatus: 'active' | 'inactive'): Promise<UpdateUserStatusResponse> {
    try {
      console.log(`🔄 Updating user status: ${userId} to ${newStatus}`);
      
      // Call the edge function for updating user status
      const { data, error } = await supabase.functions.invoke('update_user_status', {
        body: {
          target_user_id: userId,
          new_status: newStatus
        }
      });

      if (error) {
        console.error('❌ Error calling update_user_status function:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to update user status' 
        };
      }

      if (data?.success) {
        console.log('✅ User status updated successfully:', data);
        return { 
          success: true, 
          message: data.message || 'User status updated successfully' 
        };
      } else {
        console.error('❌ Function returned error:', data);
        return { 
          success: false, 
          error: data?.error || 'Failed to update user status' 
        };
      }
    } catch (error: any) {
      console.error('❌ Unexpected error in updateUserStatus:', error);
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
        isSystemAdmin,
        schoolId: profile.school_id
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
