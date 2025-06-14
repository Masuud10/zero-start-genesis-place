
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
  console.log("📊 Dashboard: Role-based content for user:", {
    email: user?.email,
    role: user?.role,
    schoolId: user?.school_id
  });

  if (!user?.role) {
    console.error("📊 Dashboard: User has no role assigned");
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

  // Role-based dashboard routing
  switch (user.role) {
    case 'edufam_admin':
      console.log("📊 Dashboard: Rendering ElimshaAdminDashboard");
      return <ElimshaAdminDashboard onModalOpen={onModalOpen} />;
      
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
      console.error("📊 Dashboard: Unrecognized role:", user.role);
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Role</CardTitle>
            <CardDescription>Your account role "{user.role}" is not recognized.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              Please contact your administrator to verify your account permissions.
            </p>
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
