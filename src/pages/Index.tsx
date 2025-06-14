
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import ElimshaLayout from '@/components/ElimshaLayout';
import LandingPage from '@/components/LandingPage';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  console.log('📄 Index: Rendering with state', { 
    hasUser: !!user, 
    isLoading, 
    userEmail: user?.email,
    showLogin
  });

  if (isLoading) {
    console.log('📄 Index: Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-2xl text-white">🎓</span>
          </div>
          <p className="text-muted-foreground">Loading EduFam school management system...</p>
          <div className="text-xs text-gray-400">
            Debug: {isLoading ? 'Loading...' : 'Not loading'} | User: {user ? 'Present' : 'None'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('📄 Index: Showing landing page or login form');
    
    if (showLogin) {
      return <LoginForm />;
    }
    
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  console.log('📄 Index: Showing main app for user:', user.email);

  return <ElimshaLayout />;
};

export default Index;
