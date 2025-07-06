import React, { useState } from "react";
import {
  Settings,
  Database,
  Shield,
  Bell,
  Users,
  Building2,
  Sparkles,
  Monitor,
  Lock,
  UserCog,
  Wrench,
  Server,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MaintenanceSettings from "./MaintenanceSettings";
import DatabaseSettings from "./DatabaseSettings";
import SecuritySettingsPanel from "./SecuritySettingsPanel";
import NotificationSettings from "./NotificationSettings";
import UserManagementSettings from "./UserManagementSettings";
import CompanySettings from "./CompanySettings";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SystemSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("maintenance");

  // Only allow EduFam admins to access system settings
  if (user?.role !== "edufam_admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 flex items-center justify-center p-4">
        <Card className="max-w-md border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Access Denied</h3>
                <p className="text-sm text-muted-foreground">
                  Only EduFam Administrators can access system settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const settingsTabs = [
    {
      id: "maintenance",
      label: "System Maintenance",
      icon: Wrench,
      color: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      component: <MaintenanceSettings />,
    },
    {
      id: "database",
      label: "Database Management",
      icon: Server,
      color: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      component: <DatabaseSettings />,
    },
    {
      id: "security",
      label: "Security Center",
      icon: Lock,
      color: "bg-gradient-to-br from-red-50 to-pink-50 border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      component: <SecuritySettingsPanel />,
    },
    {
      id: "notifications",
      label: "Notification Hub",
      icon: Bell,
      color: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      component: <NotificationSettings />,
    },
    {
      id: "users",
      label: "User Administration",
      icon: UserCog,
      color: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      component: <UserManagementSettings />,
    },
    {
      id: "company",
      label: "Organization Settings",
      icon: Building2,
      color: "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      component: <CompanySettings />,
    },
  ];

  const activeSettings = settingsTabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      <div className="max-w-7xl mx-auto px-6 pb-12 pt-6">
        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {settingsTabs.map((tab) => (
            <Card
              key={tab.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                activeTab === tab.id
                  ? `${tab.color} shadow-md ring-2 ring-primary/20`
                  : "bg-card hover:bg-accent/30"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${tab.iconBg}`}>
                    <tab.icon className={`h-6 w-6 ${tab.iconColor}`} />
                  </div>
                  {activeTab === tab.id && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold">
                  {tab.label}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Active Content Section */}
        {activeSettings && (
          <Card className="bg-card/80 backdrop-blur-sm border shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-accent/20 to-secondary/10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${activeSettings.iconBg}`}>
                  <activeSettings.icon
                    className={`h-6 w-6 ${activeSettings.iconColor}`}
                  />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {activeSettings.label}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="animate-fade-in">{activeSettings.component}</div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-8 flex justify-center">
          <Card className="bg-gradient-to-r from-accent/20 to-secondary/20 border-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  System Online
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Secure Session
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Admin Panel v2.0
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
