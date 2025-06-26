
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  name: string;
  theme_preference: 'light' | 'dark' | 'system';
  dashboard_preferences: {
    showGreetings: boolean;
    compactMode: boolean;
    defaultView: string;
  };
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserSettings = useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!user?.id) throw new Error('No user ID available');

      // Update profile in database
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: settings.name,
          theme_preference: settings.theme_preference,
          dashboard_preferences: settings.dashboard_preferences
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Also update auth user metadata for immediate access
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: settings.name,
          theme_preference: settings.theme_preference,
          dashboard_preferences: settings.dashboard_preferences
        }
      });

      if (authError) {
        console.warn('Failed to update auth metadata:', authError);
        // Don't throw here as the main update succeeded
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Settings Updated",
        description: "Your profile settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  return {
    updateUserSettings,
    isUpdating: updateUserSettings.isPending,
  };
};
