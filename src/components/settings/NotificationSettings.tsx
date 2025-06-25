
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();

  const handleUpdateNotifications = () => {
    toast({
      title: "Notifications Updated",
      description: "Notification settings have been updated successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Email Notifications</Label>
            <p className="text-xs text-gray-500">Send notifications via email</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>SMS Notifications</Label>
            <p className="text-xs text-gray-500">Send notifications via SMS</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>System Alerts</Label>
            <p className="text-xs text-gray-500">Critical system notifications</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>User Activity Notifications</Label>
            <p className="text-xs text-gray-500">Notify on user login/logout</p>
          </div>
          <Switch />
        </div>

        <Button onClick={handleUpdateNotifications} className="w-full">
          Update Notification Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
