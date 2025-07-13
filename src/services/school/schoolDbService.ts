
import { supabase } from '@/integrations/supabase/client';
import { SchoolData } from '@/types/schoolTypes';

export interface CreateSchoolData {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  school_type?: string;
  registration_number?: string;
  year_established?: number;
  term_structure?: string;
  owner_information?: string;
}

export interface CreateSchoolResponse {
  success: boolean;
  school_id?: string;
  error?: string;
  message?: string;
}

/**
 * Creates a new school in the database
 */
export async function createSchool(schoolData: CreateSchoolData): Promise<CreateSchoolResponse> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .insert([schoolData])
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      school_id: data.id,
      message: 'School created successfully'
    };
  } catch (error) {
    console.error('Unexpected error creating school:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Updates an existing school in the database
 */
export async function updateSchool(schoolId: string, updates: Partial<CreateSchoolData>): Promise<CreateSchoolResponse> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', schoolId)
      .select()
      .single();

    if (error) {
      console.error('Error updating school:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      school_id: data.id,
      message: 'School updated successfully'
    };
  } catch (error) {
    console.error('Unexpected error updating school:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fetches a school by ID
 */
export async function getSchool(schoolId: string): Promise<SchoolData | null> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (error) {
      console.error('Error fetching school:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching school:', error);
    return null;
  }
}

/**
 * Fetches all schools
 */
export async function getAllSchools(): Promise<SchoolData[]> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching schools:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching schools:', error);
    return [];
  }
}

/**
 * Deletes a school by ID
 */
export async function deleteSchool(schoolId: string): Promise<CreateSchoolResponse> {
  try {
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', schoolId);

    if (error) {
      console.error('Error deleting school:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: 'School deleted successfully'
    };
  } catch (error) {
    console.error('Unexpected error deleting school:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
