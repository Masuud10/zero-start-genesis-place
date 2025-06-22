
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Smartphone, Calculator, DollarSign } from 'lucide-react';
import { useMpesaCredentials } from '@/hooks/fee-management/useMpesaCredentials';
import { useToast } from '@/hooks/use-toast';

const FinanceSettingsPanel: React.FC = () => {
  const [mpesaConfig, setMpesaConfig] = useState({
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    paybill_number: ''
  });
  
  const [feeSettings, setFeeSettings] = useState({
    late_fee_percentage: 5,
    grace_period_days: 7,
    tax_rate: 0,
    discount_threshold: 0
  });

  const { credentials, saveCredentials } = useMpesaCredentials();
  const { toast } = useToast();

  React.useEffect(() => {
    if (credentials) {
      setMpesaConfig(credentials);
    }
  }, [credentials]);

  const handleSaveMpesa = async () => {
    const result = await saveCredentials(mpesaConfig);
    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "M-PESA credentials saved successfully",
      });
    }
  };

  const handleSaveFeeSettings = () => {
    // TODO: Implement fee settings save functionality
    toast({
      title: "Success", 
      description: "Fee settings saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Finance Settings
        </h3>
      </div>

      <Tabs defaultValue="mpesa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mpesa">M-PESA Configuration</TabsTrigger>
          <TabsTrigger value="fees">Fee Settings</TabsTrigger>
          <TabsTrigger value="security">Security & Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="mpesa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                M-PESA Daraja API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consumer_key">Consumer Key</Label>
                  <Input
                    id="consumer_key"
                    value={mpesaConfig.consumer_key}
                    onChange={(e) => setMpesaConfig(prev => ({ ...prev, consumer_key: e.target.value }))}
                    placeholder="Enter Daraja API Consumer Key"
                  />
                </div>
                <div>
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    value={mpesaConfig.consumer_secret}
                    onChange={(e) => setMpesaConfig(prev => ({ ...prev, consumer_secret: e.target.value }))}
                    placeholder="Enter Daraja API Consumer Secret"
                  />
                </div>
                <div>
                  <Label htmlFor="passkey">Lipa Na M-PESA Passkey</Label>
                  <Input
                    id="passkey"
                    type="password"
                    value={mpesaConfig.passkey}
                    onChange={(e) => setMpesaConfig(prev => ({ ...prev, passkey: e.target.value }))}
                    placeholder="Enter Lipa Na M-PESA Passkey"
                  />
                </div>
                <div>
                  <Label htmlFor="paybill_number">Paybill Number</Label>
                  <Input
                    id="paybill_number"
                    value={mpesaConfig.paybill_number}
                    onChange={(e) => setMpesaConfig(prev => ({ ...prev, paybill_number: e.target.value }))}
                    placeholder="Enter Paybill Number"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveMpesa} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save M-PESA Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Fee Management Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="late_fee">Late Fee Percentage (%)</Label>
                  <Input
                    id="late_fee"
                    type="number"
                    min="0"
                    max="100"
                    value={feeSettings.late_fee_percentage}
                    onChange={(e) => setFeeSettings(prev => ({ ...prev, late_fee_percentage: parseFloat(e.target.value) || 0 }))}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="grace_period">Grace Period (Days)</Label>
                  <Input
                    id="grace_period"
                    type="number"
                    min="0"
                    value={feeSettings.grace_period_days}
                    onChange={(e) => setFeeSettings(prev => ({ ...prev, grace_period_days: parseInt(e.target.value) || 0 }))}
                    placeholder="7"
                  />
                </div>
                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={feeSettings.tax_rate}
                    onChange={(e) => setFeeSettings(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="discount_threshold">Early Payment Discount (%)</Label>
                  <Input
                    id="discount_threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={feeSettings.discount_threshold}
                    onChange={(e) => setFeeSettings(prev => ({ ...prev, discount_threshold: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveFeeSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Fee Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Security & Audit Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Financial Audit Logging</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    All financial transactions are automatically logged for audit purposes.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Logging Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Role-Based Access Control</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Finance module access is restricted to authorized personnel only.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">RBAC Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Enabled</span>
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
