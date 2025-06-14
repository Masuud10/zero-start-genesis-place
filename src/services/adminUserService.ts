import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role: string;
  school_id?: string;
}

export const AdminUserService = {
  createUser: async (params: CreateUserParams) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: params.email,
        password: params.password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return { error: authError };
      }

      if (!authData.user) {
        return { error: new Error('Failed to create user') };
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: params.name,
          email: params.email,
          role: params.role,
          school_id: params.school_id || null,
          is_active: true,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Try to clean up the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { error: profileError };
      }

      return { data: authData.user, error: null };
    } catch (error) {
      console.error('Unexpected error in createUser:', error);
      return { error };
    }
  },

  getCurrentUserPermissions: () => {
    // This is a placeholder method for user permissions
    // In a real implementation, this would check the current user's role and return permissions
    return {
      canCreateUsers: true,
      canManageSchools: false,
      canViewAnalytics: true
    };
  }
};
