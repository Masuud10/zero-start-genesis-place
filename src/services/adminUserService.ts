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
      // Call the 'create_admin_user' RPC function for secure, server-side user creation
      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: params.email,
        user_password: params.password,
        user_name: params.name,
        user_role: params.role,
        user_school_id: params.school_id || null,
      });

      if (error) {
        console.error('Error calling create_admin_user RPC:', error);
        return { error: error.message };
      }

      // The RPC returns a JSONB object, which we parse here
      if (data && data.error) {
        console.error('Error from create_admin_user RPC:', data.error);
        return { error: data.error };
      }
      
      if (data && data.success) {
        return {
          success: true,
          // The RPC returns the user ID. We can form a partial user object for the client.
          data: { id: data.user_id, email: params.email }, 
          user_id: data.user_id,
          error: null,
        };
      }

      return { error: 'Unknown response from user creation function.' };

    } catch (error: any) {
      console.error('Unexpected error in createUser:', error);
      return { error: error.message || 'Unknown error occurred' };
    }
  },

  getUsersForSchool: async () => {
    try {
      // Use correct join for school (avoid ambiguous embed error)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          school_id,
          created_at,
          updated_at,
          school:schools!fk_profiles_school(
            id, name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Unexpected error in getUsersForSchool:', error);
      return { data: null, error };
    }
  },

  getCurrentUserPermissions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          canCreateUsers: false,
          canManageSchools: false,
          canViewAnalytics: false,
          userRole: null,
          schoolId: null,
          isSystemAdmin: false,
          isSchoolAdmin: false
        };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        return {
          canCreateUsers: false,
          canManageSchools: false,
          canViewAnalytics: false,
          userRole: null,
          schoolId: null,
          isSystemAdmin: false,
          isSchoolAdmin: false
        };
      }

      const isSystemAdmin = ['elimisha_admin', 'edufam_admin'].includes(profile.role);
      const isSchoolAdmin = ['school_owner', 'principal'].includes(profile.role);

      return {
        canCreateUsers: isSystemAdmin || isSchoolAdmin,
        canManageSchools: isSystemAdmin,
        canViewAnalytics: isSystemAdmin || isSchoolAdmin,
        userRole: profile.role,
        schoolId: profile.school_id,
        isSystemAdmin,
        isSchoolAdmin
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return {
        canCreateUsers: false,
        canManageSchools: false,
        canViewAnalytics: false,
        userRole: null,
        schoolId: null,
        isSystemAdmin: false,
        isSchoolAdmin: false
      };
    }
  }
};
