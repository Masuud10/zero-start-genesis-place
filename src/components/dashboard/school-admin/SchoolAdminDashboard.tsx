
import React from 'react';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useSchoolAdminStats } from '@/hooks/useSchoolAdminStats';
import { ErrorBoundary } from '@/utils/errorBoundary';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import SchoolAdminWelcomeHeader from './SchoolAdminWelcomeHeader';
import SchoolAdminStatsCards from './SchoolAdminStatsCards';
import SchoolAdminQuickActions from './SchoolAdminQuickActions';

interface SchoolAdminDashboardProps {
  user?: AuthUser;
  onModalOpen?: (modalType: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ 
  user, 
  onModalOpen = () => {} 
}) => {
  console.log('🏫 SchoolAdminDashboard: Rendering for school admin:', user?.email, 'Role:', user?.role);

  const { schoolId, validateSchoolAccess } = useSchoolScopedData();
  const { stats, loading, error } = useSchoolAdminStats(schoolId || undefined);

  // Validate school access
  if (schoolId && !validateSchoolAccess(schoolId)) {
    return (
      <ErrorMessage 
        error="Access denied to school data. Please contact your administrator."
        className="max-w-md mx-auto mt-20"
      />
    );
  }

  if (!schoolId) {
    return (
      <ErrorMessage 
        error="No school assignment found. Please contact your administrator to assign you to a school."
        className="max-w-md mx-auto mt-20"
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error}
        onRetry={() => window.location.reload()}
        className="max-w-md mx-auto mt-20"
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading school dashboard..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <SchoolAdminWelcomeHeader user={user} />
        <SchoolAdminStatsCards stats={stats} loading={loading} />
        <SchoolAdminQuickActions onModalOpen={onModalOpen} />
      </div>
    </ErrorBoundary>
  );
};

export default SchoolAdminDashboard;
