
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SchoolOwnerDashboard from "./SchoolOwnerDashboard";
import PrincipalDashboard from "./PrincipalDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";
import ElimshaAdminDashboard from "./ElimshaAdminDashboard";
import FinanceOfficerDashboard from "./FinanceOfficerDashboard";
import { User } from '@/types/auth';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface DashboardRoleBasedContentProps {
  user: User;
  onModalOpen: (modalType: string) => void;
}

const DashboardRoleBasedContent = ({ user, onModalOpen }: DashboardRoleBasedContentProps) => {
  const { currentSchool } = useSchoolScopedData();

  console.log("📊 Dashboard: Role-based content for user:", {
    email: user?.email,
    role: user?.role,
    schoolId: user?.school_id,
    metadata: {
      user_metadata: user?.user_metadata,
      app_metadata: user?.app_metadata
    }
  });

  // Enhanced user validation
  if (!user) {
    console.log("📊 Dashboard: No user found, showing loading state");
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Dashboard</CardTitle>
          <CardDescription>Setting up your dashboard...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Please wait while we load your dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  // Enhanced role validation
  if (!user.role) {
    console.error("📊 Dashboard: User has no role assigned, this is a critical error");
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Role Configuration Error</CardTitle>
          <CardDescription>Your account role is missing and needs to be configured.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-4">
            Your account does not have a role assigned. Please contact your administrator to assign you a proper role.
          </p>
          <div className="text-xs text-gray-500 mb-4 bg-gray-100 p-2 rounded">
            <strong>Debug Info:</strong><br />
            Email: {user.email || 'None'}<br />
            User ID: {user.id?.slice(0, 8)}...<br />
            Role: {user.role || 'None'}<br />
            School ID: {user.school_id || 'None'}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Refresh Page
          </button>
        </CardContent>
      </Card>
    );
  }

  // Get the exact role string for matching
  const userRole = user.role.toLowerCase().trim();
  
  console.log("📊 Dashboard: Processing role-based routing for:", {
    originalRole: user.role,
    normalizedRole: userRole,
    email: user.email
  });

  // System admin roles - handle first to avoid school checks
  if (userRole === 'edufam_admin' || userRole === 'elimisha_admin') {
    console.log("📊 Dashboard: Rendering ElimshaAdminDashboard for admin role:", user.role);
    return <ElimshaAdminDashboard onModalOpen={onModalOpen} />;
  }

  // School assignment check for non-admin roles
  if (!user.school_id) {
    console.warn("📊 Dashboard: Non-admin user has no school assignment:", {
      role: user.role,
      email: user.email
    });
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-700">School Assignment Required</CardTitle>
          <CardDescription>Your account needs to be assigned to a school.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700 mb-4">
            Your account has not been assigned to a school yet. Please contact your administrator to assign you to a school.
          </p>
          <div className="text-xs text-gray-500 mb-4 bg-gray-100 p-2 rounded">
            <strong>Debug Info:</strong><br />
            Role: {user.role}<br />
            Email: {user.email}<br />
            School ID: {user.school_id || 'None'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Role-based dashboard rendering with exact matching
  console.log("📊 Dashboard: Routing to dashboard for role:", userRole);
  
  switch (userRole) {
    case 'school_owner':
      console.log("📊 Dashboard: Rendering SchoolOwnerDashboard");
      return <SchoolOwnerDashboard />;
      
    case 'principal':
      console.log("📊 Dashboard: Rendering PrincipalDashboard");
      return <PrincipalDashboard />;
      
    case 'teacher':
      console.log("📊 Dashboard: Rendering TeacherDashboard");
      return <TeacherDashboard />;
      
    case 'finance_officer':
      console.log("📊 Dashboard: Rendering FinanceOfficerDashboard");
      return <FinanceOfficerDashboard onModalOpen={onModalOpen} />;
      
    case 'parent':
      console.log("📊 Dashboard: Rendering ParentDashboard");
      return <ParentDashboard />;
      
    default:
      console.error("📊 Dashboard: Unrecognized role encountered:", user.role);
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Role Configuration</CardTitle>
            <CardDescription>Your account role is not recognized by the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              Your role "{user.role}" is not recognized. Please contact your administrator to verify your account permissions.
            </p>
            <div className="text-xs text-gray-500 mb-4 bg-gray-100 p-2 rounded">
              <strong>Debug Info:</strong><br />
              Original Role: "{user.role}"<br />
              Normalized Role: "{userRole}"<br />
              Email: {user.email}<br />
              Valid Roles: school_owner, principal, teacher, finance_officer, parent, edufam_admin
              {user.school_id && <><br />School ID: {user.school_id.slice(0, 8)}...</>}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      );
  }
};

export default DashboardRoleBasedContent;
