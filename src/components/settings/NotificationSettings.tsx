
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Mail, MessageSquare, Settings } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'EduFam System'
  });

  // Fetch notification settings
  const { data: notificationSettings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['email_notifications', 'sms_notifications', 'push_notifications', 'email_config']);

      if (error) throw error;

      const settings: Record<string, any> = {};
      data?.forEach(item => {
        settings[item.setting_key] = item.setting_value;
      });

      return {
        emailEnabled: settings.email_notifications?.enabled || false,
        smsEnabled: settings.sms_notifications?.enabled || false,
        pushEnabled: settings.push_notifications?.enabled || false,
        emailConfig: settings.email_config || {}
      };
    },
  });

  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  const handleToggleNotification = (type: string, enabled: boolean) => {
    updateSettingsMutation.mutate({
      key: `${type}_notifications`,
      value: { enabled }
    });
  };

  const handleUpdateEmailConfig = () => {
    updateSettingsMutation.mutate({
      key: 'email_config',
      value: emailSettings
    });
  };

  React.useEffect(() => {
    if (notificationSettings?.emailConfig) {
      setEmailSettings(prev => ({
        ...prev,
        ...notificationSettings.emailConfig
      }));
    }
  }, [notificationSettings]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">Send notifications via email</p>
              </div>
            </div>
            <Switch
              checked={notificationSettings?.emailEnabled || false}
              onCheckedChange={(checked) => handleToggleNotification('email', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-gray-600">Send notifications via SMS</p>
              </div>
            </div>
            <Switch
              checked={notificationSettings?.smsEnabled || false}
              onCheckedChange={(checked) => handleToggleNotification('sms', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-600">Send browser push notifications</p>
              </div>
            </div>
            <Switch
              checked={notificationSettings?.pushEnabled || false}
              onCheckedChange={(checked) => handleToggleNotification('push', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">SMTP Host</label>
              <Input
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">SMTP Port</label>
              <Input
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: Number(e.target.value) }))}
                placeholder="587"
              />
            </div>
            <div>
              <label className="text-sm font-medium">SMTP Username</label>
              <Input
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">SMTP Password</label>
              <Input
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                placeholder="Your app password"
              />
            </div>
            <div>
              <label className="text-sm font-medium">From Email</label>
              <Input
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                placeholder="noreply@edufam.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">From Name</label>
              <Input
                value={emailSettings.fromName}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                placeholder="EduFam System"
              />
            </div>
          </div>
          <Button
            onClick={handleUpdateEmailConfig}
            disabled={updateSettingsMutation.isPending}
          >
            Update Email Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
