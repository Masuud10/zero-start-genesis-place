import { supabase } from '../../integrations/supabase/client';
import { ApiCallWrapper, QueryOptimizer, UuidValidator } from '../../utils/apiOptimization';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  column: string;
  ascending?: boolean;
}

export interface FilterParams {
  [key: string]: string | number | boolean | null;
}

// Database entity interfaces
export interface School {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  registration_number?: string;
  year_established?: number;
  principal_name?: string;
  principal_contact?: string;
  principal_email?: string;
  owner_information?: Record<string, unknown>;
  school_type?: string;
  status?: string;
  subscription_plan?: string;
  max_students?: number;
  timezone?: string;
  term_structure?: Record<string, unknown>;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string;
  school_id?: string;
  school?: { id: string; name: string };
}

export interface Student {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  admission_number?: string;
  class_id?: string;
  parent_id?: string;
  school_id?: string;
  created_at?: string;
  updated_at?: string;
  class?: { id: string; name: string };
  parent?: { id: string; name: string; email: string };
  school?: { id: string; name: string };
}

export interface Class {
  id: string;
  name?: string;
  grade_level?: string;
  capacity?: number;
  academic_year?: string;
  curriculum_type?: string;
  school_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnalyticsData {
  [key: string]: unknown;
}

export interface ReportData {
  [key: string]: unknown;
}

export interface ReportHistory {
  id: string;
  report_type: string;
  created_by: string;
  created_at: string;
  status: string;
  [key: string]: unknown;
}

// RPC function parameter types
export interface CreateSchoolParams {
  school_name: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  school_type?: string;
  registration_number?: string;
  year_established?: number;
  principal_name?: string;
  principal_contact?: string;
  principal_email?: string;
  owner_information?: Record<string, unknown>;
  subscription_plan?: string;
  max_students?: number;
  timezone?: string;
  term_structure?: Record<string, unknown>;
  curriculum_type?: string;
}

export interface CreateUserParams {
  user_email: string;
  user_password: string;
  user_name: string;
  user_role?: string;
  user_school_id?: string;
}

export interface StudentInsertData {
  name: string;
  admission_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  class_id?: string;
  parent_id?: string;
  school_id?: string;
  address?: string;
  avatar_url?: string;
  emergency_contact?: string;
  enrollment_date?: string;
  [key: string]: unknown;
}

export interface ClassInsertData {
  name: string;
  grade_level?: string;
  capacity?: number;
  academic_year?: string;
  curriculum_type?: string;
  school_id?: string;
  academic_level?: string;
  class_type?: string;
  curriculum?: string;
  level?: string;
  room_number?: string;
  stream?: string;
  teacher_id?: string;
  year?: string;
  [key: string]: unknown;
}

// Type for RPC calls that may not be fully typed
export type RpcCall = (functionName: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;

// Type for Supabase client with RPC capabilities
export interface SupabaseWithRpc {
  rpc: RpcCall;
  from: (table: string) => {
    select: (columns: string) => any;
    eq: (column: string, value: string) => any;
    order: (column: string, options: { ascending: boolean }) => any;
    single: () => Promise<{ data: unknown; error: unknown }>;
  };
}

export class ApiService {
  /**
   * Generic fetch method with error handling
   */
  static async fetch<T>(
    operation: () => Promise<{ data: T | null; error: unknown }>,
    context: string
  ): Promise<ApiResponse<T>> {
    try {
      const result = await ApiCallWrapper.execute(operation, { context });
      return {
        data: result.data,
        error: result.error ? String(result.error) : null,
        success: !result.error
      };
    } catch (error) {
      console.error(`❌ ${context} error:`, error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Schools API
   */
  static schools = {
    async getAll(params?: PaginationParams & SortParams): Promise<ApiResponse<School[]>> {
      const startTime = Date.now();
      
      return this.fetch(async () => {
        let query = supabase
          .from('schools')
          .select(`
            id, 
            name, 
            email, 
            phone, 
            address, 
            location,
            created_at,
            updated_at,
            owner_id,
            logo_url,
            website_url,
            motto,
            slogan,
            registration_number,
            year_established,
            principal_name,
            principal_contact,
            principal_email,
            owner_information,
            school_type,
            status,
            subscription_plan,
            max_students,
            timezone,
            term_structure
          `);

        if (params?.column) {
          query = query.order(params.column, { ascending: params.ascending ?? false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        if (params?.limit) {
          query = query.limit(params.limit);
        }

        if (params?.offset) {
          query = query.range(params.offset, (params.offset + (params.limit || 10)) - 1);
        }

        const result = await query;
        QueryOptimizer.logSlowQuery('schools.getAll', startTime);
        return result;
      }, 'Fetch Schools');
    },

    async getById(id: string): Promise<ApiResponse<School>> {
      UuidValidator.validateAndThrow(id, 'School ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('id', id)
          .single();
        
        return { data, error };
      }, 'Fetch School by ID');
    },

    async create(schoolData: CreateSchoolParams): Promise<ApiResponse<School>> {
      return this.fetch(async () => {
        const { data, error } = await supabase.rpc('create_enhanced_school', schoolData);
        return { data, error };
      }, 'Create School');
    },

    async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse<School>> {
      UuidValidator.validateAndThrow(id, 'School ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('schools')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        return { data, error };
      }, 'Update School');
    },

    async delete(id: string): Promise<ApiResponse<boolean>> {
      UuidValidator.validateAndThrow(id, 'School ID');
      
      return this.fetch(async () => {
        const { error } = await supabase
          .from('schools')
          .delete()
          .eq('id', id);
        
        return { data: !error, error };
      }, 'Delete School');
    }
  };

  /**
   * Users API
   */
  static users = {
    async getAll(params?: PaginationParams & SortParams): Promise<ApiResponse<User[]>> {
      const startTime = Date.now();
      
      return this.fetch(async () => {
        let query = supabase
          .from('profiles')
          .select(`
            id, name, email, role, created_at, school_id,
            school:schools!fk_profiles_school(id, name)
          `);

        if (params?.column) {
          query = query.order(params.column, { ascending: params.ascending ?? false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        if (params?.limit) {
          query = query.limit(params.limit);
        }

        if (params?.offset) {
          query = query.range(params.offset, (params.offset + (params.limit || 10)) - 1);
        }

        const result = await query;
        QueryOptimizer.logSlowQuery('users.getAll', startTime);
        return result;
      }, 'Fetch Users');
    },

    async getById(id: string): Promise<ApiResponse<User>> {
      UuidValidator.validateAndThrow(id, 'User ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, name, email, role, created_at, school_id,
            school:schools!fk_profiles_school(id, name)
          `)
          .eq('id', id)
          .single();
        
        return { data, error };
      }, 'Fetch User by ID');
    },

    async create(userData: CreateUserParams): Promise<ApiResponse<User>> {
      return this.fetch(async () => {
        const { data, error } = await supabase.rpc('create_admin_user', userData);
        return { data, error };
      }, 'Create User');
    },

    async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse<User>> {
      UuidValidator.validateAndThrow(id, 'User ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        return { data, error };
      }, 'Update User');
    },

    async delete(id: string): Promise<ApiResponse<boolean>> {
      UuidValidator.validateAndThrow(id, 'User ID');
      
      return this.fetch(async () => {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        
        return { data: !error, error };
      }, 'Delete User');
    },

    async getBySchool(schoolId: string): Promise<ApiResponse<User[]>> {
      UuidValidator.validateAndThrow(schoolId, 'School ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, name, email, role, created_at, school_id,
            school:schools!fk_profiles_school(id, name)
          `)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false });
        
        return { data, error };
      }, 'Fetch Users by School');
    }
  };

  /**
   * Students API
   */
  static students = {
    async getAll(schoolId: string, params?: PaginationParams & SortParams): Promise<ApiResponse<Student[]>> {
      UuidValidator.validateAndThrow(schoolId, 'School ID');
      const startTime = Date.now();
      
      return this.fetch(async () => {
        let query = supabase
          .from('students')
          .select(`
            id, 
            first_name, 
            last_name, 
            email, 
            phone, 
            date_of_birth,
            gender,
            admission_number,
            class_id,
            parent_id,
            created_at,
            updated_at,
            class:classes(id, name),
            parent:profiles(id, name, email)
          `)
          .eq('school_id', schoolId);

        if (params?.column) {
          query = query.order(params.column, { ascending: params.ascending ?? false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        if (params?.limit) {
          query = query.limit(params.limit);
        }

        if (params?.offset) {
          query = query.range(params.offset, (params.offset + (params.limit || 10)) - 1);
        }

        const result = await query;
        QueryOptimizer.logSlowQuery('students.getAll', startTime);
        return result;
      }, 'Fetch Students');
    },

    async getById(id: string): Promise<ApiResponse<Student>> {
      UuidValidator.validateAndThrow(id, 'Student ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('students')
          .select(`
            id, 
            first_name, 
            last_name, 
            email, 
            phone, 
            date_of_birth,
            gender,
            admission_number,
            class_id,
            parent_id,
            school_id,
            created_at,
            updated_at,
            class:classes(id, name),
            parent:profiles(id, name, email),
            school:schools(id, name)
          `)
          .eq('id', id)
          .single();
        
        return { data, error };
      }, 'Fetch Student by ID');
    },

    async create(studentData: StudentInsertData): Promise<ApiResponse<Student>> {
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('students')
          .insert(studentData)
          .select()
          .single();
        
        return { data, error };
      }, 'Create Student');
    },

    async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse<Student>> {
      UuidValidator.validateAndThrow(id, 'Student ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('students')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        return { data, error };
      }, 'Update Student');
    },

    async delete(id: string): Promise<ApiResponse<boolean>> {
      UuidValidator.validateAndThrow(id, 'Student ID');
      
      return this.fetch(async () => {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id);
        
        return { data: !error, error };
      }, 'Delete Student');
    }
  };

  /**
   * Classes API
   */
  static classes = {
    async getAll(schoolId: string): Promise<ApiResponse<Class[]>> {
      UuidValidator.validateAndThrow(schoolId, 'School ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('classes')
          .select(`
            id, 
            name, 
            grade_level, 
            capacity, 
            academic_year,
            curriculum_type,
            created_at,
            updated_at
          `)
          .eq('school_id', schoolId)
          .order('grade_level', { ascending: true });
        
        return { data, error };
      }, 'Fetch Classes');
    },

    async getById(id: string): Promise<ApiResponse<Class>> {
      UuidValidator.validateAndThrow(id, 'Class ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('id', id)
          .single();
        
        return { data, error };
      }, 'Fetch Class by ID');
    },

    async create(classData: ClassInsertData): Promise<ApiResponse<Class>> {
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('classes')
          .insert(classData)
          .select()
          .single();
        
        return { data, error };
      }, 'Create Class');
    },

