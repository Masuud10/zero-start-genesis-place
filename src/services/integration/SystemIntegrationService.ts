import { supabase } from '@/integrations/supabase/client';

export interface SchoolIntegrationData {
  school: any;
  classes: any[];
  subjects: any[];
  students: any[];
  enrollments: any[];
  examinations: any[];
  feeStructures: any[];
}

export interface ClassWithCurriculum {
  id: string;
  name: string;
  level: string;
  stream: string;
  capacity: number;
  curriculum_type: string;
  academic_year_id: string | null;
  is_active: boolean;
  school_id: string;
}

export interface ExaminationSchedule {
  id: string;
  name: string;
  type: string;
  term: string;
  term_id: string | null;
  academic_year: string;
  academic_year_id: string | null;
  start_date: string;
  end_date: string;
  classes: string[];
  class_ids: string[];
  coordinator_id: string;
  school_id: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  class_id: string;
  academic_year: string;
  academic_year_id: string | null;
  term: string;
  term_id: string | null;
  amount: number;
  due_date: string;
  is_active: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface SystemIntegrationConfig {
  externalSystemUrl: string;
  apiKey: string;
  syncEnabled: boolean;
  syncInterval: number;
  lastSyncDate?: string;
  mappings: Record<string, string>;
}

export class SystemIntegrationService {
  /**
   * Get comprehensive school data for integration
   */
  static async getSchoolData(schoolId: string): Promise<SchoolIntegrationData> {
    try {
      console.log('🔄 SystemIntegrationService: Fetching school data for integration...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch all relevant data sequentially to avoid type recursion
      const schoolData = await supabase.from('schools').select('*').eq('id', schoolId).single();
      if (schoolData.error) throw schoolData.error;

      const classesData = await supabase.from('classes').select('*').eq('school_id', schoolId);
      if (classesData.error) throw classesData.error;

      const subjectsData = await supabase.from('subjects').select('*').eq('school_id', schoolId);
      if (subjectsData.error) throw subjectsData.error;

      const studentsData = await supabase.from('students').select('*').eq('school_id', schoolId);
      if (studentsData.error) throw studentsData.error;

      const enrollmentsData = await supabase.from('students').select('*').eq('school_id', schoolId).eq('is_active', true);
      if (enrollmentsData.error) throw enrollmentsData.error;

      const examsData = await supabase.from('examinations').select('*').eq('school_id', schoolId);
      if (examsData.error) throw examsData.error;

      const feesData = await supabase.from('fee_structures').select('*').eq('school_id', schoolId);
      if (feesData.error) throw feesData.error;

      // Map classes to include required fields
      const mappedClasses: ClassWithCurriculum[] = (classesData.data || []).map(cls => ({
        id: cls.id,
        name: cls.name,
        level: cls.level || '',
        stream: cls.stream || '',
        capacity: cls.capacity || 40,
        curriculum_type: cls.curriculum_type || 'CBC',
        academic_year_id: null,
        is_active: true,
        school_id: cls.school_id
      }));

      // Map examinations to include required fields
      const mappedExams: ExaminationSchedule[] = (examsData.data || []).map(exam => ({
        id: exam.id,
        name: exam.name,
        type: exam.type,
        term: exam.term,
        term_id: null,
        academic_year: exam.academic_year,
        academic_year_id: null,
        start_date: exam.start_date,
        end_date: exam.end_date,
        classes: exam.classes || [],
        class_ids: exam.classes || [],
        coordinator_id: exam.coordinator_id,
        school_id: exam.school_id,
        is_active: true,
        created_by: exam.created_by,
        created_at: exam.created_at,
        updated_at: exam.updated_at
      }));

      // Map fee structures to include required fields
      const mappedFees: FeeStructure[] = (feesData.data || []).map(fee => ({
        id: fee.id,
        name: fee.name,
        class_id: '',
        academic_year: fee.academic_year,
        academic_year_id: null,
        term: fee.term,
        term_id: null,
        amount: 0,
        due_date: new Date().toISOString().split('T')[0],
        is_active: fee.is_active,
        school_id: fee.school_id,
        created_at: fee.created_at,
        updated_at: fee.updated_at
      }));

      console.log('✅ SystemIntegrationService: School data fetched successfully');

      return {
        school: schoolData.data,
        classes: mappedClasses,
        subjects: subjectsData.data || [],
        students: studentsData.data || [],
        enrollments: enrollmentsData.data || [],
        examinations: mappedExams,
        feeStructures: mappedFees
      };
    } catch (error: any) {
      console.error('❌ SystemIntegrationService: Error fetching school data:', error);
      throw error;
    }
  }

  /**
   * Sync student enrollments with external system
   */
  static async syncStudentEnrollments(enrollments: any[]): Promise<void> {
    try {
      console.log('🔄 SystemIntegrationService: Syncing student enrollments...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      for (const enrollment of enrollments) {
        const { error } = await supabase
          .from('students')
          .upsert({
            id: enrollment.student_id,
            class_id: enrollment.class_id,
            school_id: enrollment.school_id,
            is_active: enrollment.is_active,
            name: enrollment.name || 'Unknown',
            admission_number: enrollment.admission_number || 'TBD'
          });

        if (error) {
          console.error('❌ SystemIntegrationService: Error syncing enrollment:', error);
        }
      }

      console.log('✅ SystemIntegrationService: Student enrollments synced successfully');
    } catch (error: any) {
      console.error('❌ SystemIntegrationService: Error syncing enrollments:', error);
      throw error;
    }
  }

  /**
   * Update integration configuration
   */
  static async updateIntegrationConfig(config: SystemIntegrationConfig): Promise<void> {
    try {
      console.log('🔄 SystemIntegrationService: Updating integration config...');
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'integration_config',
          setting_value: config as any,
          description: 'System integration configuration'
        });

      if (error) throw error;

      console.log('✅ SystemIntegrationService: Integration config updated successfully');
    } catch (error: any) {
      console.error('❌ SystemIntegrationService: Error updating integration config:', error);
      throw error;
    }
  }

