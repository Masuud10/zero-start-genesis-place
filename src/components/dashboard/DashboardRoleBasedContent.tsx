
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

  console.log(
    "📊 Dashboard: Getting role-based dashboard for role:",
    user?.role,
    "user object:",
    user,
    "school:",
    user?.school_id,
    "currentSchool:",
    currentSchool
  );

  // Enhanced user and role validation
  if (!user) {
    console.log("📊 Dashboard: No user found, showing loading message");
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Dashboard</CardTitle>
          <CardDescription>
            Setting up your dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please wait while we load your dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!user.role) {
    console.log("📊 Dashboard: User has no role, showing error");
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Configuration Required</CardTitle>
          <CardDescription>
            Your account role needs to be configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please contact your administrator to assign you a role.
          </p>
          <div className="text-xs text-gray-400 mt-2">
            Debug: Email: {user.email || 'None'} | Role: {user.role || 'None'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Enhanced role normalization and validation
  const normalizedRole = user.role.toLowerCase().trim();
  
  console.log("📊 Dashboard: Processing user with role:", {
    originalRole: user.role,
    normalizedRole,
    email: user.email,
    schoolId: user.school_id
  });

  // System admin check - handle multiple admin role variations
  const isSystemAdmin = ['edufam_admin', 'elimisha_admin', 'admin', 'systemadmin', 'system_admin'].includes(normalizedRole);
  
  if (isSystemAdmin) {
    console.log("📊 Dashboard: Rendering ElimshaAdminDashboard for admin role:", user.role);
    return <ElimshaAdminDashboard onModalOpen={onModalOpen} />;
  }

  // School assignment check for non-admin roles
  if (!user.school_id) {
    console.log("📊 Dashboard: User has no school assignment, role:", user.role);
    return (
      <Card>
        <CardHeader>
          <CardTitle>School Assignment Required</CardTitle>
          <CardDescription>
            Your account has not been assigned to a school yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please contact your administrator to assign you to a school.
          </p>
          <div className="text-xs text-gray-400 mt-2">
            Debug: Role: {user.role} | Email: {user.email} | School ID: {user.school_id || 'None'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Role-based dashboard rendering with enhanced matching
  console.log("📊 Dashboard: Rendering dashboard for normalized role:", normalizedRole);
  
  // Handle role variations and exact matches
  const roleMapping: { [key: string]: () => React.ReactNode } = {
    'school_owner': () => {
      console.log("📊 Dashboard: Rendering SchoolOwnerDashboard");
      return <SchoolOwnerDashboard />;
    },
    'schoolowner': () => {
      console.log("📊 Dashboard: Rendering SchoolOwnerDashboard (variant)");
      return <SchoolOwnerDashboard />;
    },
    'principal': () => {
      console.log("📊 Dashboard: Rendering PrincipalDashboard");
      return <PrincipalDashboard />;
    },
    'teacher': () => {
      console.log("📊 Dashboard: Rendering TeacherDashboard");
      return <TeacherDashboard />;
    },
    'finance_officer': () => {
      console.log("📊 Dashboard: Rendering FinanceOfficerDashboard");
      return <FinanceOfficerDashboard onModalOpen={onModalOpen} />;
    },
    'financeofficer': () => {
      console.log("📊 Dashboard: Rendering FinanceOfficerDashboard (variant)");
      return <FinanceOfficerDashboard onModalOpen={onModalOpen} />;
    },
    'parent': () => {
      console.log("📊 Dashboard: Rendering ParentDashboard");
      return <ParentDashboard />;
    }
  };

  // Try exact match first
  if (roleMapping[normalizedRole]) {
    return roleMapping[normalizedRole]();
  }

  // Try without underscores/spaces/hyphens
  const cleanRole = normalizedRole.replace(/[_\s-]/g, '');
  if (roleMapping[cleanRole]) {
    console.log("📊 Dashboard: Found role variation, using:", cleanRole);
    return roleMapping[cleanRole]();
  }

  // Fallback for unrecognized roles
  console.log("📊 Dashboard: Unrecognized role, showing error:", user.role);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invalid Role Configuration</CardTitle>
        <CardDescription>
          Your account role is not recognized.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Your role "{user.role}" is not recognized. Please contact your administrator to verify your account permissions.
        </p>
        <div className="text-xs text-gray-400 mt-2">
          Debug: Original Role: "{user.role}" | Normalized: "{normalizedRole}" | Email: {user.email}
          {user.school_id && ` | School: ${user.school_id.slice(0, 8)}...`}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Refresh Page
        </button>
      </CardContent>
    </Card>
  );
};

export default DashboardRoleBasedContent;
