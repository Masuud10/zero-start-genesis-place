
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Receipt, DollarSign } from 'lucide-react';
import { useStudentFees } from '@/hooks/useStudentFees';

interface PaymentRecordDialogProps {
  studentFee: {
    id: string;
    amount: number;
    amount_paid: number;
    status: string;
    student?: { name: string; admission_number: string };
  };
}

interface PaymentFormData {
  amount: number;
  payment_method: string;
  reference_number: string;
  mpesa_code: string;
  bank_reference: string;
  notes: string;
}

const PaymentRecordDialog: React.FC<PaymentRecordDialogProps> = ({ studentFee }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: Math.max(0, studentFee.amount - studentFee.amount_paid),
    payment_method: 'cash',
    reference_number: '',
    mpesa_code: '',
    bank_reference: '',
    notes: '',
  });

  const { recordPayment } = useStudentFees();

  const remainingAmount = studentFee.amount - studentFee.amount_paid;
  const isOverpayment = formData.amount > remainingAmount;

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'mpesa', label: 'M-Pesa', icon: CreditCard },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Receipt },
    { value: 'card', label: 'Card Payment', icon: CreditCard },
    { value: 'cheque', label: 'Cheque', icon: Receipt },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      return;
    }

    if (formData.payment_method === 'mpesa' && !formData.mpesa_code) {
      return;
    }

    if (formData.payment_method === 'bank_transfer' && !formData.bank_reference) {
      return;
    }

    setLoading(true);

    const result = await recordPayment(studentFee.id, {
      amount: formData.amount,
      payment_method: formData.payment_method,
      reference_number: formData.reference_number || undefined,
      mpesa_code: formData.mpesa_code || undefined,
      bank_reference: formData.bank_reference || undefined,
    });

    setLoading(false);

    if (!result.error) {
      setOpen(false);
      setFormData({
        amount: 0,
        payment_method: 'cash',
        reference_number: '',
        mpesa_code: '',
        bank_reference: '',
        notes: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant={studentFee.status === 'paid' ? 'outline' : 'default'}
          disabled={studentFee.status === 'paid'}
        >
          <Receipt className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Record Payment
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
            {/* Payment Amount */}
            <div>
              <Label htmlFor="amount">Payment Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
              {isOverpayment && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ Amount exceeds remaining balance (Overpayment: KES {(formData.amount - remainingAmount).toFixed(2)})
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* M-Pesa Code */}
            {formData.payment_method === 'mpesa' && (
              <div>
                <Label htmlFor="mpesa_code">M-Pesa Transaction Code *</Label>
                <Input
                  id="mpesa_code"
                  value={formData.mpesa_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, mpesa_code: e.target.value }))}
                  placeholder="e.g., QA12B3C4D5"
                  required
                />
              </div>
            )}

            {/* Bank Reference */}
            {formData.payment_method === 'bank_transfer' && (
              <div>
                <Label htmlFor="bank_reference">Bank Reference Number *</Label>
                <Input
                  id="bank_reference"
                  value={formData.bank_reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_reference: e.target.value }))}
                  placeholder="Bank transaction reference"
                  required
                />
              </div>
            )}

            {/* General Reference */}
            <div>
              <Label htmlFor="reference_number">Reference Number (Optional)</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                placeholder="Internal reference"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional payment notes..."
                rows={2}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRecordDialog;
