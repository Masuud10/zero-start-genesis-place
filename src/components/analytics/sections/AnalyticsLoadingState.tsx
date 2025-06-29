
import React from 'react';
import { Loader2, TrendingUp } from 'lucide-react';

const AnalyticsLoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics Overview</h3>
      </div>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-2" />
        <span className="text-gray-600">Loading comprehensive analytics...</span>
      </div>
    </div>
  );
};

export default AnalyticsLoadingState;
