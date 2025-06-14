
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeeStudent {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  totalFees: number;
  paidAmount: number;
  balance: number;
  lastPayment: string;
}

interface PaymentFormProps {
  student: FeeStudent;
  paymentAmount: string;
  setPaymentAmount: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  mpesaCode: string;
  setMpesaCode: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  student,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  mpesaCode,
  setMpesaCode,
  onSubmit,
  onCancel
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment for {student.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Payment Amount (KES)</Label>
            <Input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
              max={student.balance}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding balance: KES {student.balance.toLocaleString()}
            </p>
          </div>
          <div>
            <Label htmlFor="method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mpesa">M-PESA</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {paymentMethod === 'mpesa' && (
          <div>
            <Label htmlFor="mpesa">M-PESA Transaction Code</Label>
            <Input
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value)}
              placeholder="Enter M-PESA code"
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Record Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
