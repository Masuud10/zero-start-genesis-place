
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import GradesModal from "./modals/GradesModal";
import AttendanceModal from "./modals/AttendanceModal";
import ResultsModal from "./modals/ResultsModal";
import ReportsModal from "./modals/ReportsModal";
import FeeCollectionModal from "./modals/FeeCollectionModal";
import FinancialReportsModal from "./modals/FinancialReportsModal";
import SchoolOwnerDashboard from "./dashboard/SchoolOwnerDashboard";
import PrincipalDashboard from "./dashboard/PrincipalDashboard";
import TeacherDashboard from "./dashboard/TeacherDashboard";
import ParentDashboard from "./dashboard/ParentDashboard";
import ElimshaAdminDashboard from "./dashboard/ElimshaAdminDashboard";
import FinanceOfficerDashboard from "./dashboard/FinanceOfficerDashboard";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
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

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Get first name from user name
  const getFirstName = (fullName: string) => {
    return fullName?.split(" ")[0] || "User";
  };

  const getRoleBasedDashboard = () => {
    console.log(
      "📊 Dashboard: Getting role-based dashboard for role:",
      user?.role,
      "school:",
      user?.school_id
    );

    switch (user?.role) {
      case "school_owner":
        console.log("📊 Dashboard: Rendering SchoolOwnerDashboard");
        return <SchoolOwnerDashboard onModalOpen={openModal} />;
      case "principal":
        console.log("📊 Dashboard: Rendering PrincipalDashboard");
        return <PrincipalDashboard onModalOpen={openModal} />;
      case "teacher":
        console.log("📊 Dashboard: Rendering TeacherDashboard");
        return <TeacherDashboard onModalOpen={openModal} />;
      case "parent":
        console.log("📊 Dashboard: Rendering ParentDashboard");
        return <ParentDashboard onModalOpen={openModal} />;
      case "elimisha_admin":
      case "edufam_admin":
        console.log("📊 Dashboard: Rendering ElimshaAdminDashboard");
        return <ElimshaAdminDashboard onModalOpen={openModal} />;
      case "finance_officer":
        console.log("📊 Dashboard: Rendering FinanceOfficerDashboard");
        return <FinanceOfficerDashboard onModalOpen={openModal} />;
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

  const getRoleDescription = () => {
    switch (user?.role) {
      case "elimisha_admin":
      case "edufam_admin":
        return "System-wide management and monitoring dashboard.";
      case "school_owner":
        return "Monitor your school's financial and operational performance.";
      case "principal":
        return "Oversee daily operations and academic excellence at your school.";
      case "teacher":
        return "Manage your classes, grades, and student interactions.";
      case "parent":
        return "Stay updated on your child's academic progress and school activities.";
      case "finance_officer":
        return "Manage financial operations and fee collection for your school.";
      default:
        return "Here's what's happening in your school today.";
    }
  };

  if (!user) {
    console.log("📊 Dashboard: No user found, should not render");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Section - User Profile at Top Right */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end py-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:shadow-lg transition-all">
                  <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                    <AvatarImage src={user?.avatar_url} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white shadow-xl border-0 rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <p className="text-base font-semibold leading-none">{user?.name}</p>
                    <p className="text-sm leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize bg-blue-50 px-2 py-1 rounded-md">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 mx-2 rounded-lg">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 mx-2 rounded-lg">
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive hover:bg-red-50 mx-2 rounded-lg"
                  onClick={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Section - Full Width at Top */}
        <div className="w-full">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 overflow-hidden">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Greeting Content */}
                <div className="flex-1 space-y-3">
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 leading-tight">
                    {getGreeting()}, {getFirstName(user?.name || "User")}! 👋
                  </h1>
                  <p className="text-gray-600 text-lg lg:text-xl leading-relaxed">
                    {getRoleDescription()}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                      Role: {user?.role?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                      ID: {user?.id?.slice(0, 8)}...
                    </span>
                    {user?.school_id && (
                      <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                        School: {user.school_id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>

                {/* Date and Time Widget */}
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
                    <div className="text-center space-y-2">
                      <div className="text-sm font-medium opacity-90">
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm opacity-90">
                        {new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content Section */}
        <div className="w-full">
          <div className="animate-fade-in">
            {getRoleBasedDashboard()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === "grades" && (
        <GradesModal onClose={closeModal} userRole={user?.role as any} />
      )}
      {activeModal === "attendance" && (
        <AttendanceModal onClose={closeModal} userRole={user?.role as any} />
      )}
      {activeModal === "results" && <ResultsModal onClose={closeModal} />}
      {activeModal === "reports" && <ReportsModal onClose={closeModal} />}
      {activeModal === "fee-collection" && (
        <FeeCollectionModal onClose={closeModal} />
      )}
      {activeModal === "financial-reports" && (
        <FinancialReportsModal onClose={closeModal} />
      )}
    </div>
  );
};

export default Dashboard;
