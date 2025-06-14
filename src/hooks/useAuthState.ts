
import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { RoleResolver } from '@/utils/roleResolver';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMountedRef = useRef(true);
  const processedUserRef = useRef<string | null>(null);

  const processUser = async (authUser: SupabaseUser | null) => {
    if (!isMountedRef.current) return;
    
    if (!authUser) {
      setUser(null);
      setIsLoading(false);
      processedUserRef.current = null;
      return;
    }

    // Avoid duplicate processing
    if (processedUserRef.current === authUser.id) {
      return;
    }
    
    processedUserRef.current = authUser.id;
    
    try {
      console.log('🔐 AuthState: Processing user:', authUser.email);
      
      // Try to fetch profile with timeout
      const profilePromise = supabase
        .from('profiles')
        .select('role, name, school_id, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      let profile = null;
      try {
        const { data } = await Promise.race([profilePromise, timeoutPromise]) as any;
        profile = data;
      } catch (profileError) {
        console.warn('🔐 AuthState: Profile fetch failed, using fallback:', profileError);
      }
      
      // Resolve role using the new resolver
      const role = RoleResolver.resolveRole(authUser, profile?.role);
      
      const userData: AuthUser = {
        ...authUser,
        role,
        name: profile?.name || 
              authUser.user_metadata?.name || 
              authUser.user_metadata?.full_name ||
              authUser.email?.split('@')[0] || 
              'User',
        school_id: profile?.school_id || 
                   authUser.user_metadata?.school_id || 
                   authUser.app_metadata?.school_id,
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url
      };
      
      console.log('🔐 AuthState: User processed successfully:', {
        email: userData.email,
        role: userData.role,
        school_id: userData.school_id,
        hasProfile: !!profile
      });
      
      if (isMountedRef.current) {
        setUser(userData);
        setError(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('🔐 AuthState: Error processing user:', error);
      if (isMountedRef.current) {
        setError('Failed to load user profile');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthState: Auth state changed:', event);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setIsLoading(false);
          setError(null);
          processedUserRef.current = null;
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await processUser(session.user);
        }
      }
    );
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await processUser(session?.user || null);
      } catch (error) {
        console.error('🔐 AuthState: Error getting initial session:', error);
        if (isMountedRef.current) {
          setError('Failed to initialize session');
          setIsLoading(false);
        }
      }
    };
    
    getInitialSession();
    
    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    error,
    retry: () => {
      if (user) {
        processedUserRef.current = null;
        processUser(user);
      }
    }
  };
};
