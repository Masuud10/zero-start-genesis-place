import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthUser } from "@/types/auth";
import { School } from "@/types/school";
import UserProfileDropdown from "./UserProfileDropdown";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";
import MaintenanceNotification from "@/components/common/MaintenanceNotification";
import AdminCommunicationsBanner from "@/components/common/AdminCommunicationsBanner";
import CommunicationBanner from "@/components/ui/CommunicationBanner";
import { useAdminCommunications } from "@/hooks/useAdminCommunications";

interface DashboardContainerProps {
  user: AuthUser;
  currentSchool: School | null;
  onLogout: () => Promise<void>;
  showHeader?: boolean;
  showGreetings?: boolean;
  children: React.ReactNode;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  user,
  currentSchool,
  onLogout,
  showHeader = true,
  showGreetings = true,
  children,
}) => {
  const { communications } = useAdminCommunications();
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);

  console.log(
    "🏗️ DashboardContainer: Rendering with user:",
    user?.email,
    "school:",
    currentSchool?.name,
    "showGreetings:",
    showGreetings
  );

  const handleBannerDismiss = (communicationId: string) => {
    setDismissedBanners(prev => [...prev, communicationId]);
  };

  if (!user) {
    console.log("🏗️ DashboardContainer: No user provided, showing error");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "edufam_admin":
        return "EduFam Admin";
      case "school_owner":
        return "School Owner";
      case "principal":
        return "Principal";
      case "teacher":
        return "Teacher";
      case "finance_officer":
        return "Finance Officer";
      case "parent":
        return "Parent";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "edufam_admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "school_owner":
        return "bg-green-100 text-green-800 border-green-200";
      case "principal":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "teacher":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "finance_officer":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "parent":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFirstName = (fullName: string) => {
    return fullName?.split(" ")[0] || "User";
  };

  // Filter out dismissed banners and show only active communications
  const activeCommunications = communications?.filter(
    comm => comm.is_active && !dismissedBanners.includes(comm.id)
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Prominent Communication Banners - at the very top */}
      {activeCommunications.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto">
            {activeCommunications.map(comm => (
              <CommunicationBanner
                key={comm.id}
                title={comm.title}
                message={comm.message}
                priority={comm.priority}
                onDismiss={() => handleBannerDismiss(comm.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Compact Greetings Container - Only show when showGreetings is true */}
      {showGreetings && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start justify-between gap-4">
              {/* Left side: Greeting and info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getGreeting()}, {getFirstName(user?.name || "User")}! 👋
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Welcome back to your dashboard.
                </p>
                <div className="mt-4 flex items-center flex-wrap gap-x-4 gap-y-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-medium">Role:</span>
                    <Badge
                      className={`${getRoleBadgeColor(
                        user.role
                      )} font-medium px-1.5 py-0.5 text-xs`}
                    >
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>

                  {currentSchool && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 font-medium">School:</span>
                      <span className="text-gray-700 font-semibold bg-white/70 px-2 py-0.5 rounded-md text-xs">
                        {currentSchool.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-500 font-medium">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - User Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Notifications */}
                <NotificationsDropdown />

                {/* User Profile Dropdown */}
                <UserProfileDropdown
                  user={user}
                  currentSchool={currentSchool}
                  onLogout={onLogout}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Maintenance Notification - shows across all dashboards */}
          <MaintenanceNotification />

          {/* Admin Communications Banner - shows across all dashboards */}
          <AdminCommunicationsBanner />

          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardContainer;