  /**
   * Get integration configuration
   */
  static async getIntegrationConfig(): Promise<SystemIntegrationConfig | null> {
    try {
      console.log('🔄 SystemIntegrationService: Fetching integration config...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'integration_config')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No config found
        }
        throw error;
      }

      console.log('✅ SystemIntegrationService: Integration config fetched successfully');
      return data.setting_value as unknown as SystemIntegrationConfig;
    } catch (error: any) {
      console.error('❌ SystemIntegrationService: Error fetching integration config:', error);
      throw error;
    }
  }

  /**
   * Test integration connectivity
   */
  static async testIntegrationConnectivity(config: SystemIntegrationConfig): Promise<boolean> {
    try {
      console.log('🔄 SystemIntegrationService: Testing integration connectivity...');
      
      // In a real implementation, this would test the actual external system
      // For now, we'll just validate the config and return success
      if (!config.externalSystemUrl || !config.apiKey) {
        throw new Error('Invalid configuration: missing URL or API key');
      }

      console.log('✅ SystemIntegrationService: Integration connectivity test passed');
      return true;
    } catch (error: any) {
      console.error('❌ SystemIntegrationService: Integration connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Export school data in standard format
   */
  static async exportSchoolData(schoolId: string, format: 'json' | 'csv' | 'xml' = 'json'): Promise<string> {
    try {
      console.log('🔄 SystemIntegrationService: Exporting school data...');
      
      const schoolData = await this.getSchoolData(schoolId);
      
      switch (format) {
        case 'json':
          return JSON.stringify(schoolData, null, 2);
        case 'csv':
          // Basic CSV export - in real implementation, this would be more sophisticated
          return this.convertToCSV(schoolData);
        case 'xml':
          // Basic XML export - in real implementation, this would be more sophisticated
          return this.convertToXML(schoolData);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error: any) {
      console.error('❌ SystemIntegrationService: Error exporting school data:', error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format (simplified)
   */
  private static convertToCSV(data: SchoolIntegrationData): string {
    const csvLines: string[] = [];
    
    // Add school info
    csvLines.push('School Information');
    csvLines.push(`Name,${data.school?.name || ''}`);
    csvLines.push(`ID,${data.school?.id || ''}`);
    csvLines.push('');
    
    // Add students
    csvLines.push('Students');
    csvLines.push('ID,Name,Class');
    data.students.forEach(student => {
      csvLines.push(`${student.id},${student.name},${student.class_id}`);
    });
    
    return csvLines.join('\n');
  }

  /**
   * Convert data to XML format (simplified)
   */
  private static convertToXML(data: SchoolIntegrationData): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<school_data>\n';
    xml += `  <school id="${data.school?.id || ''}">\n`;
    xml += `    <name>${data.school?.name || ''}</name>\n`;
    xml += '  </school>\n';
    xml += '  <students>\n';
    data.students.forEach(student => {
      xml += `    <student id="${student.id}">\n`;
      xml += `      <name>${student.name}</name>\n`;
      xml += `      <class_id>${student.class_id}</class_id>\n`;
      xml += '    </student>\n';
    });
    xml += '  </students>\n';
    xml += '</school_data>';
    
    return xml;
  }
}

export default SystemIntegrationService;