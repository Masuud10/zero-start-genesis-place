
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import EduFamAdminDashboard from './edufam-admin/EduFamAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import ParentDashboard from './parent/ParentDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const { schoolId, isSystemAdmin } = useSchoolScopedData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to access the dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  // Role-based dashboard rendering
  switch (user.role) {
    case 'edufam_admin':
      return <EduFamAdminDashboard onModalOpen={() => {}} />;
    
    case 'principal':
    case 'school_owner':
      if (!schoolId) {
        return (
          <Card className="max-w-md mx-auto mt-20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">School Assignment Required</h3>
              <p className="text-muted-foreground">
                Your account needs to be assigned to a school. Please contact the system administrator.
              </p>
            </CardContent>
          </Card>
        );
      }
      return <SchoolAdminDashboard />;
    
    case 'teacher':
      if (!schoolId) {
        return (
          <Card className="max-w-md mx-auto mt-20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">School Assignment Required</h3>
              <p className="text-muted-foreground">
                Your account needs to be assigned to a school. Please contact your principal.
              </p>
            </CardContent>
          </Card>
        );
      }
      return <TeacherDashboard user={user} onModalOpen={() => {}} />;
    
    case 'parent':
      return <ParentDashboard />;
    
    default:
      return (
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invalid Role</h3>
            <p className="text-muted-foreground">
              Your account role is not recognized. Please contact support.
            </p>
          </CardContent>
        </Card>
      );
  }
};

export default AdminDashboard;
