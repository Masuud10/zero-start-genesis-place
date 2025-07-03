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
    console.log("ParentDashboard: Opening modal:", modalType);
    // Delegate to parent if available
    if (onModalOpen) {
      onModalOpen(modalType);
    }
  };

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
