import { supabase } from '../../integrations/supabase/client';
import { 
  ApiCallWrapper, 
  QueryOptimizer, 
  UuidValidator, 
  APIOptimizationUtils,
  ApiErrorHandler,
  RetryHandler,
  TimeoutHandler,
  FormValidator
} from '../../utils/apiOptimization';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  metadata?: {
    timestamp: number;
    duration: number;
    cached?: boolean;
  };
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
  owner_information?: string;
  school_type?: string;
  status?: string;
  subscription_plan?: string;
  max_students?: number;
  timezone?: string;
  term_structure?: string;
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
  owner_information?: string;
  subscription_plan?: string;
  max_students?: number;
  timezone?: string;
  term_structure?: string;
  curriculum_type?: string;
  [key: string]: unknown;
}

export interface CreateUserParams {
  user_email: string;
  user_password: string;
  user_name: string;
  user_role?: string;
  user_school_id?: string;
  [key: string]: unknown;
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

// Proper Supabase query builder types
export interface SupabaseQueryBuilder {
  select: (columns: string) => SupabaseQueryBuilder;
  eq: (column: string, value: string) => SupabaseQueryBuilder;
  order: (column: string, options: { ascending: boolean }) => SupabaseQueryBuilder;
  limit: (count: number) => SupabaseQueryBuilder;
  range: (from: number, to: number) => SupabaseQueryBuilder;
  single: () => Promise<{ data: unknown; error: unknown }>;
  update: (updates: Record<string, unknown>) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
  insert: (data: Record<string, unknown>) => SupabaseQueryBuilder;
}

export interface SupabaseTableBuilder {
  (table: string): SupabaseQueryBuilder;
}

export interface SupabaseRpcBuilder {
  (functionName: string, params?: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
}

export interface SupabaseClient {
  from: SupabaseTableBuilder;
  rpc: SupabaseRpcBuilder;
}

export class ApiService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private static readonly MAX_RETRIES = 3;

