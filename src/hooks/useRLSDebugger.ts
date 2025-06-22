
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface PermissionResult {
  canRead: boolean;
  error?: string;
  data?: any;
  count?: number;
}

interface RLSResults {
  userInfo: {
    id: string;
    email?: string;
    role?: string;
    school_id?: string;
  };
  permissions: Record<string, PermissionResult>;
  errors: string[];
}

export const useRLSDebugger = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rls-debugger', user?.id],
    queryFn: async (): Promise<RLSResults | null> => {
      if (!user) return null;

      const results: RLSResults = {
        userInfo: {
          id: user.id,
          email: user.email,
          role: user.role,
          school_id: user.school_id
        },
        permissions: {},
        errors: []
      };

      // Test basic profile access
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        results.permissions.profiles = {
          canRead: !profileError,
          error: profileError?.message,
          data: profile
        };
      } catch (err: any) {
        results.errors.push(`Profile access: ${err.message}`);
        results.permissions.profiles = {
          canRead: false,
          error: err.message
        };
      }

      // Test school access
      if (user.school_id) {
        try {
          const { data: school, error: schoolError } = await supabase
            .from('schools')
            .select('id, name')
            .eq('id', user.school_id)
            .single();

          results.permissions.schools = {
            canRead: !schoolError,
            error: schoolError?.message,
            data: school
          };
        } catch (err: any) {
          results.errors.push(`School access: ${err.message}`);
          results.permissions.schools = {
            canRead: false,
            error: err.message
          };
        }
      }

      // Test students access
      try {
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id, name, school_id')
          .limit(5);

        results.permissions.students = {
          canRead: !studentsError,
          error: studentsError?.message,
          count: students?.length || 0
        };
      } catch (err: any) {
        results.errors.push(`Students access: ${err.message}`);
        results.permissions.students = {
          canRead: false,
          error: err.message,
          count: 0
        };
      }

      return results;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });
};
