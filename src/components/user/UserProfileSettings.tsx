
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, Palette, Settings, Save } from 'lucide-react';

const UserProfileSettings = () => {
  const { user } = useAuth();
  const { updateUserSettings, isUpdating } = useUserSettings();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    theme_preference: 'system',
    showGreetings: true,
    compactMode: false,
    defaultView: 'dashboard'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        theme_preference: user.user_metadata?.theme_preference || 'system',
        showGreetings: user.user_metadata?.dashboard_preferences?.showGreetings ?? true,
        compactMode: user.user_metadata?.dashboard_preferences?.compactMode ?? false,
        defaultView: user.user_metadata?.dashboard_preferences?.defaultView || 'dashboard'
      });
    }
  }, [user]);

  const handleSave = () => {
    updateUserSettings.mutate({
      name: formData.name,
      theme_preference: formData.theme_preference as 'light' | 'dark' | 'system',
      dashboard_preferences: {
        showGreetings: formData.showGreetings,
        compactMode: formData.compactMode,
        defaultView: formData.defaultView
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your display name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme Preference</Label>
            <Select
              value={formData.theme_preference}
              onValueChange={(value) => setFormData(prev => ({ ...prev, theme_preference: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showGreetings">Show Greetings</Label>
              <p className="text-sm text-gray-500">Display welcome message on dashboard</p>
            </div>
            <Switch
              id="showGreetings"
              checked={formData.showGreetings}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showGreetings: checked }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-sm text-gray-500">Reduce spacing and card sizes</p>
            </div>
            <Switch
              id="compactMode"
              checked={formData.compactMode}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, compactMode: checked }))}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="defaultView">Default View</Label>
            <Select
              value={formData.defaultView}
              onValueChange={(value) => setFormData(prev => ({ ...prev, defaultView: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="overview">Overview</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating} className="flex items-center gap-2">
          {isUpdating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default UserProfileSettings;
