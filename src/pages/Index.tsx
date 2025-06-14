
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import ElimshaLayout from '@/components/ElimshaLayout';
import LandingPage from '@/components/LandingPage';

const Index = () => {
  const { user, isLoading, error } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  console.log('📄 Index: Rendering with state', { 
    hasUser: !!user, 
    isLoading, 
    error,
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
        </div>
      </div>
    );
  }

  // Handle auth errors
  if (error) {
    console.error('📄 Index: Auth error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-800">Authentication Error</h2>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Refresh Page
          </button>
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
