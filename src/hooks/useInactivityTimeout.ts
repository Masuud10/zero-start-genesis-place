import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes (1 minute warning)

export const useInactivityTimeout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef<boolean>(false);

  const logoutUser = useCallback(() => {
    console.log('🔄 Auto-logout due to inactivity');
    
    // Clear any existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Sign out from Supabase
    supabase.auth.signOut().then(() => {
      console.log('✅ User signed out successfully');
      
      // Show logout notification
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity. Please log in again.",
        variant: "destructive",
      });

      // Redirect to login page
      navigate('/login', { replace: true });
    }).catch((error) => {
      console.error('❌ Error during auto-logout:', error);
      // Still redirect even if logout fails
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      
      toast({
        title: "Session Expiring Soon",
        description: "You will be logged out in 1 minute due to inactivity. Move your mouse or press a key to stay logged in.",
        variant: "destructive",
        duration: 60000, // Show for 1 minute
      });
    }
  }, []);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Reset warning flag
    warningShownRef.current = false;

    // Set new timers
    warningTimerRef.current = setTimeout(showWarning, WARNING_TIMEOUT_MS);
    inactivityTimerRef.current = setTimeout(logoutUser, INACTIVITY_TIMEOUT_MS);
  }, [logoutUser, showWarning]);

  useEffect(() => {
    // Only activate the timer if user is authenticated
    if (!user) {
      return;
    }

    const events = [
      'mousedown', 
      'mousemove', 
      'keydown', 
      'scroll', 
      'touchstart',
      'click',
      'focus',
      'input'
    ];

    // Add event listeners to reset the timer on any activity
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Initialize the timer when the hook mounts
    resetTimer();

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, resetTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, []);
}; 