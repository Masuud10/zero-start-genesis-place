
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Send,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    announcementEmails: true,
    systemAlerts: true,
    maintenanceNotices: true
  });

  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    priority: 'normal'
  });

  const [recentAnnouncements] = useState([
    { id: 1, title: 'System Maintenance Scheduled', date: '2024-06-30', priority: 'high', sent: 1250 },
    { id: 2, title: 'New Feature Release', date: '2024-06-28', priority: 'normal', sent: 980 },
    { id: 3, title: 'Security Update Available', date: '2024-06-25', priority: 'high', sent: 1250 }
  ]);

  const handleSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Updated",
      description: "Notification preferences have been saved successfully.",
    });
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

    toast({
      title: "Announcement Sent",
      description: `Announcement "${announcement.title}" has been sent to all users.`,
    });
    
    setAnnouncement({ title: '', message: '', targetAudience: 'all', priority: 'normal' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
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
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Send notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <Label className="text-sm font-medium">In-App Notifications</Label>
                    <p className="text-xs text-gray-500">Show notifications within the app</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.inAppNotifications}
                  onCheckedChange={(checked) => handleSettingChange('inAppNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label className="text-sm font-medium">SMS Notifications</Label>
                    <p className="text-xs text-gray-500">Send critical alerts via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <div>
                    <Label className="text-sm font-medium">System Alerts</Label>
                    <p className="text-xs text-gray-500">Important system notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <Label className="text-sm font-medium">Maintenance Notices</Label>
                    <p className="text-xs text-gray-500">Scheduled maintenance updates</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.maintenanceNotices}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceNotices', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <div>
                    <Label className="text-sm font-medium">Announcement Emails</Label>
                    <p className="text-xs text-gray-500">Send announcements via email</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.announcementEmails}
                  onCheckedChange={(checked) => handleSettingChange('announcementEmails', checked)}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full mt-6">
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Send Announcement */}
      <Card>
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
                onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <Label htmlFor="announcement_priority">Priority Level</Label>
              <select
                id="announcement_priority"
                value={announcement.priority}
                onChange={(e) => setAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
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
              onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your announcement message here..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="target_audience">Target Audience</Label>
            <select
              id="target_audience"
              value={announcement.targetAudience}
              onChange={(e) => setAnnouncement(prev => ({ ...prev, targetAudience: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="admins">Admins Only</option>
              <option value="principals">Principals</option>
              <option value="teachers">Teachers</option>
              <option value="parents">Parents</option>
            </select>
          </div>

          <Button onClick={handleSendAnnouncement} className="w-full bg-green-600 hover:bg-green-700">
            <Send className="w-4 h-4 mr-2" />
            Send Announcement
          </Button>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{announcement.title}</h4>
                  <p className="text-sm text-gray-600">Sent on {announcement.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                  <span className="text-sm text-gray-500">{announcement.sent} recipients</span>
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
