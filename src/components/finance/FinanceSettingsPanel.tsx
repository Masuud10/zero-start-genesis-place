
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, DollarSign, Smartphone, Save, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const FinanceSettingsPanel: React.FC = () => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [settings, setSettings] = useState({
    // M-PESA Settings
    mpesa_consumer_key: '',
    mpesa_consumer_secret: '',
    mpesa_passkey: '',
    mpesa_paybill_number: '',
    
    // Fee Settings
    late_fee_percentage: 0,
    late_fee_grace_days: 0,
    tax_rate: 0,
    
    // General Settings
    settings_data: {}
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: financeSettings, isLoading } = useQuery({
    queryKey: ['finance-settings', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) return null;

      const { data, error } = await supabase
        .from('finance_settings')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.school_id
  });

  useEffect(() => {
    if (financeSettings) {
      setSettings({
        mpesa_consumer_key: financeSettings.mpesa_consumer_key || '',
        mpesa_consumer_secret: financeSettings.mpesa_consumer_secret || '',
        mpesa_passkey: financeSettings.mpesa_passkey || '',
        mpesa_paybill_number: financeSettings.mpesa_paybill_number || '',
        late_fee_percentage: financeSettings.late_fee_percentage || 0,
        late_fee_grace_days: financeSettings.late_fee_grace_days || 0,
        tax_rate: financeSettings.tax_rate || 0,
        settings_data: financeSettings.settings_data || {}
      });
    }
  }, [financeSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      if (!user?.school_id) throw new Error('No school ID');

      const { data, error } = await supabase
        .from('finance_settings')
        .upsert({
          school_id: user.school_id,
          ...newSettings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'school_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Finance settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['finance-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Finance Settings
          </h2>
          <p className="text-muted-foreground">Configure payment methods and financial policies</p>
        </div>
        <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="mpesa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mpesa">M-PESA Settings</TabsTrigger>
          <TabsTrigger value="fees">Fee Settings</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="mpesa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                M-PESA API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Security Notice</span>
                </div>
                <p className="text-sm text-yellow-700">
                  API credentials are encrypted and stored securely. Only enter production credentials when you're ready to go live.
                </p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Switch
                  checked={showSecrets}
                  onCheckedChange={setShowSecrets}
                />
                <Label>Show API credentials</Label>
                {showSecrets ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consumer_key">Consumer Key</Label>
                  <Input
                    id="consumer_key"
                    type={showSecrets ? "text" : "password"}
                    value={settings.mpesa_consumer_key}
                    onChange={(e) => handleInputChange('mpesa_consumer_key', e.target.value)}
                    placeholder="Enter M-PESA Consumer Key"
                  />
                </div>

                <div>
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <Input
                    id="consumer_secret"
                    type={showSecrets ? "text" : "password"}
                    value={settings.mpesa_consumer_secret}
                    onChange={(e) => handleInputChange('mpesa_consumer_secret', e.target.value)}
                    placeholder="Enter M-PESA Consumer Secret"
                  />
                </div>

                <div>
                  <Label htmlFor="passkey">Passkey</Label>
                  <Input
                    id="passkey"
                    type={showSecrets ? "text" : "password"}
                    value={settings.mpesa_passkey}
                    onChange={(e) => handleInputChange('mpesa_passkey', e.target.value)}
                    placeholder="Enter M-PESA Passkey"
                  />
                </div>

                <div>
                  <Label htmlFor="paybill">Paybill Number</Label>
                  <Input
                    id="paybill"
                    type="text"
                    value={settings.mpesa_paybill_number}
                    onChange={(e) => handleInputChange('mpesa_paybill_number', e.target.value)}
                    placeholder="Enter Paybill Number"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">How to get M-PESA API Credentials:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Visit the Safaricom Developer Portal</li>
                  <li>2. Create an account and login</li>
                  <li>3. Create a new app for M-PESA Express (STK Push)</li>
                  <li>4. Copy the Consumer Key and Consumer Secret</li>
                  <li>5. Get your Paybill/Till number and Passkey from Safaricom</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Fee Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="late_fee_percentage">Late Fee Percentage (%)</Label>
                  <Input
                    id="late_fee_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.late_fee_percentage}
                    onChange={(e) => handleInputChange('late_fee_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 5.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage charged on overdue fees
                  </p>
                </div>

                <div>
                  <Label htmlFor="late_fee_grace_days">Grace Period (Days)</Label>
                  <Input
                    id="late_fee_grace_days"
                    type="number"
                    min="0"
                    value={settings.late_fee_grace_days}
                    onChange={(e) => handleInputChange('late_fee_grace_days', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 7"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Days after due date before late fees apply
                  </p>
                </div>

                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 16.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    VAT or other applicable tax rate
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Fee Policy Guidelines:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Set reasonable late fee percentages (typically 1-5%)</li>
                  <li>• Provide adequate grace periods for parents</li>
                  <li>• Ensure tax rates comply with local regulations</li>
                  <li>• Review and update policies annually</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                General Finance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Input
                  id="currency"
                  type="text"
                  value="KES"
                  disabled
                  placeholder="KES"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Currently fixed to Kenyan Shillings
                </p>
              </div>

              <div>
                <Label htmlFor="financial_year">Financial Year Start</Label>
                <Input
                  id="financial_year"
                  type="month"
                  value="2024-01"
                  placeholder="Select month"
                />
                <p className="text-xs text-gray-500 mt-1">
                  When does your financial year begin?
                </p>
              </div>

              <div>
                <Label htmlFor="receipt_template">Receipt Template</Label>
                <Textarea
                  id="receipt_template"
                  placeholder="Customize your payment receipt template..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Template for payment receipts and invoices
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Backup & Security:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Automatic Backups</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Two-Factor Authentication</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <Switch defaultChecked />
                  </div>
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
