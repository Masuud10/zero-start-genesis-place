
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
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: 'Failed to create user' };
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
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Try to clean up the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { error: profileError.message };
      }

      return { 
        success: true, 
        data: authData.user, 
        user_id: authData.user.id,
        error: null 
      };
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
