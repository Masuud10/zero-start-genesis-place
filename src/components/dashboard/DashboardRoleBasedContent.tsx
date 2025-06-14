
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

  // Ensure we have a valid user and role
  if (!user || !user.role) {
    console.log("📊 Dashboard: No user or role found, showing default message");
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
            Please wait while we load your role-specific dashboard.
          </p>
          <div className="text-xs text-gray-400 mt-2">
            Debug: User present: {user ? 'Yes' : 'No'} | Role: {user?.role || 'None'} | Email: {user?.email || 'None'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Log detailed role information for debugging
  console.log("📊 Dashboard: User role details:", {
    role: user.role,
    email: user.email,
    userMetadata: user.user_metadata,
    appMetadata: user.app_metadata,
    schoolId: user.school_id
  });

  // Normalize the role to handle any potential casing or formatting issues
  const normalizedRole = user.role.toLowerCase().trim();
  
  console.log("📊 Dashboard: Normalized role:", normalizedRole);

  // For EduFam admins, ALWAYS show admin dashboard regardless of school assignment
  if (normalizedRole === 'edufam_admin' || normalizedRole === 'elimisha_admin') {
    console.log("📊 Dashboard: Rendering ElimshaAdminDashboard for admin role:", user.role);
    return <ElimshaAdminDashboard onModalOpen={onModalOpen} />;
  }

  // For all other roles, check if they have school assignment when needed
  if (!user.school_id && normalizedRole !== 'edufam_admin' && normalizedRole !== 'elimisha_admin') {
    console.log("📊 Dashboard: User has no school assignment, role:", user.role);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Setup Required</CardTitle>
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

  // Render role-specific dashboard based on exact role match
  console.log("📊 Dashboard: Rendering dashboard for normalized role:", normalizedRole);
  
  switch (normalizedRole) {
    case "school_owner":
      console.log("📊 Dashboard: Rendering SchoolOwnerDashboard");
      return <SchoolOwnerDashboard />;
      
    case "principal":
      console.log("📊 Dashboard: Rendering PrincipalDashboard");
      return <PrincipalDashboard />;
      
    case "teacher":
      console.log("📊 Dashboard: Rendering TeacherDashboard");
      return <TeacherDashboard />;
      
    case "finance_officer":
      console.log("📊 Dashboard: Rendering FinanceOfficerDashboard");
      return <FinanceOfficerDashboard onModalOpen={onModalOpen} />;
      
    case "parent":
      console.log("📊 Dashboard: Rendering ParentDashboard");
      return <ParentDashboard />;
      
    default:
      console.log("📊 Dashboard: Unknown role, checking if it's a valid role with different casing:", user.role);
      
      // Handle potential role variations and fallbacks
      const roleVariations = {
        'schoolowner': 'school_owner',
        'financeofficer': 'finance_officer',
        'edufamadmin': 'edufam_admin',
        'elimishaadmin': 'elimisha_admin'
      };
      
      const correctedRole = roleVariations[normalizedRole.replace(/[_\s-]/g, '')];
      
      if (correctedRole) {
        console.log("📊 Dashboard: Found role variation, using:", correctedRole);
        // Recursively call with corrected role
        return <DashboardRoleBasedContent user={{...user, role: correctedRole}} onModalOpen={onModalOpen} />;
      }
      
      console.log("📊 Dashboard: Truly unknown role, showing error:", user.role);
      return (
        <Card>
          <CardHeader>
            <CardTitle>Invalid Role Configuration</CardTitle>
            <CardDescription>
              Your account role needs to be configured properly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Your role "{user.role}" is not recognized. Please contact your administrator to verify your account permissions.
            </p>
            <div className="text-xs text-gray-400 mt-2">
              Debug: Role received: "{user.role || "undefined"}" | Normalized: "{normalizedRole}" | Email: {user.email}
              {user.school_id && ` | School: ${user.school_id.slice(0, 8)}...`}
            </div>
          </CardContent>
        </Card>
      );
  }
};

export default DashboardRoleBasedContent;
