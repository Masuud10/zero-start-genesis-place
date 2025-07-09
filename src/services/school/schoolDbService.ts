
import { supabase } from '@/integrations/supabase/client';
import { CreateSchoolRequest, CreateSchoolRpcResult, SchoolData } from '@/types/schoolTypes';

export class SchoolDbService {
  static async checkRegistrationNumberUnique(registrationNumber: string): Promise<boolean> {
    const { data: existingSchool, error: checkError } = await supabase
      .from('schools')
      .select('id')
      .eq('registration_number', registrationNumber)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    return !existingSchool;
  }

  static async createComprehensiveSchool(schoolData: any): Promise<CreateSchoolRpcResult> {
    console.log('🏫 SchoolDbService: Creating comprehensive school:', schoolData);
    
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_comprehensive_school', schoolData);

    if (rpcError) {
      console.error('🏫 SchoolDbService: Database function error:', rpcError);
      throw rpcError;
    }

    console.log('🏫 SchoolDbService: Success result:', rpcData);
    return rpcData as CreateSchoolRpcResult;
  }

  static async createSchoolWithRpc(schoolData: CreateSchoolRequest): Promise<CreateSchoolRpcResult> {
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_school', {
      school_name: schoolData.name,
      school_email: schoolData.email,
      school_phone: schoolData.phone,
      school_address: schoolData.address,
      owner_email: schoolData.ownerEmail || null,
      owner_name: schoolData.ownerName || null
    });

    if (rpcError) {
      console.error('🏫 SchoolDbService: Database function error:', rpcError);
      throw rpcError;
    }

    return rpcData as CreateSchoolRpcResult;
  }

  static async updateSchoolAdditionalFields(schoolId: string, schoolData: CreateSchoolRequest): Promise<void> {
    const updateData: Record<string, any> = {};
    
    if (schoolData.logo_url) updateData.logo_url = schoolData.logo_url;
    if (schoolData.website_url) updateData.website_url = schoolData.website_url;
    if (schoolData.motto) updateData.motto = schoolData.motto;
    if (schoolData.slogan) updateData.slogan = schoolData.slogan;
    if (schoolData.registration_number) updateData.registration_number = schoolData.registration_number;
    if (schoolData.year_established) updateData.year_established = schoolData.year_established;
    if (schoolData.term_structure) updateData.term_structure = schoolData.term_structure;
    if (schoolData.owner_information) updateData.owner_information = schoolData.owner_information;
    // curriculum_type is now handled at class level, not school level
    
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('schools')
        .update(updateData)
        .eq('id', schoolId);
        
      if (updateError) {
        console.warn('🏫 SchoolDbService: Failed to update additional fields:', updateError);
      }
    }
  }

  static async getAllSchools(): Promise<{ data: SchoolData[] | null; error: any }> {
    try {
      console.log('🏫 SchoolDbService: Fetching all schools...');
      
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          logo_url,
          website_url,
          motto,
          slogan,
          registration_number,
          year_established,
          term_structure,
          owner_information,
          school_type,
          status,
          created_at,
          updated_at,
          owner_id,
          location
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🏫 SchoolDbService: Error fetching schools:', error);
        return { data: null, error };
      }

      console.log('🏫 SchoolDbService: Schools fetched:', data?.length || 0);
      const schoolsData = (data || []) as SchoolData[];
      return { data: schoolsData, error: null };
    } catch (error) {
      console.error('🏫 SchoolDbService: Service error:', error);
      return { data: null, error };
    }
  }

  static async getSchoolById(schoolId: string): Promise<{ data: SchoolData | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          logo_url,
          website_url,
          motto,
          slogan,
          registration_number,
          year_established,
          term_structure,
          owner_information,
          school_type,
          status,
          created_at,
          updated_at,
          owner_id,
          location
        `)
        .eq('id', schoolId)
        .single();

      if (error) {
        console.error('🏫 SchoolDbService: Error fetching school:', error);
        return { data: null, error };
      }

      const schoolData = data as SchoolData;
      return { data: schoolData, error: null };
    } catch (error) {
      console.error('🏫 SchoolDbService: Service error:', error);
      return { data: null, error };
    }
  }
}
