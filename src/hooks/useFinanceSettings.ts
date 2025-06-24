
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceSettings {
  id?: string;
  school_id: string;
  mpesa_consumer_key?: string;
  mpesa_consumer_secret?: string;
  mpesa_paybill_number?: string;
  mpesa_passkey?: string;
  tax_rate?: number;
  late_fee_percentage?: number;
  late_fee_grace_days?: number;
  settings_data?: any;
}

export const useFinanceSettings = () => {
  const [settings, setSettings] = useState<FinanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSettings = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('finance_settings')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setSettings(data || {
        school_id: user.school_id,
        tax_rate: 0,
        late_fee_percentage: 0,
        late_fee_grace_days: 0
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching finance settings:', err);
      setError(err.message || 'Failed to fetch finance settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<FinanceSettings>) => {
    if (!user?.school_id) {
      return { error: 'No school assigned to user' };
    }

    try {
      setError(null);

      const settingsToUpdate = {
        school_id: user.school_id,
        ...newSettings,
        settings_data: newSettings.settings_data ? JSON.stringify(newSettings.settings_data) : undefined
      };

      const { data, error: updateError } = await supabase
        .from('finance_settings')
        .upsert([settingsToUpdate])
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setSettings(data);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating finance settings:', err);
      const errorMessage = err.message || 'Failed to update finance settings';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user?.school_id]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
};
