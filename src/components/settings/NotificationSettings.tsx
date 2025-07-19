import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const {
    notificationSettings,
    notificationHistory,
    notificationStats,
    isLoading,
    isUpdatingSettings,
    isSendingNotification,
    isTestingNotification,
    updateSettings,
    sendNotification,
    testNotification,
  } = useNotificationSettings();

  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
    targetAudience: "all" as const,
    priority: "normal" as const,
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    if (notificationSettings) {
      const updatedSettings = { ...notificationSettings, [setting]: value };
      updateSettings(updatedSettings);
    }
  };

  const handleSaveSettings = () => {
    if (notificationSettings) {
      updateSettings(notificationSettings);
    }
  };

  const handleSendAnnouncement = () => {
    if (!announcement.title || !announcement.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message fields.",
        variant: "destructive",
      });
      return;
    }

    sendNotification({
      title: announcement.title,
      content: announcement.message,
      type: "system",
      priority: "medium",
      target_audience: announcement.targetAudience,
    });

    setAnnouncement({
      title: "",
      message: "",
      targetAudience: "all",
      priority: "normal",
    });
  };

  const handleTestNotification = () => {
    if (notificationSettings) {
      testNotification(notificationSettings);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Loading notification settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Notification Settings
        </h2>
      </div>

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {notificationStats.totalSent}
              </div>
              <div className="text-sm text-gray-600">Total Sent</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notificationStats.recentSent}
              </div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {notificationStats.highPriorityCount}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {notificationStats.averageSentCount}
              </div>
              <div className="text-sm text-gray-600">Avg Recipients</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-gray-500">
                      Send notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.email_notifications || false}
                  onCheckedChange={(checked) =>
                    handleSettingChange("email_notifications", checked)
                  }
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <Label className="text-sm font-medium">
                      In-App Notifications
                    </Label>
                    <p className="text-xs text-gray-500">
                      Show notifications within the app
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.push_notifications || false}
                  onCheckedChange={(checked) =>
                    handleSettingChange("push_notifications", checked)
                  }
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label className="text-sm font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-xs text-gray-500">
                      Send critical alerts via SMS
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.sms_notifications || false}
                  onCheckedChange={(checked) =>
                    handleSettingChange("sms_notifications", checked)
                  }
                  disabled={isUpdatingSettings}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <div>
                    <Label className="text-sm font-medium">System Alerts</Label>
                    <p className="text-xs text-gray-500">
                      Important system notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.security_alerts || false}
                  onCheckedChange={(checked) =>
                    handleSettingChange("security_alerts", checked)
                  }
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <Label className="text-sm font-medium">
                      Maintenance Notices
                    </Label>
                    <p className="text-xs text-gray-500">
                      Scheduled maintenance updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={
                    notificationSettings?.maintenance_notifications || false
                  }
                  onCheckedChange={(checked) =>
                    handleSettingChange("maintenance_notifications", checked)
                  }
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <div>
                    <Label className="text-sm font-medium">
                      System Updates
                    </Label>
                    <p className="text-xs text-gray-500">
                      New features and system changes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.system_updates || false}
                  onCheckedChange={(checked) =>
                    handleSettingChange("system_updates", checked)
                  }
                  disabled={isUpdatingSettings}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={isUpdatingSettings}
              className="flex-1"
            >
              {isUpdatingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
            <Button
              onClick={handleTestNotification}
              disabled={isTestingNotification}
              variant="outline"
            >
              {isTestingNotification ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Test Notification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Send Announcement */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send System Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="announcement_title">Announcement Title</Label>
              <Input
                id="announcement_title"
                value={announcement.title}
                onChange={(e) =>
                  setAnnouncement((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <Label htmlFor="announcement_priority">Priority Level</Label>
              <select
                id="announcement_priority"
                value={announcement.priority}
                onChange={(e) =>
                  setAnnouncement((prev) => ({
                    ...prev,
                    priority: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="announcement_message">Message Content</Label>
            <Textarea
              id="announcement_message"
              value={announcement.message}
              onChange={(e) =>
                setAnnouncement((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              placeholder="Enter your announcement message here..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="target_audience">Target Audience</Label>
            <select
              id="target_audience"
              value={announcement.targetAudience}
              onChange={(e) =>
                setAnnouncement((prev) => ({
                  ...prev,
                  targetAudience: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="admins">Admins Only</option>
              <option value="principals">Principals</option>
              <option value="teachers">Teachers</option>
              <option value="parents">Parents</option>
            </select>
          </div>

          <Button
            onClick={handleSendAnnouncement}
            disabled={isSendingNotification}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSendingNotification ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Announcement
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificationHistory.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-gray-600">
                    Sent on{" "}
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getPriorityColor(notification.priority)}>
                    {notification.priority}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {notification.sent_count} recipients
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
