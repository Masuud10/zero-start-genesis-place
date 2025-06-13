
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SchoolOwnerDashboard from "./SchoolOwnerDashboard";
import PrincipalDashboard from "./PrincipalDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";
import ElimshaAdminDashboard from "./ElimshaAdminDashboard";
import FinanceOfficerDashboard from "./FinanceOfficerDashboard";
import EmptySchoolDashboard from "./EmptySchoolDashboard";
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
    "school:",
    user?.school_id,
    "currentSchool:",
    currentSchool
  );

  // For Elimisha/EduFam admins, show admin dashboard
  if (user?.role === 'elimisha_admin' || user?.role === 'edufam_admin') {
    console.log("📊 Dashboard: Rendering ElimshaAdminDashboard");
    return <ElimshaAdminDashboard onModalOpen={onModalOpen} />;
  }

  // For all other roles, check if they have school assignment and if school has data
  if (!user?.school_id) {
    console.log("📊 Dashboard: User has no school assignment");
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
            Please contact your administrator to assign you to a school. Your role: {user?.role}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Check if this appears to be a fresh school setup (no meaningful data yet)
  // For now, we'll render the appropriate dashboard, but schools can start with empty state
  const shouldShowEmptyDashboard = false; // We'll let individual dashboards handle empty states

  if (shouldShowEmptyDashboard) {
    console.log("📊 Dashboard: Showing empty school dashboard for new school");
    return (
      <EmptySchoolDashboard 
        user={user} 
        schoolName={currentSchool?.name}
      />
    );
  }

  // Render role-specific dashboard
  switch (user?.role) {
    case "school_owner":
      console.log("📊 Dashboard: Rendering SchoolOwnerDashboard");
      return <SchoolOwnerDashboard onModalOpen={onModalOpen} />;
    case "principal":
      console.log("📊 Dashboard: Rendering PrincipalDashboard");
      return <PrincipalDashboard onModalOpen={onModalOpen} />;
    case "teacher":
      console.log("📊 Dashboard: Rendering TeacherDashboard");
      return <TeacherDashboard onModalOpen={onModalOpen} />;
    case "parent":
      console.log("📊 Dashboard: Rendering ParentDashboard");
      return <ParentDashboard onModalOpen={onModalOpen} />;
    case "finance_officer":
      console.log("📊 Dashboard: Rendering FinanceOfficerDashboard");
      return <FinanceOfficerDashboard onModalOpen={onModalOpen} />;
    default:
      console.log(
        "📊 Dashboard: Unknown role, showing access denied:",
        user?.role
      );
      return (
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have the permission to view this dashboard. Your role:{" "}
              {user?.role || "undefined"}
              {user?.school_id && ` | School: ${user.school_id.slice(0, 8)}...`}
            </CardDescription>
          </CardHeader>
        </Card>
      );
  }
};

export default DashboardRoleBasedContent;
