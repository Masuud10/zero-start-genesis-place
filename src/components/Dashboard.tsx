
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardRoleBasedContent from '@/components/dashboard/DashboardRoleBasedContent';
import DashboardModals from '@/components/dashboard/DashboardModals';
import { LoadingCard, ErrorState } from '@/components/common/LoadingStates';
import { UserRole } from '@/types/user';

const Dashboard = () => {
  const { user, isLoading, error } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  console.log('📊 Dashboard: Rendering with user:', {
    hasUser: !!user,
    userEmail: user?.email,
    userRole: user?.role,
    isLoading,
    error
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
    console.error('📊 Dashboard: No user found - this should redirect to login');
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

  // Validate user role - fix the validation logic
  const validRoles: UserRole[] = ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin'];
  const userRole = user.role as UserRole;
  
  if (!userRole || !validRoles.includes(userRole)) {
    console.error('📊 Dashboard: Invalid or missing user role:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      validRoles
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Role Configuration Error"
          description="Your account role is not properly configured."
          error={`Current role: "${user.role || 'None'}" is not valid. Valid roles: ${validRoles.join(', ')}`}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  console.log('📊 Dashboard: Rendering role-based content for role:', userRole);

  // Add error boundary for modal operations
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

  return (
    <div className="space-y-6">
      <DashboardRoleBasedContent 
        user={user} 
        onModalOpen={handleModalOpen}
      />
      
      <DashboardModals 
        activeModal={activeModal}
        onClose={handleModalClose}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
