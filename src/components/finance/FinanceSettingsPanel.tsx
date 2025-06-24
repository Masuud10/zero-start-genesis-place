
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, CreditCard, Calculator, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useFinanceSettings } from '@/hooks/useFinanceSettings';
import { useToast } from '@/hooks/use-toast';

const FinanceSettingsPanel: React.FC = () => {
  const { settings, loading, error, updateSettings } = useFinanceSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    mpesa_consumer_key: '',
    mpesa_consumer_secret: '',
    mpesa_paybill_number: '',
    mpesa_passkey: '',
    tax_rate: 0,
    late_fee_percentage: 0,
    late_fee_grace_days: 0
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        mpesa_consumer_key: settings.mpesa_consumer_key || '',
        mpesa_consumer_secret: settings.mpesa_consumer_secret || '',
        mpesa_paybill_number: settings.mpesa_paybill_number || '',
        mpesa_passkey: settings.mpesa_passkey || '',
        tax_rate: settings.tax_rate || 0,
        late_fee_percentage: settings.late_fee_percentage || 0,
        late_fee_grace_days: settings.late_fee_grace_days || 0
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error: updateError } = await updateSettings(formData);
      
      if (updateError) {
        toast({
          title: "Error",
          description: updateError,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Finance settings updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading finance settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading finance settings: {error}
        </AlertDescription>
      </Alert>
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
          <p className="text-muted-foreground">Configure payment methods and fee policies</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      <Tabs defaultValue="mpesa" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mpesa" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            MPESA Config
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Fee Policies
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mpesa">
          <Card>
            <CardHeader>
              <CardTitle>MPESA Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consumer_key">Consumer Key</Label>
                  <Input
                    id="consumer_key"
                    type="password"
                    value={formData.mpesa_consumer_key}
                    onChange={(e) => handleInputChange('mpesa_consumer_key', e.target.value)}
                    placeholder="Enter MPESA Consumer Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    value={formData.mpesa_consumer_secret}
                    onChange={(e) => handleInputChange('mpesa_consumer_secret', e.target.value)}
                    placeholder="Enter MPESA Consumer Secret"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paybill_number">Paybill Number</Label>
                  <Input
                    id="paybill_number"
                    value={formData.mpesa_paybill_number}
                    onChange={(e) => handleInputChange('mpesa_paybill_number', e.target.value)}
                    placeholder="Enter Paybill Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passkey">Passkey</Label>
                  <Input
                    id="passkey"
                    type="password"
                    value={formData.mpesa_passkey}
                    onChange={(e) => handleInputChange('mpesa_passkey', e.target.value)}
                    placeholder="Enter MPESA Passkey"
                  />
                </div>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  These credentials are securely encrypted and stored. They are used to process MPESA payments for your school.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    value={formData.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late_fee_percentage">Late Fee (%)</Label>
                  <Input
                    id="late_fee_percentage"
                    type="number"
                    step="0.01"
                    value={formData.late_fee_percentage}
                    onChange={(e) => handleInputChange('late_fee_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late_fee_grace_days">Grace Period (Days)</Label>
                  <Input
                    id="late_fee_grace_days"
                    type="number"
                    value={formData.late_fee_grace_days}
                    onChange={(e) => handleInputChange('late_fee_grace_days', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Late fees will be automatically applied to overdue payments after the grace period expires.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Additional general finance settings will be available in future updates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceSettingsPanel;