    async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse<Class>> {
      UuidValidator.validateAndThrow(id, 'Class ID');
      
      return this.fetch(async () => {
        const { data, error } = await supabase
          .from('classes')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        return { data, error };
      }, 'Update Class');
    },

    async delete(id: string): Promise<ApiResponse<boolean>> {
      UuidValidator.validateAndThrow(id, 'Class ID');
      
      return this.fetch(async () => {
        const { error } = await supabase
          .from('classes')
          .delete()
          .eq('id', id);
        
        return { data: !error, error };
      }, 'Delete Class');
    }
  };

  /**
   * Analytics API
   */
  static analytics = {
    async getSchoolStats(schoolId: string): Promise<ApiResponse<AnalyticsData>> {
      UuidValidator.validateAndThrow(schoolId, 'School ID');
      
      return this.fetch(async () => {
        const { data, error } = await (supabase as any).rpc('get_school_analytics', {
          p_school_id: schoolId
        });
        
        return { data, error };
      }, 'Fetch School Analytics');
    },

    async getSystemStats(): Promise<ApiResponse<AnalyticsData>> {
      return this.fetch(async () => {
        const { data, error } = await (supabase as any).rpc('get_system_analytics');
        
        return { data, error };
      }, 'Fetch System Analytics');
    },

    async getClassStats(classId: string): Promise<ApiResponse<AnalyticsData>> {
      UuidValidator.validateAndThrow(classId, 'Class ID');
      
      return this.fetch(async () => {
        const { data, error } = await (supabase as any).rpc('get_class_analytics', {
          p_class_id: classId
        });
        
        return { data, error };
      }, 'Fetch Class Analytics');
    }
  };

  /**
   * Reports API
   */
  static reports = {
    async generateReport(reportType: string, params: Record<string, unknown>): Promise<ApiResponse<ReportData>> {
      return this.fetch(async () => {
        const { data, error } = await (supabase as any).rpc('generate_report', {
          report_type: reportType,
          report_params: params
        });
        
        return { data, error };
      }, 'Generate Report');
    },

    async getReportHistory(userId: string): Promise<ApiResponse<ReportHistory[]>> {
      UuidValidator.validateAndThrow(userId, 'User ID');
      
      return this.fetch(async () => {
        const { data, error } = await (supabase as any)
          .from('reports')
          .select('*')
          .eq('created_by', userId)
          .order('created_at', { ascending: false });
        
        return { data, error };
      }, 'Fetch Report History');
    }
  };
} 