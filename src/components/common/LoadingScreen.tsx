
import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [loadingText, setLoadingText] = useState('Loading EduFam...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messages = [
      'Loading EduFam...',
      'Preparing your dashboard...',
      'Setting up your workspace...',
      'Almost ready...'
    ];

    let messageIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      // Update progress
      progressValue += Math.random() * 15 + 5; // Random increment between 5-20
      if (progressValue > 90) progressValue = 90; // Cap at 90% to avoid 100% before actually loaded
      setProgress(progressValue);

      // Update message every 2 seconds
      if (progressValue > 25 && messageIndex < messages.length - 1) {
        messageIndex++;
        setLoadingText(messages[messageIndex]);
      }

      // Clear interval after reasonable time to prevent infinite loading
      if (progressValue >= 90) {
        clearInterval(interval);
        // Set final message after a delay
        setTimeout(() => {
          setLoadingText('Finalizing...');
          setProgress(95);
        }, 1000);
      }
    }, 800);

    // Cleanup timeout to prevent memory leaks
    const timeoutId = setTimeout(() => {
      clearInterval(interval);
      console.warn('LoadingScreen: Taking longer than expected');
      setLoadingText('This is taking longer than expected...');
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
          <span className="text-2xl text-white">🎓</span>
        </div>
        
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg font-medium text-blue-900">{loadingText}</p>
          <p className="text-sm text-gray-600">Preparing your school management experience</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="text-xs text-gray-400">
          {progress < 90 ? `${Math.round(progress)}%` : 'Almost there...'}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
