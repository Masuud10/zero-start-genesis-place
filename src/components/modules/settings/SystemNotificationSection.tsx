import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Mail, Save, Bell, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface NotificationSettings {
  email_sender_name: string;
  notification_email: string;
  auto_alerts_enabled: boolean;
  support_ticket_alerts: boolean;
  system_update_alerts: boolean;
  maintenance_alerts: boolean;
}

const SystemNotificationSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_sender_name: 'EduFam System',
    notification_email: 'admin@edufam.com',
    auto_alerts_enabled: true,
    support_ticket_alerts: true,
    system_update_alerts: true,
    maintenance_alerts: true
  });

  // Fetch current notification settings
  const { data: notificationSettings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'notification_config')
        .maybeSingle();

      if (error) throw error;
      return data?.setting_value || {};
    }
  });

  useEffect(() => {
    if (notificationSettings && typeof notificationSettings === 'object' && notificationSettings !== null) {
      const data = notificationSettings as Partial<NotificationSettings>;
      setSettings(prev => ({ ...prev, ...data }));
    }
  }, [notificationSettings]);

  const updateNotificationSettings = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'notification_config',
          setting_value: newSettings as any,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      return newSettings;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update notification settings",
        variant: "destructive"
      });
    }
  });

  const handleSettingChange = (key: keyof NotificationSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSaveSettings = () => {
    // Validate email format
    if (!validateEmail(settings.notification_email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!settings.email_sender_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Email sender name is required",
        variant: "destructive"
      });
      return;
    }

    updateNotificationSettings.mutate(settings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          System Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Email Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sender-name">Email Sender Name</Label>
              <Input
                id="sender-name"
                type="text"
                value={settings.email_sender_name}
                onChange={(e) => handleSettingChange('email_sender_name', e.target.value)}
                placeholder="EduFam System"
              />
              <p className="text-xs text-muted-foreground">
                This name will appear in the "From" field of system emails
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-email">System Notification Email</Label>
              <Input
                id="notification-email"
                type="email"
                value={settings.notification_email}
                onChange={(e) => handleSettingChange('notification_email', e.target.value)}
                placeholder="admin@edufam.com"
              />
              <p className="text-xs text-muted-foreground">
                Email address used for sending system notifications
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Alert Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Automatic Alert Settings</h4>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="auto-alerts" className="text-base font-medium">
                Enable Automatic Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all automatic alert notifications
              </p>
            </div>
            <Switch
              id="auto-alerts"
              checked={settings.auto_alerts_enabled}
              onCheckedChange={(checked) => handleSettingChange('auto_alerts_enabled', checked)}
            />
          </div>

          {/* Individual Alert Types */}
          <div className="space-y-3 ml-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="support-alerts" className="text-sm font-medium">
                  Support Ticket Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notify when new support tickets are created
                </p>
              </div>
              <Switch
                id="support-alerts"
                checked={settings.support_ticket_alerts && settings.auto_alerts_enabled}
                onCheckedChange={(checked) => handleSettingChange('support_ticket_alerts', checked)}
                disabled={!settings.auto_alerts_enabled}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="system-alerts" className="text-sm font-medium">
                  System Update Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notify about important system updates and changes
                </p>
              </div>
              <Switch
                id="system-alerts"
                checked={settings.system_update_alerts && settings.auto_alerts_enabled}
                onCheckedChange={(checked) => handleSettingChange('system_update_alerts', checked)}
                disabled={!settings.auto_alerts_enabled}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="maintenance-alerts" className="text-sm font-medium">
                  Maintenance Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notify about scheduled maintenance and downtime
                </p>
              </div>
              <Switch
                id="maintenance-alerts"
                checked={settings.maintenance_alerts && settings.auto_alerts_enabled}
                onCheckedChange={(checked) => handleSettingChange('maintenance_alerts', checked)}
                disabled={!settings.auto_alerts_enabled}
              />
            </div>
          </div>
        </div>

        {/* Status Information */}
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Status:</strong> {settings.auto_alerts_enabled ? 'Notifications are enabled' : 'Notifications are disabled'}.
            {settings.auto_alerts_enabled && (
              <span> System will send alerts to {settings.notification_email} from {settings.email_sender_name}.</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Alert className="flex-1 mr-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Changes to notification settings take effect immediately and apply to all system-generated emails.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleSaveSettings}
            disabled={updateNotificationSettings.isPending || isLoading}
            className="flex items-center gap-2 min-w-[140px]"
          >
            <Save className="w-4 h-4" />
            {updateNotificationSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemNotificationSection;