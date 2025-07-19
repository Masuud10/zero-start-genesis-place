
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSchoolData = () => {
  const [schoolData, setSchoolData] = useState<{
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    curriculum: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Since user context is removed, we'll need to get school data differently
      // For now, we'll use a placeholder or get it from a different source
      const schoolId = 'placeholder_school_id'; // This should be provided externally

      const { data, error: fetchError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setSchoolData(data);
      } else {
        setError('School not found');
      }
    } catch (err) {
      console.error('Error fetching school data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch school data');
    } finally {
      setLoading(false);
    }
  };

  const updateSchoolData = async (updates: Partial<typeof schoolData>) => {
    try {
      setError(null);

      if (!schoolData?.id) {
        throw new Error('No school data available for update');
      }

      const { data, error: updateError } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', schoolData.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setSchoolData(data);
      }
    } catch (err) {
      console.error('Error updating school data:', err);
      setError(err instanceof Error ? err.message : 'Failed to update school data');
    }
  };

  useEffect(() => {
    fetchSchoolData();
  }, []);

  return {
    schoolData,
    loading,
    error,
    refetch: fetchSchoolData,
    updateSchoolData
  };
};