  /**
   * Generic fetch method with enhanced error handling and performance optimizations
   */
  static async fetch<T>(
    operation: () => Promise<{ data: T | null; error: unknown }>,
    context: string,
    options: {
      useCache?: boolean;
      cacheKey?: string;
      timeoutMs?: number;
      maxRetries?: number;
      deduplicate?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const {
      useCache = false,
      cacheKey,
      timeoutMs = this.REQUEST_TIMEOUT,
      maxRetries = this.MAX_RETRIES,
      deduplicate = true
    } = options;

    // Check cache first if enabled
    if (useCache && cacheKey) {
      const cachedData = APIOptimizationUtils.getCachedData<T>(cacheKey);
      if (cachedData) {
        return {
          data: cachedData,
          error: null,
          success: true,
          metadata: {
            timestamp: Date.now(),
            duration: Date.now() - startTime,
            cached: true
          }
        };
      }
    }

    // Create operation with timeout and retry logic
    const executeOperation = async (): Promise<{ data: T | null; error: unknown }> => {
      return TimeoutHandler.withTimeout(
        RetryHandler.withRetry(
          async () => {
            const result = await ApiCallWrapper.execute(operation, { 
              context,
              maxRetries: 1, // We handle retries at this level
              timeoutMs: timeoutMs / 2, // Reserve time for retries
              showErrorToast: false // We handle errors here
            });
            return result;
          },
          maxRetries,
          1000,
          context
        ),
        timeoutMs,
        context
      );
    };

    // Deduplicate requests if enabled
    const finalOperation = deduplicate && cacheKey 
      ? () => APIOptimizationUtils.deduplicateRequest(cacheKey, executeOperation)
      : executeOperation;

    try {
      const result = await finalOperation();
      
      // Cache successful results
      if (useCache && cacheKey && result.data && !result.error) {
        APIOptimizationUtils.setCachedData(cacheKey, result.data, this.CACHE_TTL);
      }

      const duration = Date.now() - startTime;
      
      return {
        data: result.data,
        error: result.error ? String(result.error) : null,
        success: !result.error,
        metadata: {
          timestamp: Date.now(),
          duration
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      console.error(`❌ ${context} error:`, error);
      ApiErrorHandler.handle(error, context);
      
      return {
        data: null,
        error: errorMessage,
        success: false,
        metadata: {
          timestamp: Date.now(),
          duration
        }
      };
    }
  }

  /**
   * Input validation helper
   */
  private static validateRequiredParams(params: Record<string, unknown>, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!params[field] || (typeof params[field] === 'string' && params[field].toString().trim() === '')) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }

  /**
   * Sanitize input data to prevent injection attacks
   */
  private static sanitizeInput<T extends Record<string, unknown>>(data: T): T {
    const sanitized = {} as T;
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        (sanitized as Record<string, unknown>)[key] = value.replace(/[<>\"'&]/g, '');
      } else {
        (sanitized as Record<string, unknown>)[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Schools API
   */
  static schools = {
    async getAll(params?: PaginationParams & SortParams): Promise<ApiResponse<School[]>> {
      const startTime = Date.now();
      const cacheKey = `schools:all:${JSON.stringify(params)}`;
      
      return ApiService.fetch(async () => {
        let query = supabase
          .from('schools')
          .select(`
            id, 
            name, 
            email, 
            phone, 
            address, 
            created_at,
            updated_at,
            owner_id,
            logo_url,
            website_url,
            motto,
            slogan,
            registration_number,
            year_established,
            owner_information,
            school_type,
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
      }, 'Fetch Schools', { useCache: true, cacheKey });
    },

    async getById(id: string): Promise<ApiResponse<School>> {
      UuidValidator.validateAndThrow(id, 'School ID');
      const cacheKey = `school:${id}`;
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('id', id)
          .single();
        
        return { data, error };
      }, 'Fetch School by ID', { useCache: true, cacheKey });
    },

    async create(schoolData: CreateSchoolParams): Promise<ApiResponse<School>> {
      // Validate required fields
      ApiService.validateRequiredParams(schoolData, ['school_name', 'school_email', 'school_phone', 'school_address']);
      
      // Sanitize input
      const sanitizedData = ApiService.sanitizeInput(schoolData);
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase.rpc('create_enhanced_school', sanitizedData);
        
        // Clear cache after successful creation
        if (data && !error) {
          APIOptimizationUtils.clearCache('schools:');
        }
        
        return { data: data as unknown as School, error };
      }, 'Create School');
    },

    async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse<School>> {
      UuidValidator.validateAndThrow(id, 'School ID');
      
      // Sanitize input
      const sanitizedUpdates = ApiService.sanitizeInput(updates);
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('schools')
          .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        // Clear cache after successful update
        if (data && !error) {
          APIOptimizationUtils.clearCache(`school:${id}`);
          APIOptimizationUtils.clearCache('schools:');
        }
        
        return { data, error };
      }, 'Update School');
    },

    async delete(id: string): Promise<ApiResponse<boolean>> {
      UuidValidator.validateAndThrow(id, 'School ID');
      
      return ApiService.fetch(async () => {
        const { error } = await supabase
          .from('schools')
          .delete()
          .eq('id', id);
        
        // Clear cache after successful deletion
        if (!error) {
          APIOptimizationUtils.clearCache(`school:${id}`);
          APIOptimizationUtils.clearCache('schools:');
        }
        
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
      const cacheKey = `users:all:${JSON.stringify(params)}`;
      
      return ApiService.fetch(async () => {
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
      }, 'Fetch Users', { useCache: true, cacheKey });
    },

    async getById(id: string): Promise<ApiResponse<User>> {
      UuidValidator.validateAndThrow(id, 'User ID');
      const cacheKey = `user:${id}`;
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, name, email, role, created_at, school_id,
            school:schools!fk_profiles_school(id, name)
          `)
          .eq('id', id)
          .single();
        
        return { data, error };
      }, 'Fetch User by ID', { useCache: true, cacheKey });
    },

    async create(userData: CreateUserParams): Promise<ApiResponse<User>> {
      // Validate required fields
      ApiService.validateRequiredParams(userData, ['user_email', 'user_password', 'user_name']);
      
      // Validate email format
      const emailError = FormValidator.validateEmail(userData.user_email);
      if (emailError) {
        throw new Error(emailError);
      }
      
      // Sanitize input
      const sanitizedData = ApiService.sanitizeInput(userData);
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase.rpc('create_admin_user', sanitizedData);
        
        // Clear cache after successful creation
        if (data && !error) {
          APIOptimizationUtils.clearCache('users:');
        }
        
        return { data: data as unknown as User, error };
      }, 'Create User');
    },

    async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse<User>> {
      UuidValidator.validateAndThrow(id, 'User ID');
      
      // Sanitize input
      const sanitizedUpdates = ApiService.sanitizeInput(updates);
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        // Clear cache after successful update
        if (data && !error) {
          APIOptimizationUtils.clearCache(`user:${id}`);
          APIOptimizationUtils.clearCache('users:');
        }
        
        return { data, error };
      }, 'Update User');
    },

    async delete(id: string): Promise<ApiResponse<boolean>> {
      UuidValidator.validateAndThrow(id, 'User ID');
      
      return ApiService.fetch(async () => {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        
        // Clear cache after successful deletion
        if (!error) {
          APIOptimizationUtils.clearCache(`user:${id}`);
          APIOptimizationUtils.clearCache('users:');
        }
        
        return { data: !error, error };
      }, 'Delete User');
    },

    async getBySchool(schoolId: string): Promise<ApiResponse<User[]>> {
      UuidValidator.validateAndThrow(schoolId, 'School ID');
      const cacheKey = `users:school:${schoolId}`;
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, name, email, role, created_at, school_id,
            school:schools!fk_profiles_school(id, name)
          `)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false });
        
        return { data, error };
      }, 'Fetch Users by School', { useCache: true, cacheKey });
    }
  };

  /**
   * Students API
   */
  static students = {
    async getAll(schoolId: string, params?: PaginationParams & SortParams): Promise<ApiResponse<Student[]>> {
      UuidValidator.validateAndThrow(schoolId, 'School ID');
      const startTime = Date.now();
      const cacheKey = `students:school:${schoolId}:${JSON.stringify(params)}`;
      
      return ApiService.fetch(async () => {
        let query = supabase
          .from('students')
          .select(`
            id, 
            name,
            date_of_birth,
            gender,
            admission_number,
            class_id,
            parent_id,
            created_at,
            updated_at
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
      }, 'Fetch Students', { useCache: true, cacheKey });
    },

    async getById(id: string): Promise<ApiResponse<Student>> {
      UuidValidator.validateAndThrow(id, 'Student ID');
      const cacheKey = `student:${id}`;
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('students')
          .select(`
            id, 
            name,
            date_of_birth,
            gender,
            admission_number,
            class_id,
            parent_id,
            school_id,
            created_at,
            updated_at
          `)
          .eq('id', id)
          .single();
        
        return { data, error };
      }, 'Fetch Student by ID', { useCache: true, cacheKey });
    },

