
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import DashboardHeader from "./dashboard/DashboardHeader";
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

  const handleLogout = async () => {
    try {
      console.log('🔓 Dashboard: Initiating logout');
      
      toast({
        title: "Signing out...",
        description: "Please wait while we sign you out.",
      });
      
      await signOut();
      
      console.log('✅ Dashboard: Logout completed');
    } catch (error) {
      console.error('❌ Dashboard: Logout error:', error);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        variant: "default",
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  if (!user) {
    console.log("📊 Dashboard: No user found, should not render");
    return null;
  }

  // Transform the school data to match the expected School interface
  const transformedSchool = currentSchool ? {
    id: currentSchool.id,
    name: currentSchool.name,
    ownerId: currentSchool.owner_id || '',
    principalId: currentSchool.principal_id || '',
    address: currentSchool.address || '',
    phone: currentSchool.phone || '',
    email: currentSchool.email || '',
    logo: currentSchool.logo_url,
    settings: {
      academicYear: new Date().getFullYear().toString(),
      terms: [],
      gradeReleaseEnabled: true,
      attendanceEnabled: true,
    }
  } : null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <DashboardHeader 
        user={user} 
        currentSchool={transformedSchool} 
        onLogout={handleLogout} 
      />

      {/* Dashboard Content Container */}
      <div className="px-2 md:px-4 lg:px-6">
        <div className="py-4 md:py-6">
          <div className="animate-fade-in">
            <DashboardRoleBasedContent user={user} onModalOpen={openModal} />
          </div>
        </div>
      </div>

      <DashboardModals 
        activeModal={activeModal} 
        user={user} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default Dashboard;
