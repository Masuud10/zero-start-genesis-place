import React from 'react';
import { useMaintenanceStatus } from '@/hooks/useMaintenanceStatus';
import MaintenancePage from '@/pages/MaintenancePage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface MaintenanceGateProps {
  children: React.ReactNode;
}

const MaintenanceGate: React.FC<MaintenanceGateProps> = ({ children }) => {
  const { isLoading, isMaintenanceMode, isAdmin } = useMaintenanceStatus();

  if (isLoading) {
    return <LoadingSpinner />; // Show a loading screen while we check
  }

  if (isMaintenanceMode && !isAdmin) {
    // If maintenance is ON and user is NOT an admin, block access.
    return <MaintenancePage />;
  }

  // Otherwise, allow access to the rest of the application.
  return <>{children}</>;
};

export default MaintenanceGate;
