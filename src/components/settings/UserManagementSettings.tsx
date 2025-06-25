
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, UserMinus } from 'lucide-react';

const UserManagementSettings: React.FC = () => {
  const { toast } = useToast();

  const handleUpdateUserSettings = () => {
    toast({
      title: "User Settings Updated",
      description: "User management settings have been updated successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Auto User Activation</Label>
            <p className="text-xs text-gray-500">Automatically activate new users</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Email Verification Required</Label>
            <p className="text-xs text-gray-500">Require email verification for new users</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div>
          <Label htmlFor="default_role">Default User Role</Label>
          <Input
            id="default_role"
            defaultValue="parent"
            placeholder="Default role for new users"
          />
        </div>

        <div>
          <Label htmlFor="max_users_per_school">Max Users per School</Label>
          <Input
            id="max_users_per_school"
            type="number"
            defaultValue="500"
            min="10"
            max="10000"
          />
        </div>

        <Button onClick={handleUpdateUserSettings} className="w-full">
          Update User Management Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserManagementSettings;
