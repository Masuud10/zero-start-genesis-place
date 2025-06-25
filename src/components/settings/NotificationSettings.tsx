
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = React.useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    emailTemplate: 'Default email template content...',
    smsTemplate: 'Default SMS template content...',
    pushTemplate: 'Default push notification content...'
  });

  const handleSave = () => {
    console.log('Saving notification settings:', settings);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send notifications via email</p>
                </div>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Send notifications via SMS</p>
                </div>
              </div>
              <Switch
                checked={settings.smsEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600">Send push notifications to mobile apps</p>
                </div>
              </div>
              <Switch
                checked={settings.pushEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushEnabled: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Textarea
              value={settings.emailTemplate}
              onChange={(e) => setSettings(prev => ({ ...prev, emailTemplate: e.target.value }))}
              rows={4}
              placeholder="Enter email template..."
            />
          </div>

          <div className="space-y-2">
            <Label>SMS Template</Label>
            <Textarea
              value={settings.smsTemplate}
              onChange={(e) => setSettings(prev => ({ ...prev, smsTemplate: e.target.value }))}
              rows={3}
              placeholder="Enter SMS template..."
            />
          </div>

          <div className="space-y-2">
            <Label>Push Notification Template</Label>
            <Textarea
              value={settings.pushTemplate}
              onChange={(e) => setSettings(prev => ({ ...prev, pushTemplate: e.target.value }))}
              rows={3}
              placeholder="Enter push notification template..."
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Templates
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
