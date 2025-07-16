import { supabase } from '@/integrations/supabase/client';

interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role: string;
  school_id?: string;
}

// Define the expected response shape from the 'create-user' edge function
interface CreateUserRpcResponse {
  error?: string;
  success?: boolean;
  user_id?: string;
}

interface UpdateUserStatusResponse {
  success?: boolean;
  message?: string;
  error?: string;
  user_email?: string;
  new_status?: string;
}

export const AdminUserService = {
  createUser: async (params: CreateUserParams) => {
    try {
      // Validate input parameters
      if (!params.email || !params.password || !params.name || !params.role) {
        return { error: 'Missing required fields: email, password, name, and role are required' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(params.email)) {
        return { error: 'Invalid email format' };
      }

      // Validate password strength
      if (params.password.length < 8) {
        return { error: 'Password must be at least 8 characters long' };
      }

      // Validate role
      const validRoles = ['school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin'];
      if (!validRoles.includes(params.role)) {
        return { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` };
      }

      // Validate school_id format if provided
      if (params.school_id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(params.school_id)) {
          return { error: 'Invalid school ID format' };
        }
      }

      console.log('AdminUserService.createUser called with validated params:', {
        email: params.email,
        name: params.name,
        role: params.role,
        school_id: params.school_id
      });

      // Call the 'create-user' edge function for proper auth setup
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: params.email,
          password: params.password,
          name: params.name,
          role: params.role,
          school_id: params.school_id || null,
        }
      });

      if (error) {
        console.error('Error calling create-user edge function:', error);
        return { 
          error: error.message || 'Database error occurred while creating user',
          details: error 
        };
      }

      // The RPC returns a JSONB object, which we cast to our interface for type safety
      const rpcData = data as CreateUserRpcResponse;

      if (rpcData && rpcData.error) {
        console.error('Error from create-user edge function:', rpcData.error);
        return { error: rpcData.error };
      }
      
      if (rpcData && rpcData.success && rpcData.user_id) {
        console.log('User created successfully:', rpcData.user_id);
        return {
          success: true,
          data: { id: rpcData.user_id, email: params.email },
          user_id: rpcData.user_id,
          error: null,
        };
      }

      return { error: 'Unexpected response format from user creation function' };

    } catch (error) {
      console.error('Unexpected error in createUser:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { 
        error: `Failed to create user: ${errorMessage}`,
        details: error 
      };
    }
  },

  getUsersForSchool: async () => {
    try {
      // Use correct join for school (avoid ambiguous embed error) and include status
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          status,
          school_id,
          created_at,
          updated_at,
          phone,
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
    } catch (error) {
      console.error('Unexpected error in getUsersForSchool:', error);
      return { data: null, error };
    }
  },

  updateUserStatus: async (userId: string, status: string) => {
    try {
      const { data, error } = await supabase.rpc('update_user_status', {
        target_user_id: userId,
        new_status: status
      });

      if (error) {
        console.error('Error updating user status:', error);
        return { success: false, error: error.message };
      }

      // Type assertion for the response
      const response = data as UpdateUserStatusResponse;

      if (response?.success) {
        return { success: true, message: response.message };
      } else {
        return { success: false, error: response?.error || 'Failed to update user status' };
      }
    } catch (error) {
      console.error('Unexpected error in updateUserStatus:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
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
      const isSchoolAdmin = ['school_director', 'principal'].includes(profile.role);

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
