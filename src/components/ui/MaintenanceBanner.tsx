import React from 'react';

const MaintenanceBanner: React.FC = () => {
  return (
    <div className="bg-warning text-warning-foreground text-center py-3 px-4 font-semibold sticky top-0 z-50 border-b">
      NOTICE: The system is currently in Maintenance Mode. Some features may be temporarily unavailable.
    </div>
  );
};

export default MaintenanceBanner;