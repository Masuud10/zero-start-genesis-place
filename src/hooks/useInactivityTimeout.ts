import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const LOGOUT_TIME = 15 * 60 * 1000; // 15 minutes for final logout
const WARNING_TIME = 14 * 60 * 1000; // 14 minutes to show warning

export const useInactivityTimeout = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  const logoutUser = useCallback(() => {
    supabase.auth.signOut();
    navigate('/login', { replace: true });
  }, [navigate]);

  const stayLoggedIn = () => {
    setShowWarning(false); // Hide the modal
    // The timer will be reset automatically by the event listeners
  };

  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;

    const startTimers = () => {
      warningTimer = setTimeout(() => setShowWarning(true), WARNING_TIME);
      logoutTimer = setTimeout(logoutUser, LOGOUT_TIME);
    };

    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      setShowWarning(false); // Hide warning if user becomes active
      startTimers();
    };

    // Start the timers when the hook mounts
    startTimers();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimers));

    // Cleanup function
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      events.forEach(event => window.removeEventListener(event, resetTimers));
    };
  }, [logoutUser]);

  return { showWarning, stayLoggedIn, logoutUser };
}; 