
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Shield, Key } from 'lucide-react';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';

const MpesaCredentialsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    paybill_number: '',
  });

  const { credentials, saveCredentials, fetchCredentials } = useMpesaTransactions();

  useEffect(() => {
    if (credentials) {
      setFormData({
        consumer_key: credentials.consumer_key,
        consumer_secret: credentials.consumer_secret,
        passkey: credentials.passkey,
        paybill_number: credentials.paybill_number,
      });
    }
  }, [credentials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // saveCredentials automatically includes school_id from the hook
    const result = await saveCredentials(formData);

    if (!result.error) {
      setOpen(false);
      fetchCredentials();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          MPESA Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            MPESA API Configuration
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="consumer_key">Consumer Key *</Label>
            <Input
              id="consumer_key"
              value={formData.consumer_key}
              onChange={(e) => setFormData(prev => ({ ...prev, consumer_key: e.target.value }))}
              placeholder="Enter Daraja API Consumer Key"
              required
            />
          </div>

          <div>
            <Label htmlFor="consumer_secret">Consumer Secret *</Label>
            <Input
              id="consumer_secret"
              type="password"
              value={formData.consumer_secret}
              onChange={(e) => setFormData(prev => ({ ...prev, consumer_secret: e.target.value }))}
              placeholder="Enter Daraja API Consumer Secret"
              required
            />
          </div>

          <div>
            <Label htmlFor="passkey">Passkey *</Label>
            <Input
              id="passkey"
              type="password"
              value={formData.passkey}
              onChange={(e) => setFormData(prev => ({ ...prev, passkey: e.target.value }))}
              placeholder="Enter STK Push Passkey"
              required
            />
          </div>

          <div>
            <Label htmlFor="paybill_number">Paybill Number *</Label>
            <Input
              id="paybill_number"
              value={formData.paybill_number}
              onChange={(e) => setFormData(prev => ({ ...prev, paybill_number: e.target.value }))}
              placeholder="Enter Business Shortcode/Paybill"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Key className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Security Notice</p>
                <p className="text-xs mt-1">
                  These credentials are encrypted and stored securely. Only authorized finance officers can access them.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaCredentialsDialog;
