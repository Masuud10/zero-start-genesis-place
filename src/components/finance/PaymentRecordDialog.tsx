
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { useFeePayments } from '@/hooks/useFeePayments';
import { useToast } from '@/hooks/use-toast';

interface PaymentRecordDialogProps {
  studentFee: any;
  onPaymentRecorded?: () => void;
}

const PaymentRecordDialog: React.FC<PaymentRecordDialogProps> = ({
  studentFee,
  onPaymentRecorded
}) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [bankReference, setBankReference] = useState('');
  
  const { recordPayment, loading } = useFeePayments();
  const { toast } = useToast();

  const remainingBalance = studentFee.amount - studentFee.amount_paid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod) {
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

    const paymentData = {
      studentFeeId: studentFee.id,
      amount: paymentAmount,
      paymentMethod: paymentMethod as any,
      referenceNumber: referenceNumber || undefined,
      mpesaCode: paymentMethod === 'mpesa' ? mpesaCode : undefined,
      bankReference: paymentMethod === 'bank_transfer' ? bankReference : undefined,
    };

    const { data, error } = await recordPayment(paymentData);
    
    if (!error && data) {
      setOpen(false);
      setAmount('');
      setPaymentMethod('');
      setReferenceNumber('');
      setMpesaCode('');
      setBankReference('');
      onPaymentRecorded?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CreditCard className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium">{studentFee.student?.name}</h4>
          <p className="text-sm text-gray-600">Outstanding: KES {remainingBalance.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mpesa">M-PESA</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === 'mpesa' && (
            <div>
              <Label htmlFor="mpesaCode">M-PESA Code *</Label>
              <Input
                id="mpesaCode"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value)}
                placeholder="Enter M-PESA transaction code"
                required
              />
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div>
              <Label htmlFor="bankReference">Bank Reference *</Label>
              <Input
                id="bankReference"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="Enter bank reference number"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="referenceNumber">Reference Number</Label>
            <Input
              id="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Optional reference number"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRecordDialog;
