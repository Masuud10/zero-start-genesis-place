
import { useState, useEffect } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';

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
  const { createSchoolScopedQuery } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await createSchoolScopedQuery('classes', `
        id,
        name,
        school_id,
        teacher_id,
        created_at
      `).order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch classes data",
          variant: "destructive",
        });
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    loading,
    refetchClasses: fetchClasses
  };
};
