
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CreditCard, Banknote, Smartphone, Building } from 'lucide-react';
import { useFeePayments } from '@/hooks/useFeePayments';

interface PaymentDialogProps {
  studentFeeId: string;
  studentName: string;
  feeAmount: number;
  amountPaid: number;
  trigger?: React.ReactNode;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  studentFeeId,
  studentName,
  feeAmount,
  amountPaid,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '' as 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'cheque' | '',
    referenceNumber: '',
    mpesaCode: '',
    bankReference: '',
  });

  const { recordPayment, loading } = useFeePayments();
  const remainingAmount = feeAmount - amountPaid;

  const resetForm = () => {
    setFormData({
      amount: '',
      paymentMethod: '',
      referenceNumber: '',
      mpesaCode: '',
      bankReference: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paymentMethod) {
      return;
    }

    const result = await recordPayment({
      studentFeeId,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber || undefined,
      mpesaCode: formData.mpesaCode || undefined,
      bankReference: formData.bankReference || undefined,
    });

    if (result.data) {
      resetForm();
      setOpen(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      resetForm();
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-4 w-4" />;
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Fee Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{studentName}</p>
            <div className="text-sm text-gray-600 mt-1">
              <p>Total Fee: KES {feeAmount.toLocaleString()}</p>
              <p>Amount Paid: KES {amountPaid.toLocaleString()}</p>
              <p className="font-medium text-orange-600">
                Remaining: KES {remainingAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value: 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'cheque') => 
                  setFormData({ ...formData, paymentMethod: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      M-PESA
                    </div>
                  </SelectItem>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="cheque">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Cheque
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.paymentMethod === 'mpesa' && (
              <div>
                <Label htmlFor="mpesaCode">M-PESA Transaction Code *</Label>
                <Input
                  id="mpesaCode"
                  value={formData.mpesaCode}
                  onChange={(e) => setFormData({ ...formData, mpesaCode: e.target.value })}
                  placeholder="Enter M-PESA code (e.g., QEK4A5M9XV)"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {formData.paymentMethod === 'bank_transfer' && (
              <div>
                <Label htmlFor="bankReference">Bank Reference Number *</Label>
                <Input
                  id="bankReference"
                  value={formData.bankReference}
                  onChange={(e) => setFormData({ ...formData, bankReference: e.target.value })}
                  placeholder="Enter bank reference number"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="Internal reference number"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.paymentMethod}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    {getPaymentIcon(formData.paymentMethod)}
                    <span className="ml-2">Record Payment</span>
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

export default PaymentDialog;
