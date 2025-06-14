
import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowWarning(true);
      console.warn('LoadingScreen: Taking longer than expected');
    }, 10000); // Show warning after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
          <span className="text-2xl text-white">🎓</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Loading EduFam</h2>
        <p className="text-muted-foreground">
          {showSlowWarning 
            ? "This is taking longer than usual. Please check your connection."
            : "Setting up your school management system..."
          }
        </p>
        {showSlowWarning && (
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Refresh Page
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
