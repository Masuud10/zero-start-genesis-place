
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthUser } from '@/types/auth';
import { Bell, Mail, MessageSquare } from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    notification_frequency: 'immediate',
    admin_alerts: true,
    system_alerts: true,
    user_activity_alerts: false,
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    sms_provider: 'none'
  });

  const updateNotificationSettings = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'notification_settings',
          setting_value: {
            ...newSettings,
            updated_by: currentUser.id,
            updated_at: new Date().toISOString()
          }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
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
    updateNotificationSettings.mutate(settings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure system-wide notification preferences and delivery methods
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-h-96 overflow-y-auto">
          {/* General Notification Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">General Settings</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-xs text-gray-500">Send notifications via email</p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, email_notifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-xs text-gray-500">Send notifications via SMS</p>
              </div>
              <Switch
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, sms_notifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-xs text-gray-500">Send browser push notifications</p>
              </div>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, push_notifications: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select
                value={settings.notification_frequency}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, notification_frequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alert Types */}
          <div className="space-y-4">
            <h4 className="font-medium">Alert Types</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Admin Alerts</Label>
                <p className="text-xs text-gray-500">Administrative notifications</p>
              </div>
              <Switch
                checked={settings.admin_alerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, admin_alerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>System Alerts</Label>
                <p className="text-xs text-gray-500">System status and maintenance alerts</p>
              </div>
              <Switch
                checked={settings.system_alerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, system_alerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>User Activity Alerts</Label>
                <p className="text-xs text-gray-500">User login and activity notifications</p>
              </div>
              <Switch
                checked={settings.user_activity_alerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, user_activity_alerts: checked }))
                }
              />
            </div>
          </div>

          {/* Email Configuration */}
          {settings.email_notifications && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Configuration
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input
                    value={settings.smtp_host}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, smtp_host: e.target.value }))
                    }
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input
                    value={settings.smtp_port}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, smtp_port: e.target.value }))
                    }
                    placeholder="587"
                  />
                </div>
              </div>

              <div>
                <Label>SMTP Username</Label>
                <Input
                  value={settings.smtp_username}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, smtp_username: e.target.value }))
                  }
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <Label>SMTP Password</Label>
                <Input
                  type="password"
                  value={settings.smtp_password}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, smtp_password: e.target.value }))
                  }
                  placeholder="Your app password"
                />
              </div>
            </div>
          )}

          {/* SMS Configuration */}
          {settings.sms_notifications && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS Configuration
              </h4>
              
              <div>
                <Label>SMS Provider</Label>
                <Select
                  value={settings.sms_provider}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, sms_provider: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="africastalking">Africa's Talking</SelectItem>
                    <SelectItem value="custom">Custom Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateNotificationSettings.isPending}
              className="flex-1"
            >
              {updateNotificationSettings.isPending ? 'Updating...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsModal;
