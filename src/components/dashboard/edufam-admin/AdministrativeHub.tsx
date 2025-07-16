import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/contexts/NavigationContext";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useDatabaseBackup } from "@/hooks/useDatabaseBackup";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import {
  Users,
  UserPlus,
  Building2,
  GraduationCap,
  BookOpen,
  School,
  Settings,
  TrendingUp,
  Activity,
  Shield,
  BarChart3,
  Headphones,
  Wrench,
  Database,
  Bell,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  Send,
} from "lucide-react";
import CreateSchoolDialog from "@/components/school/CreateSchoolDialog";

interface AdministrativeHubProps {
  onModalOpen: (modalType: string) => void;
  onUserCreated: () => void;
}

const AdministrativeHub = ({
  onModalOpen,
  onUserCreated,
}: AdministrativeHubProps) => {
  const { onSectionChange } = useNavigation();

  // System Management hooks
  const {
    maintenanceSettings,
    maintenanceStatus,
    isLoading: isLoadingMaintenance,
    enableMaintenance,
    disableMaintenance,
    isEnabling,
    isDisabling,
  } = useMaintenanceMode();

  const {
    backupHistory,
    latestBackup,
    isBackupRecent,
    isLoading: isLoadingBackup,
    isCreatingBackup,
    createBackup,
    downloadBackup,
  } = useDatabaseBackup();

  const {
    notificationSettings,
    notificationStats,
    isLoading: isLoadingNotifications,
    isTestingNotification,
    testNotification,
  } = useNotificationSettings();

  const handleActionClick = (action: string) => {
    console.log("🎯 AdministrativeHub: Action clicked:", action);

    // Handle navigation to sections
    const sectionMappings: { [key: string]: string } = {
      "system-health": "system-health",
      "security-audit": "security",
      "performance-metrics": "analytics",
      "system-settings": "settings",
      "school-analytics": "analytics",
      "school-settings": "schools",
    };

    // Handle modal actions
    const modalMappings: { [key: string]: string } = {
      "create-admin": "create-admin",
      "create-owner": "create-owner",
      "create-principal": "create-principal",
      "create-teacher": "create-teacher",
      "assign-owner": "assign-owner",
      "school-settings": "school-settings",
      "school-analytics": "school-analytics",
      "system-health": "system-health",
      "security-audit": "security-audit",
      "performance-metrics": "performance-metrics",
      "system-settings": "system-settings",
      "user-management": "user-management",
      "security-settings": "security-settings",
      "notification-settings": "notification-settings",
      "company-details": "company-details",
      "database-settings": "database-settings",
      "maintenance-mode": "maintenance-mode",
    };

    if (sectionMappings[action]) {
      onSectionChange(sectionMappings[action]);
    } else if (modalMappings[action]) {
      onModalOpen(modalMappings[action]);
    } else {
      console.warn("Unknown action:", action);
    }
  };

  const handleMaintenanceToggle = () => {
    if (maintenanceSettings?.enabled) {
      disableMaintenance();
    } else {
      enableMaintenance({
        message:
          "System is currently under maintenance. Please try again later.",
        estimatedDuration: "2-4 hours",
      });
    }
  };

  const handleCreateBackup = () => {
    createBackup("full");
  };

  const handleTestNotification = () => {
    if (notificationSettings) {
      testNotification(notificationSettings);
    }
  };

  const managementActions = [
    {
      title: "User Management",
      description: "Create and manage system users across all schools",
      icon: Users,
      color: "blue",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      actions: [
        { label: "Create Admin User", action: "create-admin", icon: UserPlus },
        {
          label: "Create School Director",
          action: "create-owner",
          icon: Building2,
        },
        {
          label: "Create Principal",
          action: "create-principal",
          icon: GraduationCap,
        },
        { label: "Create Teacher", action: "create-teacher", icon: BookOpen },
      ],
    },
    {
      title: "School Management",
      description: "Onboard new schools and manage existing ones",
      icon: School,
      color: "green",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      actions: [
        {
          label: "Create New School",
          action: "create-school",
          icon: Building2,
          isSpecial: true,
        },
        { label: "Assign School Director", action: "assign-owner", icon: Users },
        { label: "School Settings", action: "school-settings", icon: Settings },
        {
          label: "School Analytics",
          action: "school-analytics",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "System Operations",
      description: "Monitor and manage system-wide operations",
      icon: Activity,
      color: "purple",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      actions: [
        { label: "System Health", action: "system-health", icon: Activity },
        { label: "Security Audit", action: "security-audit", icon: Shield },
        {
          label: "Performance Metrics",
          action: "performance-metrics",
          icon: BarChart3,
        },
        { label: "System Settings", action: "system-settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          System Management Center
        </h2>
        <p className="text-muted-foreground">
          Comprehensive administrative tools for managing the EduFam platform
        </p>
      </div>

      {/* System Management Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Maintenance Mode Control */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  Maintenance Mode
                </h3>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Control system accessibility
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center gap-2">
                {maintenanceSettings?.enabled ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <span className="font-medium">
                  {maintenanceSettings?.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              <Button
                onClick={handleMaintenanceToggle}
                disabled={isEnabling || isDisabling || isLoadingMaintenance}
                variant={
                  maintenanceSettings?.enabled ? "destructive" : "default"
                }
                size="sm"
              >
                {isEnabling || isDisabling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : maintenanceSettings?.enabled ? (
                  "Disable"
                ) : (
                  "Enable"
                )}
              </Button>
            </div>
            {maintenanceSettings?.enabled && (
              <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                System is in maintenance mode. Only EduFam Admins can access.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Backup Control */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Database Backup
                </h3>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Manage system backups
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center gap-2">
                {isBackupRecent ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <span className="font-medium">
                  {isBackupRecent ? "Recent" : "Needed"}
                </span>
              </div>
              <Button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup || isLoadingBackup}
                size="sm"
              >
                {isCreatingBackup ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
            {latestBackup && (
              <div className="text-sm text-gray-600">
                Last: {new Date(latestBackup.created_at).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings Control */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  Notifications
                </h3>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  System notification settings
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                <span className="font-medium">
                  {notificationStats.totalSent} sent
                </span>
              </div>
              <Button
                onClick={handleTestNotification}
                disabled={isTestingNotification || isLoadingNotifications}
                size="sm"
                variant="outline"
              >
                {isTestingNotification ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {notificationStats.recentSent} this week
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {managementActions.map((section) => (
          <Card
            key={section.title}
            className={`shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${section.bgGradient} ${section.borderColor}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br from-${section.color}-500 to-${section.color}-600 shadow-lg`}
                >
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold text-${section.color}-900`}
                  >
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-normal mt-1">
                    {section.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {section.actions.map((action) =>
                  action.isSpecial ? (
                    <CreateSchoolDialog
                      key={action.action}
                      onSchoolCreated={onUserCreated}
                    >
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4 hover:bg-white/80 hover:shadow-md transition-all duration-200 border-white/50 bg-white/30"
                      >
                        <action.icon className="h-5 w-5 mr-3 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {action.label}
                          </div>
                        </div>
                      </Button>
                    </CreateSchoolDialog>
                  ) : (
                    <Button
                      key={action.action}
                      variant="outline"
                      className="justify-start h-auto p-4 hover:bg-white/80 hover:shadow-md transition-all duration-200 border-white/50 bg-white/30"
                      onClick={() => handleActionClick(action.action)}
                    >
                      <action.icon className="h-5 w-5 mr-3 text-gray-700" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {action.label}
                        </div>
                      </div>
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <Card className="shadow-lg bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Quick System Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onSectionChange("analytics")}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button
              onClick={() => onModalOpen("user-management")}
              variant="outline"
              size="sm"
              className="hover:bg-green-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button
              onClick={() => onSectionChange("schools")}
              variant="outline"
              size="sm"
              className="hover:bg-purple-50"
            >
              <School className="h-4 w-4 mr-2" />
              View Schools
            </Button>
            <Button
              onClick={() => onSectionChange("settings")}
              variant="outline"
              size="sm"
              className="hover:bg-orange-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button
              onClick={() => onSectionChange("support")}
              variant="outline"
              size="sm"
              className="hover:bg-cyan-50"
            >
              <Headphones className="h-4 w-4 mr-2" />
              Support Center
            </Button>
            <Button
              onClick={() => onModalOpen("user-management")}
              variant="outline"
              size="sm"
              className="hover:bg-indigo-50"
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="text-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => onSectionChange("system-health")}
            >
              <div className="text-2xl font-bold text-green-600">
                {maintenanceSettings?.enabled ? "Maintenance" : "Healthy"}
              </div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div
              className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => onSectionChange("system-health")}
            >
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div
              className="text-center p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => onSectionChange("analytics")}
            >
              <div className="text-2xl font-bold text-purple-600">
                Real-time
              </div>
              <div className="text-sm text-gray-600">Data Sync</div>
            </div>
            <div
              className="text-center p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => onSectionChange("security")}
            >
              <div className="text-2xl font-bold text-orange-600">Secure</div>
              <div className="text-sm text-gray-600">Encryption</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdministrativeHub;
