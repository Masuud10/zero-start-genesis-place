
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import { useToast } from '@/hooks/use-toast';

interface ParentMpesaPaymentProps {
  studentFee: {
    id: string;
    amount: number;
    amount_paid: number;
    student?: { name: string; admission_number: string };
    category?: string;
    term?: string;
  };
}

const ParentMpesaPayment: React.FC<ParentMpesaPaymentProps> = ({ studentFee }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(Math.max(0, studentFee.amount - studentFee.amount_paid));
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  
  const { processSTKPush, transactions } = useMpesaTransactions();
  const { toast } = useToast();

  const remainingAmount = studentFee.amount - studentFee.amount_paid;

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    } else if (!cleaned.startsWith('+254')) {
      return value.startsWith('+') ? value : '+254' + cleaned;
    }
    return value;
  };

  const handlePayment = async () => {
    if (!phoneNumber || !paymentAmount || paymentAmount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid phone number and amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const result = await processSTKPush(phoneNumber, paymentAmount, studentFee.id);

      if (result.error) {
        setPaymentStatus('failed');
        toast({
          title: "Payment Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setPaymentStatus('success');
        toast({
          title: "Payment Initiated",
          description: "STK push sent to your phone. Please complete the payment.",
        });
        
        // Reset after 30 seconds
        setTimeout(() => {
          setPaymentStatus('idle');
        }, 30000);
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Smartphone className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing payment...';
      case 'success':
        return 'Payment initiated successfully';
      case 'failed':
        return 'Payment failed';
      default:
        return 'Ready to pay';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Pay with M-PESA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Student Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="font-medium">{studentFee.student?.name}</div>
          <div className="text-sm text-gray-600">
            Admission: {studentFee.student?.admission_number}
          </div>
          <div className="text-sm text-gray-600">
            {studentFee.category} - {studentFee.term}
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm">Amount Due:</span>
            <Badge variant={remainingAmount > 0 ? 'destructive' : 'secondary'}>
              KES {remainingAmount.toFixed(2)}
            </Badge>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">M-PESA Phone Number</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              placeholder="+254700000000"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="amount">Payment Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              max={remainingAmount}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              disabled={loading}
            />
            {paymentAmount > remainingAmount && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Amount exceeds remaining balance
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          {getStatusIcon()}
          <span className="text-sm">{getStatusText()}</span>
        </div>

        {/* Payment Instructions */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">How M-PESA Payment Works:</h4>
          <ol className="text-sm text-green-700 space-y-1">
            <li>1. Click "Pay with M-PESA" button below</li>
            <li>2. Check your phone for M-PESA prompt</li>
            <li>3. Enter your M-PESA PIN to complete</li>
            <li>4. Payment will be recorded automatically</li>
          </ol>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment}
          disabled={loading || !phoneNumber || !paymentAmount || paymentAmount <= 0}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4 mr-2" />
              Pay KES {paymentAmount.toFixed(2)} with M-PESA
            </>
          )}
        </Button>

        {/* Recent Transactions */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Recent M-PESA Transactions</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center text-sm">
                <span>{transaction.mpesa_receipt_number}</span>
                <div className="flex items-center gap-2">
                  <span>KES {transaction.amount_paid}</span>
                  <Badge variant={transaction.transaction_status === 'Success' ? 'default' : 'destructive'}>
                    {transaction.transaction_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentMpesaPayment;
