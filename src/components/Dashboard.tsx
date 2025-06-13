
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import DashboardRoleBasedContent from "./dashboard/DashboardRoleBasedContent";
import DashboardModals from "./dashboard/DashboardModals";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { currentSchool } = useSchoolScopedData();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  console.log(
    "📊 Dashboard: Rendering for user",
    user?.email,
    "role:",
    user?.role,
    "school:",
    user?.school_id
  );

  const openModal = (modalType: string) => {
    console.log("📊 Dashboard: Opening modal", modalType);
    setActiveModal(modalType);
  };

  const closeModal = () => {
    console.log("📊 Dashboard: Closing modal");
    setActiveModal(null);
  };

  if (!user) {
    console.log("📊 Dashboard: No user found, should not render");
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardRoleBasedContent user={user} onModalOpen={openModal} />
      
      <DashboardModals 
        activeModal={activeModal} 
        user={user} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default Dashboard;
