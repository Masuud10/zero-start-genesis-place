
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
  console.log(
    "📊 Dashboard: Getting role-based dashboard for role:",
    user?.role,
    "school:",
    user?.school_id
  );

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
    case "elimisha_admin":
    case "edufam_admin":
      console.log("📊 Dashboard: Rendering ElimshaAdminDashboard");
      return <ElimshaAdminDashboard onModalOpen={onModalOpen} />;
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
