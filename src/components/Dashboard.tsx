
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardRoleBasedContent from '@/components/dashboard/DashboardRoleBasedContent';
import DashboardModals from '@/components/dashboard/DashboardModals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading dashboard...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('📊 Dashboard: Auth error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem with your authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show no user state
  if (!user) {
    console.error('📊 Dashboard: No user found - this should redirect to login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You must be logged in to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={() => window.location.href = '/'} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Go to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validate user role
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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Role Configuration Error</CardTitle>
            <CardDescription>
              Your account role is not properly configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              Current role: "{user.role || 'None'}" is not valid.
            </p>
            <div className="text-xs text-gray-400 mb-4 bg-gray-100 p-2 rounded">
              <strong>Valid roles:</strong> {validRoles.join(', ')}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('📊 Dashboard: Rendering role-based content for role:', userRole);

  return (
    <div className="space-y-6">
      <DashboardRoleBasedContent 
        user={user} 
        onModalOpen={setActiveModal}
      />
      
      <DashboardModals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
