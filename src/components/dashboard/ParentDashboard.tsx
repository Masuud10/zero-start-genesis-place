import React from "react";
import { AuthUser } from "@/types/auth";
import { useParentDashboardStats } from "@/hooks/useParentDashboardStats";
import ParentStatCards from "./parent/ParentStatCards";
import ParentActionButtons from "./parent/ParentActionButtons";
import ParentFeeOverview from "./parent/ParentFeeOverview";
import ChildrenGradesSection from "./parent/ChildrenGradesSection";

interface ParentDashboardProps {
  user: AuthUser;
  onModalOpen?: (modalType: string) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
  user,
  onModalOpen,
}) => {
  console.log("👨‍👩‍👧‍👦 ParentDashboard: Rendering for parent:", user.email);
  const { stats, loading } = useParentDashboardStats(user);

  const handleModalOpen = (modalType: string) => {
    try {
      console.log("ParentDashboard: Opening modal:", modalType);
      // Delegate to parent if available
      if (onModalOpen) {
        onModalOpen(modalType);
      }
    } catch (error) {
      console.error("Error opening modal:", modalType, error);
    }
  };

  // Enhanced role validation with security logging
  if (!user) {
    console.error("ParentDashboard: No user found");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg border shadow-sm max-w-md w-full">
          <div className="text-center text-red-600">
            <p>Authentication Required</p>
            <p className="text-sm mt-1">
              Please log in to access the parent dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "parent") {
    console.error("ParentDashboard: Invalid user role", user.role, "for user", user.email);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg border shadow-sm max-w-md w-full">
          <div className="text-center text-red-600">
            <p>Access Denied</p>
            <p className="text-sm mt-1">
              This dashboard is only available for parents. Your role: {user.role}
            </p>
            <p className="text-sm mt-2">
              Please contact your school administrator if this is incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if parent has any children assigned
  if (!loading && stats.childrenCount === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg border shadow-sm max-w-md w-full">
          <div className="text-center text-gray-600">
            <p>No Children Assigned</p>
            <p className="text-sm mt-1">
              You don't have any children assigned to your account.
            </p>
            <p className="text-sm mt-2">
              Please contact your school administrator to link your children.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ParentStatCards stats={stats} loading={loading} />
      <ChildrenGradesSection />
      <ParentFeeOverview />

      <ParentActionButtons onModalOpen={handleModalOpen} />
    </div>
  );
};

export default ParentDashboard;
