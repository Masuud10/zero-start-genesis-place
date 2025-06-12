
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
    <div className="space-y-6 animate-fade-in p-6">
      {/* Dashboard Header with User Profile */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Main Greeting Section */}
        <div className="flex-1">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    {getGreeting()}, {getFirstName(user?.name || "User")}! 👋
                  </h1>
                  <p className="text-gray-600 text-base lg:text-lg mb-3">
                    {getRoleDescription()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Role: {user?.role?.replace('_', ' ').toUpperCase()} | User ID: {user?.id?.slice(0, 8)}...
                    {user?.school_id && ` | School: ${user.school_id.slice(0, 8)}...`}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-2xl shadow-lg flex-shrink-0">
                  <div className="text-sm opacity-90">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="font-semibold text-lg">
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Profile Section */}
        <div className="flex-shrink-0">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:shadow-lg transition-all">
                      <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                        <AvatarImage src={user?.avatar_url} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
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
                <div className="hidden lg:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {getRoleBasedDashboard()}
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
