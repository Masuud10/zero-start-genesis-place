
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CreditCard, Loader2 } from 'lucide-react';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';

interface MpesaPaymentDialogProps {
  studentFee: {
    id: string;
    amount: number;
    amount_paid: number;
    student?: { name: string; admission_number: string };
  };
  trigger?: React.ReactNode;
}

const MpesaPaymentDialog: React.FC<MpesaPaymentDialogProps> = ({ studentFee, trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(Math.max(0, studentFee.amount - studentFee.amount_paid));

  const { initiateStkPush } = useMpesaTransactions();
  const remainingAmount = studentFee.amount - studentFee.amount_paid;

  const formatPhoneNumber = (value: string) => {
    // Remove any non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as Kenya phone number
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    } else if (!cleaned.startsWith('+254')) {
      return value.startsWith('+') ? value : '+254' + cleaned;
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !amount || amount <= 0) {
      return;
    }

    setLoading(true);

    const result = await initiateStkPush(phoneNumber, amount, studentFee.id);

    if (!result.error) {
      setOpen(false);
      setPhoneNumber('');
      setAmount(remainingAmount);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-2">
            <Smartphone className="h-4 w-4" />
            Pay with M-PESA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            M-PESA Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">{studentFee.student?.name}</div>
            <div className="text-sm text-gray-600">
              Admission: {studentFee.student?.admission_number}
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">Amount Due:</span>
              <Badge variant={remainingAmount > 0 ? 'destructive' : 'secondary'}>
                KES {remainingAmount.toFixed(2)}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">M-PESA Phone Number *</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="+254700000000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the phone number registered with M-PESA
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Payment Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
              {amount > remainingAmount && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ Amount exceeds remaining balance
                </p>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                How it works:
              </h4>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. Click "Initiate Payment" below</li>
                <li>2. Check your phone for M-PESA prompt</li>
                <li>3. Enter your M-PESA PIN to complete</li>
                <li>4. Payment will be recorded automatically</li>
              </ol>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !phoneNumber || !amount}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Initiate Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentDialog;
