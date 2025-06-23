
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Smartphone, DollarSign, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsData {
  auto_apply_late_fees: boolean;
  allow_partial_payments: boolean;
  send_payment_notifications: boolean;
  require_payment_approval: boolean;
  default_currency: string;
  payment_methods: string[];
}

interface FinanceSettings {
  id?: string;
  school_id: string;
  mpesa_consumer_key?: string;
  mpesa_consumer_secret?: string;
  mpesa_paybill_number?: string;
  mpesa_passkey?: string;
  late_fee_percentage: number;
  late_fee_grace_days: number;
  tax_rate: number;
  settings_data: SettingsData;
}

const FinanceSettingsPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<FinanceSettings>({
    school_id: user?.school_id || '',
    late_fee_percentage: 0,
    late_fee_grace_days: 7,
    tax_rate: 0,
    settings_data: {
      auto_apply_late_fees: false,
      allow_partial_payments: true,
      send_payment_notifications: true,
      require_payment_approval: false,
      default_currency: 'KES',
      payment_methods: ['cash', 'mpesa', 'bank_transfer'],
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [user?.school_id]);

  const fetchSettings = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('finance_settings')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        const settingsData = data.settings_data as any;
        
        // Safely parse settings_data with proper type checking
        const typedSettingsData: SettingsData = {
          auto_apply_late_fees: Boolean(settingsData?.auto_apply_late_fees || false),
          allow_partial_payments: Boolean(settingsData?.allow_partial_payments ?? true),
          send_payment_notifications: Boolean(settingsData?.send_payment_notifications ?? true),
          require_payment_approval: Boolean(settingsData?.require_payment_approval || false),
          default_currency: String(settingsData?.default_currency || 'KES'),
          payment_methods: Array.isArray(settingsData?.payment_methods) 
            ? settingsData.payment_methods 
            : ['cash', 'mpesa', 'bank_transfer'],
        };

        setSettings({
          ...data,
          settings_data: typedSettingsData,
        });
      }
    } catch (err: any) {
      console.error('Error fetching finance settings:', err);
      toast({
        title: "Error",
        description: "Failed to load finance settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.school_id) return;

    try {
      setSaving(true);
      
      // Convert SettingsData to JSON-compatible format
      const settingsToSave = {
        ...settings,
        settings_data: settings.settings_data as any, // Cast to any for JSON compatibility
      };

      const { error } = await supabase
        .from('finance_settings')
        .upsert(settingsToSave, { onConflict: 'school_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Finance settings saved successfully",
      });
    } catch (err: any) {
      console.error('Error saving finance settings:', err);
      toast({
        title: "Error",
        description: "Failed to save finance settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateSettingsData = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      settings_data: {
        ...prev.settings_data,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading finance settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Finance Settings</h2>
          <p className="text-muted-foreground">
            Configure financial settings, payment methods, and fee policies
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="mpesa">M-PESA Configuration</TabsTrigger>
          <TabsTrigger value="policies">Fee Policies</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Finance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Input
                    id="defaultCurrency"
                    value={settings.settings_data.default_currency}
                    onChange={(e) => updateSettingsData('default_currency', e.target.value)}
                    placeholder="KES"
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.tax_rate}
                    onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value) || 0)}
                    placeholder="16"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowPartialPayments"
                    checked={settings.settings_data.allow_partial_payments}
                    onCheckedChange={(checked) => updateSettingsData('allow_partial_payments', checked)}
                  />
                  <Label htmlFor="allowPartialPayments">Allow Partial Payments</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireApproval"
                    checked={settings.settings_data.require_payment_approval}
                    onCheckedChange={(checked) => updateSettingsData('require_payment_approval', checked)}
                  />
                  <Label htmlFor="requireApproval">Require Payment Approval</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mpesa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                M-PESA API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These are sensitive credentials. Ensure they are kept secure and only accessible to authorized personnel.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consumerKey">Consumer Key</Label>
                  <Input
                    id="consumerKey"
                    type="password"
                    value={settings.mpesa_consumer_key || ''}
                    onChange={(e) => updateSetting('mpesa_consumer_key', e.target.value)}
                    placeholder="Enter M-PESA Consumer Key"
                  />
                </div>
                <div>
                  <Label htmlFor="consumerSecret">Consumer Secret</Label>
                  <Input
                    id="consumerSecret"
                    type="password"
                    value={settings.mpesa_consumer_secret || ''}
                    onChange={(e) => updateSetting('mpesa_consumer_secret', e.target.value)}
                    placeholder="Enter M-PESA Consumer Secret"
                  />
                </div>
                <div>
                  <Label htmlFor="paybillNumber">Paybill Number</Label>
                  <Input
                    id="paybillNumber"
                    value={settings.mpesa_paybill_number || ''}
                    onChange={(e) => updateSetting('mpesa_paybill_number', e.target.value)}
                    placeholder="Enter Paybill Number"
                  />
                </div>
                <div>
                  <Label htmlFor="passkey">Passkey</Label>
                  <Input
                    id="passkey"
                    type="password"
                    value={settings.mpesa_passkey || ''}
                    onChange={(e) => updateSetting('mpesa_passkey', e.target.value)}
                    placeholder="Enter M-PESA Passkey"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lateFeePercentage">Late Fee Percentage (%)</Label>
                  <Input
                    id="lateFeePercentage"
                    type="number"
                    value={settings.late_fee_percentage}
                    onChange={(e) => updateSetting('late_fee_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="graceDays">Grace Period (Days)</Label>
                  <Input
                    id="graceDays"
                    type="number"
                    value={settings.late_fee_grace_days}
                    onChange={(e) => updateSetting('late_fee_grace_days', parseInt(e.target.value) || 0)}
                    placeholder="7"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoLateFees"
                  checked={settings.settings_data.auto_apply_late_fees}
                  onCheckedChange={(checked) => updateSettingsData('auto_apply_late_fees', checked)}
                />
                <Label htmlFor="autoLateFees">Automatically Apply Late Fees</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="paymentNotifications"
                  checked={settings.settings_data.send_payment_notifications}
                  onCheckedChange={(checked) => updateSettingsData('send_payment_notifications', checked)}
                />
                <Label htmlFor="paymentNotifications">Send Payment Notifications</Label>
              </div>

              <div className="space-y-2">
                <Label>Notification Templates</Label>
                <p className="text-sm text-muted-foreground">
                  Configure automatic notification templates for payment confirmations, reminders, and overdue notices.
                </p>
                <Button variant="outline" size="sm">
                  Configure Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceSettingsPanel;
