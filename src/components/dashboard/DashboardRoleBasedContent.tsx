
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SchoolOwnerDashboard from "./SchoolOwnerDashboard";
import PrincipalDashboard from "./PrincipalDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";
import ElimshaAdminDashboard from "./ElimshaAdminDashboard";
import FinanceOfficerDashboard from "./FinanceOfficerDashboard";
import { User } from '@/types/auth';

interface DashboardRoleBasedContentProps {
  user: User;
  onModalOpen: (modalType: string) => void;
}

const DashboardRoleBasedContent = ({ user, onModalOpen }: DashboardRoleBasedContentProps) => {
  console.log("📊 DashboardRoleBasedContent: Rendering for user:", {
    email: user?.email,
    role: user?.role,
    schoolId: user?.school_id,
    userMetadata: user?.user_metadata,
    appMetadata: user?.app_metadata
  });

  // Ensure we have a user
  if (!user) {
    console.error("📊 DashboardRoleBasedContent: No user provided");
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
          <CardDescription>User information is missing. Please refresh the page.</CardDescription>
        </CardHeader>
        <CardContent>
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

  // Ensure we have a valid role
  if (!user.role) {
    console.error("📊 DashboardRoleBasedContent: User has no role assigned:", {
      userId: user.id,
      email: user.email,
      metadata: user.user_metadata,
      appMetadata: user.app_metadata
    });
    return (
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

  // Role-based dashboard routing - NO HARDCODED FALLBACKS
  console.log("📊 DashboardRoleBasedContent: Routing based on role:", user.role);
  
  switch (user.role) {
    case 'edufam_admin':
    case 'elimisha_admin':
      console.log("📊 DashboardRoleBasedContent: Rendering ElimshaAdminDashboard");
      return <ElimshaAdminDashboard onModalOpen={onModalOpen} />;
      
    case 'school_owner':
      console.log("📊 DashboardRoleBasedContent: Rendering SchoolOwnerDashboard");
      return <SchoolOwnerDashboard />;
      
    case 'principal':
      console.log("📊 DashboardRoleBasedContent: Rendering PrincipalDashboard");
      return <PrincipalDashboard />;
      
    case 'teacher':
      console.log("📊 DashboardRoleBasedContent: Rendering TeacherDashboard");
      return <TeacherDashboard />;
      
    case 'finance_officer':
      console.log("📊 DashboardRoleBasedContent: Rendering FinanceOfficerDashboard");
      return <FinanceOfficerDashboard onModalOpen={onModalOpen} />;
      
    case 'parent':
      console.log("📊 DashboardRoleBasedContent: Rendering ParentDashboard");
      return <ParentDashboard />;
      
    default:
      console.error("📊 DashboardRoleBasedContent: Unrecognized role:", user.role);
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Role</CardTitle>
            <CardDescription>Your account role "{user.role}" is not recognized by the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              Please contact your administrator to verify your account permissions.
            </p>
            <div className="text-xs text-gray-400 mb-4 bg-gray-100 p-2 rounded text-left">
              <strong>Debug Information:</strong><br />
              Email: {user.email}<br />
              Role: {user.role}<br />
              Valid Roles: edufam_admin, school_owner, principal, teacher, finance_officer, parent
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
