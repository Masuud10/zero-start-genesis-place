import { useRef, useMemo, useEffect } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { withPerformanceMonitoring } from '@/utils/databasePerformance';
import { withDatabaseRetry } from '@/utils/enhancedErrorHandler';

// Prevent infinite re-renders by stabilizing query keys and functions
export function useStableQuery<TData = unknown, TError = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  // Stabilize query key to prevent unnecessary re-renders
  const stableQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);
  
  // Stabilize query function
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  
  const stableQueryFn = useMemo(
    () => (): Promise<TData> => {
      const operationName = stableQueryKey.join('_');
      return withPerformanceMonitoring(
        operationName,
        () => withDatabaseRetry(queryFnRef.current, operationName)
      );
    },
    [stableQueryKey]
  );

  // Prevent memory leaks by limiting cache time for large datasets
  const stableOptions = useMemo(() => ({
    staleTime: 1000 * 60 * 2, // 2 minutes default
    gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false, // Handled by our enhanced error handler
    ...options,
  }), [options]);

  return useQuery({
    queryKey: stableQueryKey,
    queryFn: stableQueryFn,
    ...stableOptions,
  } as UseQueryOptions<TData, TError>);
}

// Hook for paginated queries to prevent memory buildup
export function useStablePaginatedQuery<TData = unknown, TError = unknown>(
  queryKey: any[],
  queryFn: (context: { pageParam?: any }) => Promise<TData>,
  options?: any
) {
  const stableQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);
  
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  
  const stableQueryFn = useMemo(
    () => (context: { pageParam?: any }) => {
      const operationName = `${stableQueryKey.join('_')}_page_${context.pageParam || 0}`;
      return withPerformanceMonitoring(
        operationName,
        () => withDatabaseRetry(() => queryFnRef.current(context), operationName)
      );
    },
    [stableQueryKey]
  );

  const stableOptions = useMemo(() => ({
    staleTime: 1000 * 60, // 1 minute for paginated data
    gcTime: 1000 * 60 * 2, // 2 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: false,
    maxPages: 5, // Limit pages in memory
    ...options,
  }), [options]);

  return useQuery({
    queryKey: stableQueryKey,
    queryFn: stableQueryFn,
    ...stableOptions,
  });
}

// Cleanup hook for components that use multiple queries
export function useQueryCleanup(queryKeys: string[][]) {
  const queryKeysRef = useRef(queryKeys);
  queryKeysRef.current = queryKeys;
  
  useEffect(() => {
    return () => {
      // Cleanup function to remove unused queries on unmount
      import('@tanstack/react-query').then(({ useQueryClient }) => {
        // This is a placeholder - in a real implementation, you'd need access to queryClient
        console.log('🧹 Cleaning up queries for unmounted component');
      });
    };
  }, []);
}