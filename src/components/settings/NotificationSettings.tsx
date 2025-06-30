
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  
  const [emailSettings, setEmailSettings] = useState({
    systemAlerts: true,
    userRegistrations: true,
    securityEvents: true,
    maintenanceNotices: false,
    weeklyReports: true
  });

  const [smsSettings, setSmsSettings] = useState({
    criticalAlerts: true,
    securityBreaches: true,
    systemDown: true
  });

  const [emailConfig, setEmailConfig] = useState({
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@edufam.com',
    fromName: 'EduFam System'
  });

  const handleSaveEmailSettings = () => {
    toast({
      title: "Email Settings Updated",
      description: "Email notification preferences have been saved successfully.",
    });
  };

  const handleSaveSmsSettings = () => {
    toast({
      title: "SMS Settings Updated",
      description: "SMS notification preferences have been saved successfully.",
    });
  };

  const handleSaveEmailConfig = () => {
    toast({
      title: "Email Configuration Updated",
      description: "SMTP configuration has been saved successfully.",
    });
  };

  const handleTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to verify the configuration.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>System Alerts</Label>
              <p className="text-xs text-gray-500">Critical system alerts and errors</p>
            </div>
            <Switch
              checked={emailSettings.systemAlerts}
              onCheckedChange={(checked) => 
                setEmailSettings(prev => ({ ...prev, systemAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>User Registrations</Label>
              <p className="text-xs text-gray-500">New user registration notifications</p>
            </div>
            <Switch
              checked={emailSettings.userRegistrations}
              onCheckedChange={(checked) => 
                setEmailSettings(prev => ({ ...prev, userRegistrations: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Security Events</Label>
              <p className="text-xs text-gray-500">Security incidents and breaches</p>
            </div>
            <Switch
              checked={emailSettings.securityEvents}
              onCheckedChange={(checked) => 
                setEmailSettings(prev => ({ ...prev, securityEvents: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Notices</Label>
              <p className="text-xs text-gray-500">Scheduled maintenance notifications</p>
            </div>
            <Switch
              checked={emailSettings.maintenanceNotices}
              onCheckedChange={(checked) => 
                setEmailSettings(prev => ({ ...prev, maintenanceNotices: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Reports</Label>
              <p className="text-xs text-gray-500">Weekly system usage reports</p>
            </div>
            <Switch
              checked={emailSettings.weeklyReports}
              onCheckedChange={(checked) => 
                setEmailSettings(prev => ({ ...prev, weeklyReports: checked }))
              }
            />
          </div>

          <Button onClick={handleSaveEmailSettings} className="w-full">
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Critical Alerts</Label>
              <p className="text-xs text-gray-500">High-priority system alerts</p>
            </div>
            <Switch
              checked={smsSettings.criticalAlerts}
              onCheckedChange={(checked) => 
                setSmsSettings(prev => ({ ...prev, criticalAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Security Breaches</Label>
              <p className="text-xs text-gray-500">Security incident notifications</p>
            </div>
            <Switch
              checked={smsSettings.securityBreaches}
              onCheckedChange={(checked) => 
                setSmsSettings(prev => ({ ...prev, securityBreaches: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>System Down</Label>
              <p className="text-xs text-gray-500">System downtime notifications</p>
            </div>
            <Switch
              checked={smsSettings.systemDown}
              onCheckedChange={(checked) => 
                setSmsSettings(prev => ({ ...prev, systemDown: checked }))
              }
            />
          </div>

          <Button onClick={handleSaveSmsSettings} className="w-full">
            Save SMS Settings
          </Button>
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
              <Label htmlFor="smtp_server">SMTP Server</Label>
              <Input
                id="smtp_server"
                value={emailConfig.smtpServer}
                onChange={(e) => 
                  setEmailConfig(prev => ({ ...prev, smtpServer: e.target.value }))
                }
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                value={emailConfig.smtpPort}
                onChange={(e) => 
                  setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))
                }
                placeholder="587"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="smtp_username">SMTP Username</Label>
            <Input
              id="smtp_username"
              value={emailConfig.smtpUsername}
              onChange={(e) => 
                setEmailConfig(prev => ({ ...prev, smtpUsername: e.target.value }))
              }
              placeholder="your-email@gmail.com"
            />
          </div>

          <div>
            <Label htmlFor="smtp_password">SMTP Password</Label>
            <Input
              id="smtp_password"
              type="password"
              value={emailConfig.smtpPassword}
              onChange={(e) => 
                setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))
              }
              placeholder="Your app password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from_email">From Email</Label>
              <Input
                id="from_email"
                value={emailConfig.fromEmail}
                onChange={(e) => 
                  setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))
                }
                placeholder="noreply@edufam.com"
              />
            </div>
            <div>
              <Label htmlFor="from_name">From Name</Label>
              <Input
                id="from_name"
                value={emailConfig.fromName}
                onChange={(e) => 
                  setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))
                }
                placeholder="EduFam System"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveEmailConfig} className="flex-1">
              Save Configuration
            </Button>
            <Button onClick={handleTestEmail} variant="outline">
              Test Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
