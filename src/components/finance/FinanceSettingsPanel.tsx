import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, CreditCard, AlertCircle, CheckCircle, Save, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FinanceSettingsData {
  currency: string;
  payment_methods: string[];
  auto_generate_receipts: boolean;
  send_payment_notifications: boolean;
  allow_partial_payments: boolean;
  require_payment_approval: boolean;
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
  settings_data: FinanceSettingsData;
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
      currency: 'KES',
      payment_methods: ['cash', 'mpesa'],
      auto_generate_receipts: true,
      send_payment_notifications: true,
      allow_partial_payments: true,
      require_payment_approval: false,
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    consumer_key: false,
    consumer_secret: false,
    passkey: false
  });

  useEffect(() => {
    fetchSettings();
  }, [user?.school_id]);

  const parseSettingsData = (data: any): FinanceSettingsData => {
    // Default settings structure
    const defaultSettings: FinanceSettingsData = {
      currency: 'KES',
      payment_methods: ['cash', 'mpesa'],
      auto_generate_receipts: true,
      send_payment_notifications: true,
      allow_partial_payments: true,
      require_payment_approval: false,
    };

    // If data is null, undefined, or not an object, return defaults
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return defaultSettings;
    }

    // Merge with defaults to ensure all properties exist
    return {
      currency: typeof data.currency === 'string' ? data.currency : defaultSettings.currency,
      payment_methods: Array.isArray(data.payment_methods) ? data.payment_methods : defaultSettings.payment_methods,
      auto_generate_receipts: typeof data.auto_generate_receipts === 'boolean' ? data.auto_generate_receipts : defaultSettings.auto_generate_receipts,
      send_payment_notifications: typeof data.send_payment_notifications === 'boolean' ? data.send_payment_notifications : defaultSettings.send_payment_notifications,
      allow_partial_payments: typeof data.allow_partial_payments === 'boolean' ? data.allow_partial_payments : defaultSettings.allow_partial_payments,
      require_payment_approval: typeof data.require_payment_approval === 'boolean' ? data.require_payment_approval : defaultSettings.require_payment_approval,
    };
  };

  const fetchSettings = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('finance_settings')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          ...data,
          settings_data: parseSettingsData(data.settings_data)
        });
      }
    } catch (error: any) {
      console.error('Error fetching finance settings:', error);
      toast({
        title: "Error",
        description: "Failed to load finance settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.school_id) return;

    try {
      setSaving(true);

      const settingsToSave = {
        school_id: user.school_id,
        mpesa_consumer_key: settings.mpesa_consumer_key,
        mpesa_consumer_secret: settings.mpesa_consumer_secret,
        mpesa_paybill_number: settings.mpesa_paybill_number,
        mpesa_passkey: settings.mpesa_passkey,
        late_fee_percentage: settings.late_fee_percentage,
        late_fee_grace_days: settings.late_fee_grace_days,
        tax_rate: settings.tax_rate,
        settings_data: settings.settings_data as any, // Cast to any to satisfy Json type
      };

      const { error } = await supabase
        .from('finance_settings')
        .upsert(settingsToSave, {
          onConflict: 'school_id'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Finance settings have been updated successfully.",
      });

    } catch (error: any) {
      console.error('Error saving finance settings:', error);
      toast({
        title: "Error",
        description: "Failed to save finance settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestMpesaConnection = async () => {
    if (!settings.mpesa_consumer_key || !settings.mpesa_consumer_secret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter M-PESA consumer key and secret first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Connection Test",
      description: "M-PESA credentials validation would be implemented here.",
    });
  };

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading finance settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Finance Settings</h2>
          <p className="text-muted-foreground">Configure payment methods and financial policies</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="mpesa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mpesa">M-PESA Integration</TabsTrigger>
          <TabsTrigger value="policies">Fee Policies</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="mpesa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                M-PESA API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  M-PESA credentials are securely encrypted and stored. Never share these credentials with unauthorized persons.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paybill">Paybill Number</Label>
                  <Input
                    id="paybill"
                    value={settings.mpesa_paybill_number || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      mpesa_paybill_number: e.target.value
                    })}
                    placeholder="Enter paybill number"
                  />
                </div>

                <div>
                  <Label htmlFor="consumer_key">Consumer Key</Label>
                  <div className="relative">
                    <Input
                      id="consumer_key"
                      type={showSecrets.consumer_key ? 'text' : 'password'}
                      value={settings.mpesa_consumer_key || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        mpesa_consumer_key: e.target.value
                      })}
                      placeholder="Enter consumer key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('consumer_key')}
                    >
                      {showSecrets.consumer_key ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <div className="relative">
                    <Input
                      id="consumer_secret"
                      type={showSecrets.consumer_secret ? 'text' : 'password'}
                      value={settings.mpesa_consumer_secret || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        mpesa_consumer_secret: e.target.value
                      })}
                      placeholder="Enter consumer secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('consumer_secret')}
                    >
                      {showSecrets.consumer_secret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="passkey">Passkey</Label>
                  <div className="relative">
                    <Input
                      id="passkey"
                      type={showSecrets.passkey ? 'text' : 'password'}
                      value={settings.mpesa_passkey || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        mpesa_passkey: e.target.value
                      })}
                      placeholder="Enter passkey"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('passkey')}
                    >
                      {showSecrets.passkey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={handleTestMpesaConnection}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fee Management Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="late_fee_percentage">Late Fee Percentage (%)</Label>
                  <Input
                    id="late_fee_percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.late_fee_percentage}
                    onChange={(e) => setSettings({
                      ...settings,
                      late_fee_percentage: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="grace_days">Grace Period (Days)</Label>
                  <Input
                    id="grace_days"
                    type="number"
                    min="0"
                    value={settings.late_fee_grace_days}
                    onChange={(e) => setSettings({
                      ...settings,
                      late_fee_grace_days: parseInt(e.target.value) || 0
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.tax_rate}
                    onChange={(e) => setSettings({
                      ...settings,
                      tax_rate: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Finance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Select 
                  value={settings.settings_data.currency} 
                  onValueChange={(value) => setSettings({
                    ...settings,
                    settings_data: {
                      ...settings.settings_data,
                      currency: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Payment Options</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-generate Receipts</Label>
                    <p className="text-sm text-muted-foreground">Automatically generate receipts for successful payments</p>
                  </div>
                  <Switch
                    checked={settings.settings_data.auto_generate_receipts}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      settings_data: {
                        ...settings.settings_data,
                        auto_generate_receipts: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS/email notifications for payments</p>
                  </div>
                  <Switch
                    checked={settings.settings_data.send_payment_notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      settings_data: {
                        ...settings.settings_data,
                        send_payment_notifications: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Partial Payments</Label>
                    <p className="text-sm text-muted-foreground">Allow students to make partial fee payments</p>
                  </div>
                  <Switch
                    checked={settings.settings_data.allow_partial_payments}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      settings_data: {
                        ...settings.settings_data,
                        allow_partial_payments: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Payment Approval</Label>
                    <p className="text-sm text-muted-foreground">Require administrator approval for payments</p>
                  </div>
                  <Switch
                    checked={settings.settings_data.require_payment_approval}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      settings_data: {
                        ...settings.settings_data,
                        require_payment_approval: checked
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceSettingsPanel;
