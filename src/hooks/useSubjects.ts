
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { SubjectService } from '@/services/subjectService';
import { Subject } from '@/types/subject';

export const useSubjects = (classId?: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchSubjects = useCallback(async (isRetry = false) => {
    console.log('📚 useSubjects: fetchSubjects called with:', { classId, isSystemAdmin, schoolId, currentlyLoading: loading, retryCount });
    
    // Prevent multiple simultaneous fetches
    if (loading && !isRetry) {
      console.log('📚 useSubjects: Fetch already in progress, skipping');
      return;
    }

    // Early validation checks
    if (!schoolId && !isSystemAdmin) {
      console.log('📚 useSubjects: No school context and not system admin');
      setSubjects([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!schoolId) {
      console.error('📚 useSubjects: No school context found for non-admin user');
      setError('No school context found');
      setSubjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📚 useSubjects: Starting fetch with params:', { classId, isSystemAdmin, schoolId });
      
      const data = await SubjectService.getSubjects(schoolId, classId);
      
      console.log('📚 useSubjects: Fetch completed successfully, count:', data?.length || 0);
      setSubjects(data || []);
      setError(null);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch subjects data';
      console.error('❌ useSubjects: Error fetching subjects:', err);
      setError(message);
      setSubjects([]);
      
      // Implement retry logic for timeout errors
      if (message.includes('timed out') && retryCount < 2) {
        console.log('⚠️ useSubjects: Timeout detected, scheduling retry...', retryCount + 1);
        setRetryCount(prev => prev + 1);
        
        // Retry after 2 seconds
        setTimeout(() => {
          fetchSubjects(true);
        }, 2000);
        
        toast({
          title: "Connection Timeout", 
          description: `Retrying... (${retryCount + 1}/2)`,
          variant: "destructive",
        });
      } else {
        // Only show toast for actual errors, not when no data is found
        if (!message.includes('not found') && !message.includes('No subjects')) {
          toast({
            title: "Subjects Fetch Error", 
            description: message,
            variant: "destructive",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [classId, isSystemAdmin, schoolId, toast, retryCount]); // Include retryCount in dependencies

  useEffect(() => {
    let isMounted = true;
    
    const loadSubjects = async () => {
      // Only proceed if we have proper context
      if (schoolId !== null || isSystemAdmin) {
        if (isMounted) {
          console.log('📚 useSubjects: useEffect triggering fetchSubjects');
          await fetchSubjects();
        }
      } else {
        console.log('📚 useSubjects: useEffect - no valid context, clearing data');
        if (isMounted) {
          setSubjects([]);
          setLoading(false);
          setError(null);
          setRetryCount(0);
        }
      }
    };

    loadSubjects();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      console.log('📚 useSubjects: useEffect cleanup');
      isMounted = false;
    };
  }, [classId, isSystemAdmin, schoolId]); // Keep dependencies minimal

  const retry = useCallback(() => {
    console.log('📚 useSubjects: Manual retry triggered');
    setRetryCount(0); // Reset retry count for manual retries
    fetchSubjects(true);
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    retry
  };
};
