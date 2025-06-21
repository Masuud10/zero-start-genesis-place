
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardRoleBasedContent from '@/components/dashboard/DashboardRoleBasedContent';
import DashboardModals from '@/components/dashboard/DashboardModals';
import DashboardAnnouncements from '@/components/dashboard/DashboardAnnouncements';
import { LoadingCard, ErrorState } from '@/components/common/LoadingStates';
import { UserRole } from '@/types/user';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import RoleGuard from '@/components/common/RoleGuard';
import { useNavigation } from '@/contexts/NavigationContext';

const Dashboard = () => {
  const { user, isLoading, error } = useAuth();
  const { isValid, hasValidRole, redirectPath } = useRoleValidation();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { activeSection } = useNavigation();

  console.log('📊 Dashboard: Rendering with user:', {
    hasUser: !!user,
    userEmail: user?.email,
    userRole: user?.role,
    isLoading,
    error,
    isValid,
    hasValidRole,
    redirectPath,
    activeSection
  });

  // Show loading state
  if (isLoading) {
    console.log('📊 Dashboard: Still loading auth state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingCard 
          title="Loading dashboard..."
          description="Please wait while we prepare your dashboard"
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('📊 Dashboard: Auth error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description="There was a problem with your authentication."
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Show no user state
  if (!user) {
    console.error('📊 Dashboard: No user found - redirecting to login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Access Denied"
          description="You must be logged in to access the dashboard."
          onRetry={() => window.location.href = '/'}
        />
      </div>
    );
  }

  // Modal handlers with error boundaries
  const handleModalOpen = (modalType: string) => {
    try {
      console.log('📊 Dashboard: Opening modal:', modalType);
      setActiveModal(modalType);
    } catch (error) {
      console.error('📊 Dashboard: Error opening modal:', error);
    }
  };

  const handleModalClose = () => {
    try {
      console.log('📊 Dashboard: Closing modal');
      setActiveModal(null);
    } catch (error) {
      console.error('📊 Dashboard: Error closing modal:', error);
    }
  };

  const handleDataChanged = () => {
    try {
      console.log('📊 Dashboard: Data changed, refreshing...');
      // This could trigger data refetch or cache invalidation
      // For now, we'll just close the modal
      setActiveModal(null);
    } catch (error) {
      console.error('📊 Dashboard: Error handling data change:', error);
    }
  };

  console.log('📊 Dashboard: Rendering role-based content for role:', user.role);

  return (
    <RoleGuard requireSchoolAssignment={false}>
      <div className="space-y-6">
        {/* EduFam Admin Announcements */}
        <DashboardAnnouncements />
        
        <DashboardRoleBasedContent 
          user={user} 
          onModalOpen={handleModalOpen}
        />
        
        <DashboardModals 
          activeModal={activeModal}
          onClose={handleModalClose}
          user={user}
          onDataChanged={handleDataChanged}
        />
      </div>
    </RoleGuard>
  );
};

export default Dashboard;
