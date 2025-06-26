
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EduFamAdminDashboard from './dashboard/EduFamAdminDashboard';
import PrincipalDashboard from './dashboard/PrincipalDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';
import ParentDashboard from './dashboard/ParentDashboard';
import FinanceOfficerDashboard from './dashboard/FinanceOfficerDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  console.log('🎯 Dashboard: Rendering for user:', user?.email, 'role:', user?.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          User not authenticated. Please log in to access the dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  // Route to appropriate dashboard based on user role with proper logging
  console.log('🎯 Dashboard: Routing based on role:', user.role);
  
  switch (user.role) {
    case 'edufam_admin':
    case 'elimisha_admin':
      console.log('🎯 Dashboard: Routing to EduFam Admin Dashboard');
      return <EduFamAdminDashboard />;
    
    case 'principal':
    case 'school_owner':
      console.log('🎯 Dashboard: Routing to Principal Dashboard');
      return <PrincipalDashboard user={user} />;
    
    case 'teacher':
      console.log('🎯 Dashboard: Routing to Teacher Dashboard');
      return <TeacherDashboard user={user} />;
    
    case 'finance_officer':
      console.log('🎯 Dashboard: Routing to Finance Officer Dashboard');
      return <FinanceOfficerDashboard user={user} />;
    
    case 'parent':
      console.log('🎯 Dashboard: Routing to Parent Dashboard');
      return <ParentDashboard user={user} />;
    
    default:
      console.warn('🎯 Dashboard: Unknown user role:', user.role);
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unknown user role: {user.role}. Please contact your administrator.
          </AlertDescription>
        </Alert>
      );
  }
};

export default Dashboard;
