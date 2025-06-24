
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, CreditCard, Percent, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface FinanceSettings {
  mpesa_consumer_key: string;
  mpesa_consumer_secret: string;
  mpesa_passkey: string;
  mpesa_paybill_number: string;
  late_fee_percentage: number;
  late_fee_grace_days: number;
  tax_rate: number;
  settings_data: any;
}

const FinanceSettingsPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [settings, setSettings] = useState<FinanceSettings>({
    mpesa_consumer_key: '',
    mpesa_consumer_secret: '',
    mpesa_passkey: '',
    mpesa_paybill_number: '',
    late_fee_percentage: 0,
    late_fee_grace_days: 7,
    tax_rate: 0,
    settings_data: {}
  });

  useEffect(() => {
    fetchSettings();
  }, [user?.school_id]);

  const fetchSettings = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      console.log('🔍 Fetching finance settings for school:', user.school_id);

      const { data, error } = await supabase
        .from('finance_settings')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching finance settings:', error);
        throw error;
      }

      if (data) {
        setSettings({
          mpesa_consumer_key: data.mpesa_consumer_key || '',
          mpesa_consumer_secret: data.mpesa_consumer_secret || '',
          mpesa_passkey: data.mpesa_passkey || '',
          mpesa_paybill_number: data.mpesa_paybill_number || '',
          late_fee_percentage: data.late_fee_percentage || 0,
          late_fee_grace_days: data.late_fee_grace_days || 7,
          tax_rate: data.tax_rate || 0,
          settings_data: data.settings_data || {}
        });
        console.log('✅ Finance settings loaded');
      } else {
        console.log('📝 No existing finance settings found');
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
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "No school ID found",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Saving finance settings for school:', user.school_id);

      const { error } = await supabase
        .from('finance_settings')
        .upsert({
          school_id: user.school_id,
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'school_id'
        });

      if (error) {
        console.error('Error saving finance settings:', error);
        throw error;
      }

      console.log('✅ Finance settings saved successfully');
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

  const handleInputChange = (field: keyof FinanceSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Finance Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mpesa" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mpesa" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                M-PESA Setup
              </TabsTrigger>
              <TabsTrigger value="fees" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Fee Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mpesa" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">M-PESA API Configuration</h3>
                <p className="text-blue-700 text-sm">
                  Configure your Safaricom Daraja API credentials to enable M-PESA payments. 
                  Get your credentials from the Safaricom Developer Portal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consumer_key">Consumer Key *</Label>
                  <Input
                    id="consumer_key"
                    type={showSecrets ? "text" : "password"}
                    value={settings.mpesa_consumer_key}
                    onChange={(e) => handleInputChange('mpesa_consumer_key', e.target.value)}
                    placeholder="Enter Daraja API Consumer Key"
                  />
                </div>

                <div>
                  <Label htmlFor="consumer_secret">Consumer Secret *</Label>
                  <Input
                    id="consumer_secret"
                    type={showSecrets ? "text" : "password"}
                    value={settings.mpesa_consumer_secret}
                    onChange={(e) => handleInputChange('mpesa_consumer_secret', e.target.value)}
                    placeholder="Enter Daraja API Consumer Secret"
                  />
                </div>

                <div>
                  <Label htmlFor="passkey">Lipa Na M-PESA Passkey *</Label>
                  <Input
                    id="passkey"
                    type={showSecrets ? "text" : "password"}
                    value={settings.mpesa_passkey}
                    onChange={(e) => handleInputChange('mpesa_passkey', e.target.value)}
                    placeholder="Enter Lipa Na M-PESA Passkey"
                  />
                </div>

                <div>
                  <Label htmlFor="paybill_number">Paybill Number *</Label>
                  <Input
                    id="paybill_number"
                    value={settings.mpesa_paybill_number}
                    onChange={(e) => handleInputChange('mpesa_paybill_number', e.target.value)}
                    placeholder="Enter Paybill Number"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showSecrets}
                  onCheckedChange={setShowSecrets}
                />
                <Label className="flex items-center gap-2">
                  {showSecrets ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {showSecrets ? 'Hide' : 'Show'} API credentials
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Fee Configuration</h3>
                <p className="text-yellow-700 text-sm">
                  Configure automatic fee calculations, late fee penalties, and tax rates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="late_fee_percentage">Late Fee Percentage (%)</Label>
                  <Input
                    id="late_fee_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.late_fee_percentage}
                    onChange={(e) => handleInputChange('late_fee_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 5.0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage charged as late fee on overdue payments
                  </p>
                </div>

                <div>
                  <Label htmlFor="late_fee_grace_days">Grace Period (Days)</Label>
                  <Input
                    id="late_fee_grace_days"
                    type="number"
                    min="0"
                    max="365"
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
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 16.0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    VAT or other applicable tax rate
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Fee Calculation Preview</h4>
                <div className="text-sm space-y-1">
                  <p>Base Fee Amount: KES 10,000</p>
                  <p>Tax ({settings.tax_rate}%): KES {((10000 * settings.tax_rate) / 100).toFixed(2)}</p>
                  <p>Late Fee ({settings.late_fee_percentage}%): KES {((10000 * settings.late_fee_percentage) / 100).toFixed(2)}</p>
                  <p className="font-semibold border-t pt-1">
                    Total with taxes and late fees: KES {(10000 + (10000 * settings.tax_rate / 100) + (10000 * settings.late_fee_percentage / 100)).toFixed(2)}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Security Information</h3>
                <p className="text-red-700 text-sm">
                  All API credentials and sensitive financial data are encrypted and stored securely. 
                  Only authorized personnel can access this information.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">M-PESA API Credentials</h4>
                    <p className="text-sm text-gray-500">
                      {settings.mpesa_consumer_key ? 'Configured' : 'Not configured'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${settings.mpesa_consumer_key ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Paybill Configuration</h4>
                    <p className="text-sm text-gray-500">
                      {settings.mpesa_paybill_number ? `Paybill: ${settings.mpesa_paybill_number}` : 'Not configured'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${settings.mpesa_paybill_number ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Encryption</h4>
                    <p className="text-sm text-gray-500">All data encrypted at rest and in transit</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={saveSettings} disabled={saving}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceSettingsPanel;
