import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  location?: string;
  school_type?: string;
  term_structure?: string;
  registration_number?: string;
  year_established?: number;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  owner_information?: string;
  status?: string;
  owner_id?: string;
  curriculum_type?: string;
  created_at: string;
  updated_at: string;
}

interface SchoolCreationResult {
  success?: boolean;
  school_id?: string;
  owner_id?: string;
  principal_id?: string;
  message?: string;
  error?: string;
}

interface SchoolCreationData {
  school_name: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  school_type?: string;
  curriculum_type?: string;
  term_structure?: string;
  registration_number?: string;
  year_established?: number;
  website_url?: string;
  motto?: string;
  slogan?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  principal_name?: string;
  principal_email?: string;
  principal_phone?: string;
  mpesa_passkey?: string;
}

export const useSchools = (refreshKey = 0) => {
  return useQuery({
    queryKey: ['schools', refreshKey],
    queryFn: async (): Promise<School[]> => {
      console.log('🏫 Fetching schools data...');
      
      try {
        const { data, error } = await supabase
          .from('schools')
          .select(`
            id,
            name,
            email,
            phone,
            address,
            school_type,
            term_structure,
            registration_number,
            year_established,
            logo_url,
            website_url,
            motto,
            slogan,
            owner_information,
            status,
            owner_id,
            created_at,
            updated_at,
            curriculum_type,
            location
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('🏫 Error fetching schools:', error);
          throw new Error(`Failed to fetch schools: ${error.message}`);
        }

        console.log('🏫 Schools data fetched successfully:', data?.length || 0, 'schools');
        return data || [];
      } catch (error) {
        console.error('🏫 Unexpected error in useSchools:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useSchool = (schoolId: string) => {
  return useQuery({
    queryKey: ['school', schoolId],
    queryFn: async (): Promise<School> => {
      console.log('🏫 Fetching school data for ID:', schoolId);
      
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          school_type,
          term_structure,
          registration_number,
          year_established,
          logo_url,
          website_url,
          motto,
          slogan,
          owner_information,
          status,
          owner_id,
          created_at,
          updated_at,
          curriculum_type,
          location
        `)
        .eq('id', schoolId)
        .single();

      if (error) {
        console.error('🏫 Error fetching school:', error);
        throw new Error(`Failed to fetch school: ${error.message}`);
      }

      console.log('🏫 School data fetched:', data);
      return data;
    },
    enabled: !!schoolId,
  });
};

export const useCreateSchool = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schoolData: SchoolCreationData): Promise<SchoolCreationResult> => {
      console.log('🏫 Creating school via RPC:', schoolData);
      
      const { data, error } = await supabase.rpc('create_comprehensive_school', schoolData);

      if (error) {
        console.error('🏫 RPC Error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('🏫 RPC Response:', data);
      
      // Handle the response properly - cast to our expected type
      const result = data as SchoolCreationResult;
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from server');
      }

      return result;
    },
    onSuccess: (result) => {
      console.log('🏫 School creation successful:', result);
      
      if (result?.success) {
        toast({
          title: "School Registered Successfully",
          description: result.message || "School has been registered with complete setup",
        });
        
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['schools'] });
        queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        
        // Force a refetch to get the latest data
        queryClient.refetchQueries({ queryKey: ['schools'] });
      } else {
        toast({
          title: "Registration Failed",
          description: result?.error || "Failed to register school",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error('🏫 School creation error:', error);
      toast({
        title: "Registration Error",
        description: error.message || "An unexpected error occurred during school registration",
        variant: "destructive",
      });
    },
  });
};
