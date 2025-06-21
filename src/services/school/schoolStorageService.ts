
import { supabase } from '@/integrations/supabase/client';

export class SchoolStorageService {
  static async uploadSchoolLogo(file: File, schoolId: string): Promise<{ url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `school-logos/${schoolId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('school-assets')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Logo upload error:', uploadError);
        return { error: 'Failed to upload logo' };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('school-assets')
        .getPublicUrl(fileName);

      return { url: publicUrl };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to upload logo';
      console.error('Logo upload service error:', error);
      return { error: errorMessage };
    }
  }
}
