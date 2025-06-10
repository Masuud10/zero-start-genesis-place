
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, CreditCard, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MpesaPaymentModalProps {
  onClose: () => void;
}

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({ onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const { toast } = useToast();

  const handleInitiatePayment = async () => {
    if (!phoneNumber || !amount || !studentId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Simulate M-PESA STK push
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success (in real implementation, this would be handled by webhook)
      setPaymentStatus('success');
      
      toast({
        title: "Payment Initiated",
        description: "M-PESA STK push sent to your phone. Please complete the payment.",
      });

      // Simulate payment completion
      setTimeout(() => {
        toast({
          title: "Payment Successful",
          description: `Payment of KES ${amount} has been processed successfully.`,
        });
      }, 2000);

    } catch (error) {
      setPaymentStatus('failed');
      toast({
        title: "Payment Failed",
        description: "Failed to initiate M-PESA payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove any non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as Kenya phone number
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('+254')) {
      return cleaned;
    }
    return value;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            M-PESA Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentId">Student Admission Number</Label>
                <Input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter admission number"
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="phone">M-PESA Phone Number</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  placeholder="+254700000000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the phone number registered with M-PESA
                </p>
              </div>
            </CardContent>
          </Card>

          {paymentStatus === 'processing' && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-medium">Processing Payment...</p>
                <p className="text-sm text-muted-foreground">Please check your phone for M-PESA prompt</p>
              </CardContent>
            </Card>
          )}

          {paymentStatus === 'success' && (
            <Card>
              <CardContent className="p-6 text-center">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <p className="font-medium text-green-600">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Transaction has been processed</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">How M-PESA Payment Works:</h4>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. Enter payment details above</li>
                <li>2. Click "Pay with M-PESA" button</li>
                <li>3. Check your phone for M-PESA prompt</li>
                <li>4. Enter your M-PESA PIN to complete</li>
                <li>5. Payment will be automatically recorded</li>
              </ol>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleInitiatePayment} 
              disabled={isProcessing || paymentStatus === 'success'}
              className="bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Pay with M-PESA'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentModal;
