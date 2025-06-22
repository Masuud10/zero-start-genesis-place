
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { useMpesaCredentials } from '@/hooks/fee-management/useMpesaCredentials';
import { useToast } from '@/hooks/use-toast';

const MpesaCredentialsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    paybill_number: ''
  });
  const { credentials, saveCredentials } = useMpesaCredentials();
  const { toast } = useToast();

  React.useEffect(() => {
    if (credentials) {
      setFormData(credentials);
    }
  }, [credentials]);

  const handleSave = async () => {
    const result = await saveCredentials(formData);
    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setOpen(false);
      toast({
        title: "Success",
        description: "M-PESA credentials saved successfully",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configure M-PESA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>M-PESA API Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="consumer_key">Consumer Key</Label>
            <Input
              id="consumer_key"
              value={formData.consumer_key}
              onChange={(e) => setFormData(prev => ({ ...prev, consumer_key: e.target.value }))}
              placeholder="Enter Daraja API Consumer Key"
            />
          </div>
          <div>
            <Label htmlFor="consumer_secret">Consumer Secret</Label>
            <Input
              id="consumer_secret"
              type="password"
              value={formData.consumer_secret}
              onChange={(e) => setFormData(prev => ({ ...prev, consumer_secret: e.target.value }))}
              placeholder="Enter Daraja API Consumer Secret"
            />
          </div>
          <div>
            <Label htmlFor="passkey">Passkey</Label>
            <Input
              id="passkey"
              type="password"
              value={formData.passkey}
              onChange={(e) => setFormData(prev => ({ ...prev, passkey: e.target.value }))}
              placeholder="Enter Lipa Na M-PESA Passkey"
            />
          </div>
          <div>
            <Label htmlFor="paybill_number">Paybill Number</Label>
            <Input
              id="paybill_number"
              value={formData.paybill_number}
              onChange={(e) => setFormData(prev => ({ ...prev, paybill_number: e.target.value }))}
              placeholder="Enter Paybill Number"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaCredentialsDialog;
