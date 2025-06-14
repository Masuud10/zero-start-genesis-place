import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Dashboard from '@/components/Dashboard';
import GradesModule from '@/components/modules/GradesModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import StudentsModule from '@/components/modules/StudentsModule';
import FinanceModule from '@/components/modules/FinanceModule';
import TimetableModule from '@/components/modules/TimetableModule';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import MessagesModule from '@/components/modules/MessagesModule';
import ReportsModule from '@/components/modules/ReportsModule';
import SupportModule from '@/components/modules/SupportModule';
import SettingsModule from '@/components/modules/SettingsModule';
import SecurityModule from '@/components/modules/SecurityModule';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePermissions, PERMISSIONS } from '@/utils/permissions';
import { UserRole } from '@/types/user';

const ElimshaLayout = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, signOut } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  console.log('🏗️ ElimshaLayout: Rendering for user role:', user?.role, 'active section:', activeSection);
  console.log('🏗️ ElimshaLayout: User details:', {
    email: user?.email,
    role: user?.role,
    schoolId: user?.school_id,
    userId: user?.id?.slice(0, 8) + '...',
    hasUserMetadata: !!user?.user_metadata,
    hasAppMetadata: !!user?.app_metadata
  });

  // Early return if no user
  if (!user) {
    console.log('🏗️ ElimshaLayout: No user found, this should not happen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>
              User authentication failed. Please try logging in again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Validate user role
  if (!user.role) {
    console.error('🏗️ ElimshaLayout: User has no role assigned:', {
      userId: user.id,
      email: user.email,
      hasUserMetadata: !!user.user_metadata,
      hasAppMetadata: !!user.app_metadata,
      userMetadataRole: user.user_metadata?.role || 'None',
      appMetadataRole: user.app_metadata?.role || 'None'
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Role Configuration Error</CardTitle>
            <CardDescription>Your account role is missing and needs to be configured.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              Your account does not have a role assigned. Please contact your administrator.
            </p>
            <div className="text-xs text-gray-400 mb-4 bg-gray-100 p-2 rounded text-left">
              <strong>Debug Information:</strong><br />
              Email: {user.email}<br />
              Role: {user.role || 'None'}<br />
              User ID: {user.id?.slice(0, 8)}...<br />
              School ID: {user.school_id || 'None'}<br />
              User Metadata Role: {user.user_metadata?.role || 'None'}<br />
              App Metadata Role: {user.app_metadata?.role || 'None'}
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

  // Use the permissions system
  const { hasPermission, getPermissionScope } = usePermissions(
    user?.role as UserRole, 
    user?.school_id
  );

  const checkAccess = (section: string): boolean => {
    if (!user?.role) {
      console.log('🏗️ ElimshaLayout: No user role, denying access to', section);
      return false;
    }

    console.log('🏗️ ElimshaLayout: Checking access for role', user.role, 'to section', section);

    // Always allow dashboard access
    if (section === 'dashboard') return true;

    // Check permissions based on section
    switch (section) {
      case 'grades':
        return hasPermission(PERMISSIONS.VIEW_GRADEBOOK);
      case 'attendance':
        return hasPermission(PERMISSIONS.VIEW_ATTENDANCE);
      case 'students':
        return hasPermission(PERMISSIONS.VIEW_CLASS_INFO);
      case 'finance':
        return hasPermission(PERMISSIONS.VIEW_FEE_BALANCE);
      case 'timetable':
        return hasPermission(PERMISSIONS.VIEW_TIMETABLE);
      case 'announcements':
        return hasPermission(PERMISSIONS.VIEW_ANNOUNCEMENTS);
      case 'messages':
        return hasPermission(PERMISSIONS.SEND_MESSAGES);
      case 'reports':
        return hasPermission(PERMISSIONS.VIEW_REPORTS);
      case 'analytics':
        return hasPermission(PERMISSIONS.VIEW_ANALYTICS);
      case 'schools':
        return hasPermission(PERMISSIONS.VIEW_OTHER_SCHOOLS);
      case 'users':
        return hasPermission(PERMISSIONS.MANAGE_USERS);
      case 'billing':
        return hasPermission(PERMISSIONS.VIEW_FEE_BALANCE) || 
               user.role === 'edufam_admin';
      case 'system-health':
        return user.role === 'edufam_admin';
      case 'settings':
        return user.role === 'edufam_admin';
      case 'security':
        return hasPermission(PERMISSIONS.MANAGE_SECURITY);
      case 'support':
        return hasPermission(PERMISSIONS.ACCESS_SUPPORT);
      default:
        console.log('🏗️ ElimshaLayout: Unknown section, denying access:', section);
        return false;
    }
  };

  const renderContent = () => {
    console.log('🏗️ ElimshaLayout: Rendering content for section:', activeSection, 'user role:', user?.role);

    // Check access before rendering
    if (!checkAccess(activeSection)) {
      console.log('🏗️ ElimshaLayout: Access denied, showing access denied message');
      
      const permissionScope = getPermissionScope(PERMISSIONS.VIEW_GRADEBOOK);
      const scopeDescription = permissionScope ? ` (Scope: ${permissionScope})` : '';
      
      return (
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this section. 
              <br />
              Your role: {user?.role}{scopeDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator if you believe you should have access to this feature.
            </p>
          </CardContent>
        </Card>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        console.log('🏗️ ElimshaLayout: Rendering Dashboard component for role:', user?.role);
        return <Dashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'grades':
        return <GradesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'students':
        return <StudentsModule />;
      case 'finance':
        return <FinanceModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'messages':
        return <MessagesModule />;
      case 'reports':
        return <ReportsModule />;
      case 'support':
        return <SupportModule />;
      case 'settings':
        return <SettingsModule />;
      case 'security':
        return <SecurityModule />;
      case 'schools':
        return <SchoolsModule />;
      case 'users':
        return <UsersModule />;
      case 'billing':
        return <BillingModule />;
      case 'system-health':
        return <SystemHealthModule />;
      default:
        console.log('🏗️ ElimshaLayout: Unknown section, showing dashboard');
        return <Dashboard />;
    }
  };

  const handleSectionChange = (section: string) => {
    console.log(`🔄 ElimshaLayout: Attempting to switch to section: ${section} for user role: ${user?.role}`);
    
    if (checkAccess(section)) {
      console.log(`✅ ElimshaLayout: Access granted, switching to ${section}`);
      setActiveSection(section);
    } else {
      console.log(`❌ ElimshaLayout: Access denied to ${section}`);
      toast({
        title: "Access Denied",
        description: `You don't have permission to access ${section}. Your role: ${user?.role}`,
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Transform the school data to match the expected School interface
  const transformedSchool = currentSchool ? {
    id: currentSchool.id,
    name: currentSchool.name,
    ownerId: currentSchool.owner_id || '',
    principalId: currentSchool.principal_id || '',
    address: currentSchool.address || '',
    phone: currentSchool.phone || '',
    email: currentSchool.email || '',
    logo: currentSchool.logo_url,
    settings: {
      academicYear: new Date().getFullYear().toString(),
      terms: [],
      gradeReleaseEnabled: true,
      attendanceEnabled: true,
    }
  } : null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />
        <SidebarInset className="flex-1">
          <DashboardContainer 
            user={user} 
            currentSchool={transformedSchool} 
            onLogout={handleLogout}
            showHeader={true}
            showGreetings={activeSection === 'dashboard'} // Only show greetings on dashboard
          >
            {renderContent()}
          </DashboardContainer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ElimshaLayout;
