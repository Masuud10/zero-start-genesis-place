
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from './useSchoolScopedData';
import { APIOptimizationUtils } from '@/utils/apiOptimization';

// Define valid table names to fix TypeScript overload issues
const VALID_TABLES = [
  'students', 'classes', 'subjects', 'timetables', 'announcements',
  'support_tickets', 'messages', 'grades', 'attendance', 'fees',
  'profiles', 'schools', 'academic_years', 'academic_terms'
] as const;

type ValidTableName = typeof VALID_TABLES[number];

interface OptimizedQueryOptions<T = any> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  tableName: ValidTableName;
  selectFields?: string;
  filters?: Record<string, any>;
  requiresAuth?: boolean;
  requiresSchool?: boolean;
  cacheTTL?: number;
}

export const useOptimizedQuery = <T = any>({
  queryKey,
  tableName,
  selectFields = '*',
  filters = {},
  requiresAuth = true,
  requiresSchool = true,
  cacheTTL = 5 * 60 * 1000, // 5 minutes default
  ...options
}: OptimizedQueryOptions<T>) => {
  const { user } = useAuth();
  const { schoolId, validateSchoolAccess } = useSchoolScopedData();

  const cacheKey = queryKey.join('-');

  return useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      // Check cache first
      const cached = APIOptimizationUtils.getCachedData<T>(cacheKey);
      if (cached) return cached;

      // Validation checks
      if (requiresAuth && !user) {
        throw new Error('Authentication required');
      }

      if (requiresSchool && !schoolId) {
        throw new Error('School assignment required');
      }

      // Build query with deduplication
      return APIOptimizationUtils.deduplicateRequest(cacheKey, async () => {
        // Use explicit type assertion to fix TypeScript overload issue
        let query = supabase.from(tableName as any).select(selectFields);

        // Apply school_id filter for multi-tenancy
        if (requiresSchool && schoolId) {
          // Validate school access for current user
          if (!validateSchoolAccess(schoolId)) {
            throw new Error('Access denied to school data');
          }
          query = query.eq('school_id', schoolId);
        }

        // Apply custom filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });

        const { data, error } = await query;

        if (error) {
          console.error(`Query error for ${tableName}:`, error);
          throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
        }

        // Cache the result
        APIOptimizationUtils.setCachedData(cacheKey, data, cacheTTL);
        return data as T;
      });
    },
    enabled: requiresAuth ? !!user : true,
    staleTime: cacheTTL,
    retry: (failureCount, error: any) => {
      // Don't retry auth or permission errors
      if (error?.message?.includes('Authentication') || error?.message?.includes('Access denied')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
};
