
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Settings, DollarSign } from 'lucide-react';
import { useBillingSettings, useBillingActions } from '@/hooks/useEnhancedBilling';

const BillingSettingsPanel: React.FC = () => {
  const { data: settings, isLoading } = useBillingSettings();
  const { updateBillingSettings } = useBillingActions();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  React.useEffect(() => {
    if (settings) {
      const settingsMap: Record<string, any> = {};
      settings.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      setLocalSettings(settingsMap);
    }
  }, [settings]);

  const handleUpdateSetting = (settingKey: string, newValue: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [settingKey]: newValue
    }));
  };

  const handleSaveSettings = () => {
    Object.entries(localSettings).forEach(([key, value]) => {
      updateBillingSettings.mutate({ settingKey: key, settingValue: value });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading billing settings...</span>
      </div>
    );
  }

  const setupFee = localSettings.setup_fee || {};
  const subscriptionFee = localSettings.subscription_fee_per_student || {};
  const currency = localSettings.default_currency || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Billing Settings
          </h2>
          <p className="text-muted-foreground">Configure billing parameters and fee structure</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={updateBillingSettings.isPending}
        >
          {updateBillingSettings.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Currency Code</Label>
              <Input
                value={currency.code || 'KES'}
                onChange={(e) => handleUpdateSetting('default_currency', {
                  ...currency,
                  code: e.target.value
                })}
                placeholder="KES"
              />
            </div>
            <div>
              <Label>Currency Symbol</Label>
              <Input
                value={currency.symbol || 'KSh'}
                onChange={(e) => handleUpdateSetting('default_currency', {
                  ...currency,
                  symbol: e.target.value
                })}
                placeholder="KSh"
              />
            </div>
            <div>
              <Label>Currency Name</Label>
              <Input
                value={currency.name || 'Kenyan Shilling'}
                onChange={(e) => handleUpdateSetting('default_currency', {
                  ...currency,
                  name: e.target.value
                })}
                placeholder="Kenyan Shilling"
              />
            </div>
          </CardContent>
        </Card>

        {/* Setup Fee Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Fee Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Setup Fee</Label>
              <Switch
                checked={setupFee.enabled || false}
                onCheckedChange={(checked) => handleUpdateSetting('setup_fee', {
                  ...setupFee,
                  enabled: checked
                })}
              />
            </div>
            <div>
              <Label>Setup Fee Amount ({currency.code || 'KES'})</Label>
              <Input
                type="number"
                value={setupFee.amount || 5000}
                onChange={(e) => handleUpdateSetting('setup_fee', {
                  ...setupFee,
                  amount: parseFloat(e.target.value) || 0
                })}
                placeholder="5000"
                disabled={!setupFee.enabled}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={setupFee.currency || 'KES'}
                onChange={(e) => handleUpdateSetting('setup_fee', {
                  ...setupFee,
                  currency: e.target.value
                })}
                placeholder="KES"
                disabled={!setupFee.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Fee Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Fee Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Subscription Fee</Label>
              <Switch
                checked={subscriptionFee.enabled || false}
                onCheckedChange={(checked) => handleUpdateSetting('subscription_fee_per_student', {
                  ...subscriptionFee,
                  enabled: checked
                })}
              />
            </div>
            <div>
              <Label>Fee Per Student ({currency.code || 'KES'})</Label>
              <Input
                type="number"
                value={subscriptionFee.amount || 50}
                onChange={(e) => handleUpdateSetting('subscription_fee_per_student', {
                  ...subscriptionFee,
                  amount: parseFloat(e.target.value) || 0
                })}
                placeholder="50"
                disabled={!subscriptionFee.enabled}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={subscriptionFee.currency || 'KES'}
                onChange={(e) => handleUpdateSetting('subscription_fee_per_student', {
                  ...subscriptionFee,
                  currency: e.target.value
                })}
                placeholder="KES"
                disabled={!subscriptionFee.enabled}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Monthly subscription fee is calculated as: Fee per student × Number of active students
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingSettingsPanel;
