
import { useState, useEffect } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Class {
  id: string;
  name: string;
  school_id: string;
  teacher_id?: string;
  created_at: string;
}

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('classes').select(`
        id,
        name,
        school_id,
        teacher_id,
        created_at
      `);

      // Apply school filter for non-admin users
      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch classes data",
          variant: "destructive",
        });
        setClasses([]);
        return;
      }

      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classes data",
        variant: "destructive",
      });
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [isSystemAdmin, schoolId]);

  return {
    classes,
    loading,
    refetchClasses: fetchClasses
  };
};
