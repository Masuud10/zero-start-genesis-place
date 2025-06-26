
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  school_type?: string;
  curriculum_type?: string;
  term_structure?: string;
  registration_number?: string;
  year_established?: number;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  owner_information?: string;
  principal_name?: string;
  principal_contact?: string;
  principal_email?: string;
  status?: string;
  subscription_plan?: string;
  max_students?: number;
  timezone?: string;
  owner_id?: string;
  principal_id?: string;
  created_at: string;
  updated_at: string;
}

export const useSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async (): Promise<School[]> => {
      console.log('🏫 Fetching schools data...');
      
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          school_type,
          curriculum_type,
          term_structure,
          registration_number,
          year_established,
          logo_url,
          website_url,
          motto,
          slogan,
          owner_information,
          principal_name,
          principal_contact,
          principal_email,
          status,
          subscription_plan,
          max_students,
          timezone,
          owner_id,
          principal_id,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🏫 Error fetching schools:', error);
        throw error;
      }

      console.log('🏫 Schools data fetched:', data);
      return data || [];
    },
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
          curriculum_type,
          term_structure,
          registration_number,
          year_established,
          logo_url,
          website_url,
          motto,
          slogan,
          owner_information,
          principal_name,
          principal_contact,
          principal_email,
          status,
          subscription_plan,
          max_students,
          timezone,
          owner_id,
          principal_id,
          created_at,
          updated_at
        `)
        .eq('id', schoolId)
        .single();

      if (error) {
        console.error('🏫 Error fetching school:', error);
        throw error;
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
    mutationFn: async (schoolData: any) => {
      console.log('🏫 Creating school via RPC:', schoolData);
      
      const { data, error } = await supabase.rpc('create_comprehensive_school', schoolData);

      if (error) {
        console.error('🏫 RPC Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (result) => {
      console.log('🏫 School creation successful:', result);
      
      if (result?.success) {
        toast({
          title: "Success",
          description: result.message || "School created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['schools'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      } else {
        toast({
          title: "Error",
          description: result?.error || "Failed to create school",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('🏫 School creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create school",
        variant: "destructive",
      });
    },
  });
};
