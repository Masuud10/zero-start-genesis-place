
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Save,
  Settings,
  Volume2
} from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  
  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    username: '',
    password: '',
    fromAddress: 'noreply@edufam.com',
    fromName: 'EduFam System'
  });

  const [smsSettings, setSmsSettings] = useState({
    enabled: false,
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    fromNumber: ''
  });

  const [systemNotifications, setSystemNotifications] = useState({
    newUserRegistration: true,
    failedLogins: true,
    systemMaintenance: true,
    backupAlerts: true,
    securityIncidents: true,
    performanceAlerts: false
  });

  const handleSaveEmailSettings = () => {
    toast({
      title: "Email Settings Saved",
      description: "Email notification settings have been updated successfully.",
    });
  };

  const handleSaveSMSSettings = () => {
    toast({
      title: "SMS Settings Saved",
      description: "SMS notification settings have been updated successfully.",
    });
  };

  const handleSaveSystemNotifications = () => {
    toast({
      title: "System Notifications Updated",
      description: "System notification preferences have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
      </div>

      {/* Email Notifications */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Email Notifications</Label>
              <p className="text-xs text-gray-500">Send system notifications via email</p>
            </div>
            <Switch
              checked={emailSettings.enabled}
              onCheckedChange={(checked) => 
                setEmailSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {emailSettings.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="smtp_server">SMTP Server</Label>
                <Input
                  id="smtp_server"
                  value={emailSettings.smtpServer}
                  onChange={(e) => 
                    setEmailSettings(prev => ({ ...prev, smtpServer: e.target.value }))
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  value={emailSettings.smtpPort}
                  onChange={(e) => 
                    setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))
                  }
                  placeholder="587"
                />
              </div>
              <div>
                <Label htmlFor="email_username">Username</Label>
                <Input
                  id="email_username"
                  value={emailSettings.username}
                  onChange={(e) => 
                    setEmailSettings(prev => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="email_password">Password</Label>
                <Input
                  id="email_password"
                  type="password"
                  value={emailSettings.password}
                  onChange={(e) => 
                    setEmailSettings(prev => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="App password"
                />
              </div>
              <div>
                <Label htmlFor="from_address">From Address</Label>
                <Input
                  id="from_address"
                  value={emailSettings.fromAddress}
                  onChange={(e) => 
                    setEmailSettings(prev => ({ ...prev, fromAddress: e.target.value }))
                  }
                  placeholder="noreply@edufam.com"
                />
              </div>
              <div>
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  value={emailSettings.fromName}
                  onChange={(e) => 
                    setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))
                  }
                  placeholder="EduFam System"
                />
              </div>
            </div>
          )}

          <Button onClick={handleSaveEmailSettings} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable SMS Notifications</Label>
              <p className="text-xs text-gray-500">Send urgent notifications via SMS</p>
            </div>
            <Switch
              checked={smsSettings.enabled}
              onCheckedChange={(checked) => 
                setSmsSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {smsSettings.enabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="sms_provider">SMS Provider</Label>
                <Select
                  value={smsSettings.provider}
                  onValueChange={(value) => 
                    setSmsSettings(prev => ({ ...prev, provider: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="nexmo">Nexmo</SelectItem>
                    <SelectItem value="africastalking">Africa's Talking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sms_api_key">API Key</Label>
                <Input
                  id="sms_api_key"
                  value={smsSettings.apiKey}
                  onChange={(e) => 
                    setSmsSettings(prev => ({ ...prev, apiKey: e.target.value }))
                  }
                  placeholder="Your SMS provider API key"
                />
              </div>
              <div>
                <Label htmlFor="sms_api_secret">API Secret</Label>
                <Input
                  id="sms_api_secret"
                  type="password"
                  value={smsSettings.apiSecret}
                  onChange={(e) => 
                    setSmsSettings(prev => ({ ...prev, apiSecret: e.target.value }))
                  }
                  placeholder="Your SMS provider API secret"
                />
              </div>
              <div>
                <Label htmlFor="from_number">From Number</Label>
                <Input
                  id="from_number"
                  value={smsSettings.fromNumber}
                  onChange={(e) => 
                    setSmsSettings(prev => ({ ...prev, fromNumber: e.target.value }))
                  }
                  placeholder="+1234567890"
                />
              </div>
            </div>
          )}

          <Button onClick={handleSaveSMSSettings} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save SMS Settings
          </Button>
        </CardContent>
      </Card>

      {/* System Notification Preferences */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            System Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {Object.entries(systemNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {key === 'newUserRegistration' && 'Notify when new users register'}
                    {key === 'failedLogins' && 'Alert on failed login attempts'}
                    {key === 'systemMaintenance' && 'Maintenance mode notifications'}
                    {key === 'backupAlerts' && 'Database backup status alerts'}
                    {key === 'securityIncidents' && 'Security incident notifications'}
                    {key === 'performanceAlerts' && 'System performance warnings'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => 
                    setSystemNotifications(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <Button onClick={handleSaveSystemNotifications} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
