
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { ErrorBoundary } from '@/utils/errorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import EduFamAdminDashboard from './edufam-admin/EduFamAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './parent/ParentDashboard';

const AdminDashboard = () => {
  const { user, isLoading, error } = useAuth();
  const { schoolId } = useSchoolScopedData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error}
        onRetry={() => window.location.reload()}
        className="max-w-md mx-auto mt-20"
      />
    );
  }

  if (!user) {
    return (
      <ErrorMessage 
        error="Please log in to access the dashboard."
        className="max-w-md mx-auto mt-20"
      />
    );
  }

  const handleModalOpen = (modalType: string) => {
    console.log('AdminDashboard: Opening modal:', modalType);
    // Handle modal opening logic here
  };

  // Role-based dashboard rendering with proper error boundaries
  return (
    <ErrorBoundary>
      {(() => {
        switch (user.role) {
          case 'edufam_admin':
            return <EduFamAdminDashboard onModalOpen={handleModalOpen} />;
          
          case 'principal':
          case 'school_owner':
            if (!schoolId) {
              return (
                <ErrorMessage 
                  error="Your account needs to be assigned to a school. Please contact the system administrator."
                  className="max-w-md mx-auto mt-20"
                />
              );
            }
            return <SchoolAdminDashboard user={user} onModalOpen={handleModalOpen} />;
          
          case 'teacher':
            if (!schoolId) {
              return (
                <ErrorMessage 
                  error="Your account needs to be assigned to a school. Please contact your principal."
                  className="max-w-md mx-auto mt-20"
                />
              );
            }
            return <TeacherDashboard user={user} onModalOpen={handleModalOpen} />;
          
          case 'parent':
            return <ParentDashboard />;
          
          default:
            return (
              <ErrorMessage 
                error={`Invalid user role: ${user.role}. Please contact support.`}
                className="max-w-md mx-auto mt-20"
              />
            );
        }
      })()}
    </ErrorBoundary>
  );
};

export default AdminDashboard;
