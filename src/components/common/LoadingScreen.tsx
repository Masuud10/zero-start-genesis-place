
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-96">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Loading Elimisha</h2>
              <p className="text-gray-600 mt-2">Please wait while we set up your workspace...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingScreen;
