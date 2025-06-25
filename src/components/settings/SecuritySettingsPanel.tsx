
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Key, AlertTriangle, Users, Eye } from 'lucide-react';

const SecuritySettingsPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sessionTimeout, setSessionTimeout] = useState(30);

  // Fetch security settings
  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['mfa_required', 'session_timeout', 'password_policy']);

      if (error) throw error;

      const settings: Record<string, any> = {};
      data?.forEach(item => {
        settings[item.setting_key] = item.setting_value;
      });

      return {
        mfaRequired: settings.mfa_required?.enabled || false,
        sessionTimeout: settings.session_timeout?.minutes || 30,
        passwordPolicy: settings.password_policy || {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        }
      };
    },
  });

  // Fetch recent security events
  const { data: securityEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('action, user_id, success, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Update security settings mutation
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
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: "Success",
        description: "Security settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update security settings",
        variant: "destructive",
      });
    },
  });

  const handleToggleMFA = () => {
    updateSettingsMutation.mutate({
      key: 'mfa_required',
      value: { enabled: !securitySettings?.mfaRequired }
    });
  };

  const handleUpdateSessionTimeout = () => {
    updateSettingsMutation.mutate({
      key: 'session_timeout',
      value: { minutes: sessionTimeout }
    });
  };

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
      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication & Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Multi-Factor Authentication</h3>
              <p className="text-sm text-gray-600">
                Require MFA for admin and sensitive roles
              </p>
            </div>
            <Switch
              checked={securitySettings?.mfaRequired || false}
              onCheckedChange={handleToggleMFA}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Session Timeout (minutes)</label>
              <Input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                min={5}
                max={480}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleUpdateSessionTimeout}
              disabled={updateSettingsMutation.isPending}
              variant="outline"
              size="sm"
              className="mt-6"
            >
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Minimum Length</p>
              <Badge variant="outline">{securitySettings?.passwordPolicy?.minLength || 8} characters</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Requirements</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">Uppercase</Badge>
                <Badge variant="secondary" className="text-xs">Numbers</Badge>
                <Badge variant="secondary" className="text-xs">Special Chars</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents?.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {event.success ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{event.action}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={event.success ? 'default' : 'destructive'}>
                  {event.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-4">No recent security events</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettingsPanel;
