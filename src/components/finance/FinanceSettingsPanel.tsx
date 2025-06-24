
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FinanceSettings {
  mpesa_consumer_key: string;
  mpesa_consumer_secret: string;
  mpesa_paybill_number: string;
  mpesa_passkey: string;
  tax_rate: number;
  late_fee_percentage: number;
  late_fee_grace_days: number;
}

const FinanceSettingsPanel: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FinanceSettings>({
    mpesa_consumer_key: '',
    mpesa_consumer_secret: '',
    mpesa_paybill_number: '',
    mpesa_passkey: '',
    tax_rate: 0,
    late_fee_percentage: 0,
    late_fee_grace_days: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setSettings({
          mpesa_consumer_key: data.mpesa_consumer_key || '',
          mpesa_consumer_secret: data.mpesa_consumer_secret || '',
          mpesa_paybill_number: data.mpesa_paybill_number || '',
          mpesa_passkey: data.mpesa_passkey || '',
          tax_rate: Number(data.tax_rate || 0),
          late_fee_percentage: Number(data.late_fee_percentage || 0),
          late_fee_grace_days: Number(data.late_fee_grace_days || 0)
        });
      }
    } catch (err: any) {
      console.error('Error fetching finance settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.school_id) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('finance_settings')
        .upsert({
          school_id: user.school_id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Finance settings saved successfully');
    } catch (err: any) {
      console.error('Error saving finance settings:', err);
      setError(err.message);
      toast.error('Failed to save finance settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof FinanceSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading finance settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Finance Settings
          </h2>
          <p className="text-muted-foreground">Configure school-specific finance settings</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MPESA Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>MPESA Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="consumer-key">Consumer Key</Label>
              <Input
                id="consumer-key"
                type="password"
                value={settings.mpesa_consumer_key}
                onChange={(e) => handleInputChange('mpesa_consumer_key', e.target.value)}
                placeholder="Enter MPESA Consumer Key"
              />
            </div>
            <div>
              <Label htmlFor="consumer-secret">Consumer Secret</Label>
              <Input
                id="consumer-secret"
                type="password"
                value={settings.mpesa_consumer_secret}
                onChange={(e) => handleInputChange('mpesa_consumer_secret', e.target.value)}
                placeholder="Enter MPESA Consumer Secret"
              />
            </div>
            <div>
              <Label htmlFor="paybill">Paybill Number</Label>
              <Input
                id="paybill"
                value={settings.mpesa_paybill_number}
                onChange={(e) => handleInputChange('mpesa_paybill_number', e.target.value)}
                placeholder="Enter Paybill Number"
              />
            </div>
            <div>
              <Label htmlFor="passkey">Passkey</Label>
              <Input
                id="passkey"
                type="password"
                value={settings.mpesa_passkey}
                onChange={(e) => handleInputChange('mpesa_passkey', e.target.value)}
                placeholder="Enter MPESA Passkey"
              />
            </div>
          </CardContent>
        </Card>

        {/* Fee Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                value={settings.tax_rate}
                onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="late-fee">Late Fee Percentage (%)</Label>
              <Input
                id="late-fee"
                type="number"
                step="0.01"
                value={settings.late_fee_percentage}
                onChange={(e) => handleInputChange('late_fee_percentage', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="grace-days">Grace Days for Late Fees</Label>
              <Input
                id="grace-days"
                type="number"
                value={settings.late_fee_grace_days}
                onChange={(e) => handleInputChange('late_fee_grace_days', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
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
    </div>
  );
};

export default FinanceSettingsPanel;
