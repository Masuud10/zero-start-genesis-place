import { supabase } from '@/integrations/supabase/client';
import { 
  SupportStaff, 
  CreateSupportStaffData, 
  UpdateSupportStaffData, 
  SupportStaffFilters 
} from '@/types/supportStaff';

export class SupportStaffService {
  static async getSupportStaff(filters?: SupportStaffFilters): Promise<SupportStaff[]> {
    let query = supabase
      .from('support_staff')
      .select(`
        *,
        supervisor:supervisor_id(id, name, role)
      `)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.role_title) {
        query = query.eq('role_title', filters.role_title);
      }
      if (filters.employment_type) {
        query = query.eq('employment_type', filters.employment_type);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch support staff: ${error.message}`);
    }

    return (data || []) as unknown as SupportStaff[];
  }

  static async getSupportStaffById(id: string): Promise<SupportStaff> {
    const { data, error } = await supabase
      .from('support_staff')
      .select(`
        *,
        supervisor:supervisor_id(id, name, role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch support staff: ${error.message}`);
    }

    return data as unknown as SupportStaff;
  }

  static async createSupportStaff(staffData: CreateSupportStaffData): Promise<SupportStaff> {
    let profilePhotoUrl: string | undefined;

    // Upload profile photo if provided
    if (staffData.profile_photo) {
      profilePhotoUrl = await this.uploadProfilePhoto(staffData.profile_photo);
    }

    const { profile_photo, ...dataToInsert } = staffData;
    
    // Get current user's school_id
    const schoolId = await this.getCurrentUserSchoolId();
    
    const insertData = {
      ...dataToInsert,
      school_id: schoolId,
      profile_photo_url: profilePhotoUrl,
      salary_currency: staffData.salary_currency || 'KES'
    };

    const { data, error } = await supabase
      .from('support_staff')
      .insert(insertData)
      .select(`
        *,
        supervisor:supervisor_id(id, name, role)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create support staff: ${error.message}`);
    }

    return data as unknown as SupportStaff;
  }

  static async updateSupportStaff(id: string, staffData: UpdateSupportStaffData): Promise<SupportStaff> {
    let profilePhotoUrl: string | undefined;

    // Upload new profile photo if provided
    if (staffData.profile_photo) {
      profilePhotoUrl = await this.uploadProfilePhoto(staffData.profile_photo);
    }

    const { profile_photo, ...dataToUpdate } = staffData;
    
    const updateData = {
      ...dataToUpdate,
      ...(profilePhotoUrl && { profile_photo_url: profilePhotoUrl })
    };

    const { data, error } = await supabase
      .from('support_staff')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        supervisor:supervisor_id(id, name, role)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update support staff: ${error.message}`);
    }

    return data as unknown as SupportStaff;
  }

  static async deleteSupportStaff(id: string): Promise<void> {
    const { error } = await supabase
      .from('support_staff')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete support staff: ${error.message}`);
    }
  }

  static async archiveSupportStaff(id: string): Promise<SupportStaff> {
    return this.updateSupportStaff(id, { is_active: false });
  }

  static async reactivateSupportStaff(id: string): Promise<SupportStaff> {
    return this.updateSupportStaff(id, { is_active: true });
  }

  private static async uploadProfilePhoto(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('support-staff-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('support-staff-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  static async getSupervisors(): Promise<{ id: string; name: string; role: string }[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .in('role', ['principal', 'school_owner', 'teacher', 'hr'])
      .eq('school_id', await this.getCurrentUserSchoolId());

    if (error) {
      throw new Error(`Failed to fetch supervisors: ${error.message}`);
    }

    return data || [];
  }

  private static async getCurrentUserSchoolId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (error || !data?.school_id) {
      throw new Error('Failed to get user school');
    }

    return data.school_id;
  }

  static getStaffCountByRole(staffList: SupportStaff[]): Record<string, number> {
    return staffList.reduce((acc, staff) => {
      acc[staff.role_title] = (acc[staff.role_title] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  static getActiveStaffCount(staffList: SupportStaff[]): number {
    return staffList.filter(staff => staff.is_active).length;
  }

  static getStaffByEmploymentType(staffList: SupportStaff[], type: string): SupportStaff[] {
    return staffList.filter(staff => staff.employment_type === type);
  }
}