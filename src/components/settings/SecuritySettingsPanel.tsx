
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Lock } from 'lucide-react';

const SecuritySettingsPanel: React.FC = () => {
  const { toast } = useToast();

  const handleUpdateSecurity = () => {
    toast({
      title: "Security Updated",
      description: "Security settings have been updated successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Two-Factor Authentication</Label>
            <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Password Complexity</Label>
            <p className="text-xs text-gray-500">Enforce strong password requirements</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div>
          <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
          <Input
            id="session_timeout"
            type="number"
            defaultValue="30"
            min="5"
            max="480"
          />
        </div>

        <div>
          <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
          <Input
            id="max_login_attempts"
            type="number"
            defaultValue="5"
            min="3"
            max="10"
          />
        </div>

        <Button onClick={handleUpdateSecurity} className="w-full">
          Update Security Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsPanel;
