
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedClass {
  id: string;
  name: string;
  school_id: string;
  teacher_id?: string;
  academic_level?: string;
  level?: string;
  stream?: string;
  year?: string;
  capacity?: number;
  room_number?: string;
  class_type?: string;
  created_at: string;
  updated_at: string;
}

export const useEnhancedClasses = () => {
  const [classes, setClasses] = useState<EnhancedClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchClasses = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setClasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('classes').select('*');

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      query = query.order('name');

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setClasses(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch classes';
      setError(message);
      setClasses([]);
      toast({
        title: "Classes Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast]);

  const createClass = async (classData: {
    name: string;
    teacher_id?: string;
    academic_level?: string;
    level?: string;
    stream?: string;
    year?: string;
    capacity?: number;
    room_number?: string;
    class_type?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          ...classData,
          school_id: schoolId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Class Created",
        description: `Class ${classData.name} has been created successfully.`,
      });

      fetchClasses();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to create class';
      toast({
        title: "Create Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const updateClass = async (id: string, updates: Partial<EnhancedClass>) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Class Updated",
        description: "Class has been updated successfully.",
      });

      fetchClasses();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update class';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Class Deleted",
        description: "Class has been deleted successfully.",
      });

      fetchClasses();
      return { error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to delete class';
      toast({
        title: "Delete Error",
        description: message,
        variant: "destructive",
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    loading,
    error,
    createClass,
    updateClass,
    deleteClass,
    refetch: fetchClasses
  };
};
