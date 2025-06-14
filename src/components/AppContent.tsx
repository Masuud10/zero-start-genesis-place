
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';

const AppContent: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: schoolLoading } = useSchool();
  const [showLogin, setShowLogin] = useState(false);
  const [isStable, setIsStable] = useState(false);

  // Add stability check to prevent premature renders
  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 500); // Increased delay for better stability
      
      return () => clearTimeout(timer);
    } else {
      setIsStable(false);
    }
  }, [authLoading]);

  console.log('🎯 AppContent: Rendering', { 
    hasUser: !!user, 
    authLoading, 
    schoolLoading,
    isStable,
    userRole: user?.role,
    userSchoolId: user?.school_id,
    showLogin
  });

  // Show loading screen while authentication is initializing or stabilizing
  if (authLoading || !isStable) {
    console.log('🎯 AppContent: Auth loading or stabilizing, showing loading screen');
    return <LoadingScreen />;
  }

  // If no user, show landing page or login
  if (!user) {
    console.log('🎯 AppContent: No user, showing landing page or login form');
    
    if (showLogin) {
      return <LoginForm />;
    }
    
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // For authenticated users, show loading only for school data if needed
  // Skip school loading for system admins and parents as they don't need school context initially
  const shouldShowSchoolLoading = schoolLoading && 
    user.role !== 'parent' && 
    user.role !== 'elimisha_admin' && 
    user.role !== 'edufam_admin';
  
  if (shouldShowSchoolLoading) {
    console.log('🎯 AppContent: User authenticated but schools loading for role:', user.role);
    return <LoadingScreen />;
  }

  console.log('🎯 AppContent: User authenticated and stable, showing main layout');
  return <ElimshaLayout />;
};

export default AppContent;