    async create(studentData: StudentInsertData): Promise<ApiResponse<Student>> {
      // Validate required fields
      ApiService.validateRequiredParams(studentData, ['name', 'admission_number']);
      
      // Sanitize input
      const sanitizedData = ApiService.sanitizeInput(studentData);
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('students')
          .insert(sanitizedData)
          .select()
          .single();
        
        // Clear cache after successful creation
        if (data && !error) {
          APIOptimizationUtils.clearCache('students:');
        }
        
        return { data, error };
      }, 'Create Student');
    },

    async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse<Student>> {
      UuidValidator.validateAndThrow(id, 'Student ID');
      
      // Sanitize input
      const sanitizedUpdates = ApiService.sanitizeInput(updates);
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('students')
          .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        // Clear cache after successful update
        if (data && !error) {
          APIOptimizationUtils.clearCache(`student:${id}`);
          APIOptimizationUtils.clearCache('students:');
        }
        
        return { data, error };
      }, 'Update Student');
    },

    async delete(id: string): Promise<ApiResponse<boolean>> {
      UuidValidator.validateAndThrow(id, 'Student ID');
      
      return ApiService.fetch(async () => {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id);
        
        // Clear cache after successful deletion
        if (!error) {
          APIOptimizationUtils.clearCache(`student:${id}`);
          APIOptimizationUtils.clearCache('students:');
        }
        
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
      const cacheKey = `classes:school:${schoolId}`;
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('classes')
          .select(`
            id, 
            name, 
            capacity, 
            curriculum_type,
            created_at,
            updated_at
          `)
          .eq('school_id', schoolId)
          .order('name', { ascending: true });
        
        return { data, error };
      }, 'Fetch Classes', { useCache: true, cacheKey });
    },

    async getById(id: string): Promise<ApiResponse<Class>> {
      UuidValidator.validateAndThrow(id, 'Class ID');
      const cacheKey = `class:${id}`;
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('id', id)
          .single();
        
        return { data, error };
      }, 'Fetch Class by ID', { useCache: true, cacheKey });
    },

    async create(classData: ClassInsertData): Promise<ApiResponse<Class>> {
      // Validate required fields
      ApiService.validateRequiredParams(classData, ['name']);
      
      // Sanitize input
      const sanitizedData = ApiService.sanitizeInput(classData);
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('classes')
          .insert(sanitizedData)
          .select()
          .single();
        
        // Clear cache after successful creation
        if (data && !error) {
          APIOptimizationUtils.clearCache('classes:');
        }
        
        return { data, error };
      }, 'Create Class');
    },

    async update(id: string, updates: Record<string, unknown>): Promise<ApiResponse<Class>> {
      UuidValidator.validateAndThrow(id, 'Class ID');
      
      // Sanitize input
      const sanitizedUpdates = ApiService.sanitizeInput(updates);
      
      return ApiService.fetch(async () => {
        const { data, error } = await supabase
          .from('classes')
          .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        // Clear cache after successful update
        if (data && !error) {
          APIOptimizationUtils.clearCache(`class:${id}`);
          APIOptimizationUtils.clearCache('classes:');
        }
        
        return { data, error };
      }, 'Update Class');
    },

    async delete(id: string): Promise<ApiResponse<boolean>> {
      UuidValidator.validateAndThrow(id, 'Class ID');
      
      return ApiService.fetch(async () => {
        const { error } = await supabase
          .from('classes')
          .delete()
          .eq('id', id);
        
        // Clear cache after successful deletion
        if (!error) {
          APIOptimizationUtils.clearCache(`class:${id}`);
          APIOptimizationUtils.clearCache('classes:');
        }
        
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
      const cacheKey = `analytics:school:${schoolId}`;
      
      return ApiService.fetch(async () => {
        const { data, error } = await (supabase as any).rpc('get_school_analytics', {
          p_school_id: schoolId
        });
        
        return { data: data as AnalyticsData, error };
      }, 'Fetch School Analytics', { useCache: true, cacheKey, timeoutMs: 45000 });
    },

    async getSystemStats(): Promise<ApiResponse<AnalyticsData>> {
      const cacheKey = 'analytics:system';
      
      return ApiService.fetch(async () => {
        const { data, error } = await (supabase as any).rpc('get_system_analytics');
        
        return { data: data as AnalyticsData, error };
      }, 'Fetch System Analytics', { useCache: true, cacheKey, timeoutMs: 45000 });
    },

    async getClassStats(classId: string): Promise<ApiResponse<AnalyticsData>> {
      UuidValidator.validateAndThrow(classId, 'Class ID');
      const cacheKey = `analytics:class:${classId}`;
      
      return ApiService.fetch(async () => {
        const { data, error } = await (supabase as any).rpc('get_class_analytics', {
          p_class_id: classId
        });
        
        return { data: data as AnalyticsData, error };
      }, 'Fetch Class Analytics', { useCache: true, cacheKey, timeoutMs: 45000 });
    }
  };

  /**
   * Reports API
   */
  static reports = {
    async generateReport(reportType: string, params: Record<string, unknown>): Promise<ApiResponse<ReportData>> {
      // Validate required fields
      ApiService.validateRequiredParams({ reportType, ...params }, ['reportType']);
      
      // Sanitize input
      const sanitizedParams = ApiService.sanitizeInput(params);
      
      return ApiService.fetch(async () => {
        // Use a simple report generation since RPC function doesn't exist
        const reportData = {
          type: reportType,
          params: sanitizedParams,
          generated_at: new Date().toISOString(),
          data: {}
        };
        
        return { data: reportData, error: null };
      }, 'Generate Report', { timeoutMs: 60000 }); // Longer timeout for report generation
    },

    async getReportHistory(userId: string): Promise<ApiResponse<ReportHistory[]>> {
      UuidValidator.validateAndThrow(userId, 'User ID');
      const cacheKey = `reports:history:${userId}`;
      
      return ApiService.fetch(async () => {
        // Since reports table doesn't exist, return empty array
        const data: ReportHistory[] = [];
        
        return { data, error: null };
      }, 'Fetch Report History', { useCache: true, cacheKey });
    }
  };

  /**
   * Utility methods for cache management
   */
  static clearCache(pattern?: string): void {
    APIOptimizationUtils.clearCache(pattern);
  }

  static getCacheStats(): { size: number; keys: string[] } {
    return APIOptimizationUtils.getCacheStats();
  }
} 