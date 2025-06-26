
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthUser } from '@/types/auth';
import { Bell, Loader2, Mail, AlertCircle } from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

interface NotificationSettings {
  [key: string]: any;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  security_alerts: boolean;
  system_updates: boolean;
  maintenance_notifications: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
  notification_channels: string[];
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    security_alerts: true,
    system_updates: true,
    maintenance_notifications: true,
    email_frequency: 'immediate',
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    notification_channels: ['email', 'web']
  });

  // Fetch current notification settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'notification_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data?.setting_value || null;
    },
    enabled: isOpen
  });

  useEffect(() => {
    if (currentSettings && typeof currentSettings === 'object') {
      setSettings(prev => ({ ...prev, ...currentSettings }));
    }
  }, [currentSettings]);

  const updateSettings = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'notification_settings',
          setting_value: newSettings as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(settings);
  };

  const handleToggle = (field: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof NotificationSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading notification settings...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure system-wide notification preferences and delivery settings
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-h-96 overflow-y-auto">
          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              Notification Types
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms_notifications">SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Receive urgent notifications via SMS</p>
                </div>
                <Switch
                  id="sms_notifications"
                  checked={settings.sms_notifications}
                  onCheckedChange={(checked) => handleToggle('sms_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push_notifications">Push Notifications</Label>
                  <p className="text-xs text-gray-500">Browser push notifications</p>
                </div>
                <Switch
                  id="push_notifications"
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) => handleToggle('push_notifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Alert Categories */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Alert Categories
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="security_alerts">Security Alerts</Label>
                  <p className="text-xs text-gray-500">Critical security events and breaches</p>
                </div>
                <Switch
                  id="security_alerts"
                  checked={settings.security_alerts}
                  onCheckedChange={(checked) => handleToggle('security_alerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="system_updates">System Updates</Label>
                  <p className="text-xs text-gray-500">New features and system changes</p>
                </div>
                <Switch
                  id="system_updates"
                  checked={settings.system_updates}
                  onCheckedChange={(checked) => handleToggle('system_updates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance_notifications">Maintenance Notifications</Label>
                  <p className="text-xs text-gray-500">Scheduled maintenance and downtime</p>
                </div>
                <Switch
                  id="maintenance_notifications"
                  checked={settings.maintenance_notifications}
                  onCheckedChange={(checked) => handleToggle('maintenance_notifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Delivery Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-600" />
              Delivery Preferences
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email_frequency">Email Frequency</Label>
                <Select value={settings.email_frequency} onValueChange={(value) => handleSelectChange('email_frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notification Channels</Label>
                <p className="text-xs text-gray-500">Email, Web, SMS</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet_hours_start">Quiet Hours Start</Label>
                <Input
                  id="quiet_hours_start"
                  type="time"
                  value={settings.quiet_hours_start}
                  onChange={(e) => handleSelectChange('quiet_hours_start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quiet_hours_end">Quiet Hours End</Label>
                <Input
                  id="quiet_hours_end"
                  type="time"
                  value={settings.quiet_hours_end}
                  onChange={(e) => handleSelectChange('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateSettings.isPending}
              className="flex-1"
            >
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsModal;
