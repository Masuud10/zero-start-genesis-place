
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MpesaCredentials } from './types';

export const useMpesaCredentials = () => {
  const [credentials, setCredentials] = useState<MpesaCredentials | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCredentials = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('mpesa_api_credentials')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCredentials({
          consumer_key: data.consumer_key,
          consumer_secret: data.consumer_secret,
          passkey: data.passkey,
          paybill_number: data.paybill_number
        });
      }
    } catch (err: any) {
      console.error('Error fetching M-PESA credentials:', err);
    }
  };

  const saveCredentials = async (credentialsData: MpesaCredentials) => {
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "No school ID found",
        variant: "destructive",
      });
      return { error: 'No school ID found' };
    }

    try {
      const { error } = await supabase
        .from('mpesa_api_credentials')
        .upsert({
          school_id: user.school_id,
          ...credentialsData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCredentials(credentialsData);
      toast({
        title: "Success",
        description: "M-PESA credentials saved successfully",
      });

      return { success: true };
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to save M-PESA credentials",
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [user?.school_id]);

  return {
    credentials,
    fetchCredentials,
    saveCredentials
  };
};
