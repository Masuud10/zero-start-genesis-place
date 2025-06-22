
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MpesaPaymentDialogProps {
  studentFee: any;
  onPaymentProcessed?: () => void;
}

const MpesaPaymentDialog: React.FC<MpesaPaymentDialogProps> = ({
  studentFee,
  onPaymentProcessed
}) => {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const remainingBalance = studentFee.amount - studentFee.amount_paid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0 || paymentAmount > remainingBalance) {
      toast({
        title: "Error",
        description: `Payment amount must be between 1 and ${remainingBalance}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone_number: phoneNumber,
          amount: paymentAmount,
          student_fee_id: studentFee.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "STK Push Sent",
          description: "Please check your phone and enter your M-PESA PIN",
        });
        setOpen(false);
        setPhoneNumber('');
        setAmount('');
        onPaymentProcessed?.();
      } else {
        throw new Error(data.error || 'Failed to initiate M-PESA payment');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate M-PESA payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600">
          <Smartphone className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            M-PESA Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium">{studentFee.student?.name}</h4>
          <p className="text-sm text-gray-600">Outstanding: KES {remainingBalance.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., 0712345678"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the M-PESA registered phone number
            </p>
          </div>

          <div>
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              max={remainingBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="text-blue-800">
              <strong>How it works:</strong>
            </p>
            <ul className="list-disc list-inside text-blue-700 mt-1 space-y-1">
              <li>You'll receive an STK push on your phone</li>
              <li>Enter your M-PESA PIN to complete payment</li>
              <li>Payment will be processed automatically</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Processing...' : 'Send STK Push'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentDialog;
