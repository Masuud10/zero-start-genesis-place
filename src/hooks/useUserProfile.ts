
import { useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { handleApiError } from '@/utils/errorHandler';
import { PerformanceMonitor } from '@/utils/performance';
import { determineUserRole } from '@/utils/roleUtils';

export const useUserProfile = () => {
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<string | null>(null);

  const fetchUserProfile = useCallback(async (authUser: User, setUser: (user: AuthUser | null) => void, setIsLoading: (loading: boolean) => void) => {
    if (!isMountedRef.current) {
      console.log('👤 UserProfile: Component unmounted, skipping fetch');
      return;
    }
    
    // Prevent duplicate fetches for the same user
    if (lastFetchRef.current === authUser.id) {
      console.log('👤 UserProfile: Already fetching for this user, skipping');
      return;
    }
    
    if (fetchingRef.current) {
      console.log('👤 UserProfile: Already fetching, skipping duplicate request');
      return;
    }
    
    fetchingRef.current = true;
    lastFetchRef.current = authUser.id;
    const endTimer = PerformanceMonitor.startTimer('fetch_user_profile');
    
    try {
      console.log('👤 UserProfile: Starting profile fetch for', authUser.email);
      
      // Add timeout to profile fetch
      const profilePromise = supabase
        .from('profiles')
        .select('id, email, name, role, school_id, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (!isMountedRef.current) {
        console.log('👤 UserProfile: Component unmounted during fetch');
        return;
      }

      if (error) {
        console.error('👤 UserProfile: Error fetching profile:', error);
        handleApiError(error, 'fetch_user_profile');
      }

      // Use improved role determination logic
      const finalRole = determineUserRole(authUser, profile?.role);

      const userData: AuthUser = {
        ...authUser,
        role: finalRole,
        name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        school_id: profile?.school_id || authUser.user_metadata?.school_id || authUser.app_metadata?.school_id,
        avatar_url: profile?.avatar_url
      };

      console.log('👤 UserProfile: Profile fetch completed successfully, setting user data:', {
        email: userData.email,
        role: userData.role,
        school_id: userData.school_id,
        hasProfile: !!profile
      });
      
      if (isMountedRef.current) {
        setUser(userData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ UserProfile: Exception fetching user profile:', error);
      handleApiError(error, 'fetch_user_profile');
      
      if (!isMountedRef.current) return;
      
      // Create fallback user data with improved role determination
      const fallbackRole = determineUserRole(authUser);
      
      const userData: AuthUser = {
        ...authUser,
        role: fallbackRole,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        school_id: authUser.user_metadata?.school_id || authUser.app_metadata?.school_id
      };
      
      console.log('👤 UserProfile: Using fallback user data:', {
        email: userData.email,
        role: userData.role,
        school_id: userData.school_id
      });
      
      if (isMountedRef.current) {
        setUser(userData);
        setIsLoading(false);
      }
    } finally {
      fetchingRef.current = false;
      lastFetchRef.current = null;
      endTimer();
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('🧹 UserProfile: Cleaning up');
    isMountedRef.current = false;
    fetchingRef.current = false;
    lastFetchRef.current = null;
  }, []);

  return {
    fetchUserProfile,
    cleanup
  };
};
