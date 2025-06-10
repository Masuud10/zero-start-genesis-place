
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Smartphone, Shield, CheckCircle } from 'lucide-react';

interface MpesaPaymentModalProps {
  onClose: () => void;
}

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({ onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mockStudents = [
    { id: 'STU001', name: 'John Doe', class: 'Grade 1A', balance: 15000 },
    { id: 'STU002', name: 'Jane Smith', class: 'Grade 1B', balance: 0 },
    { id: 'STU003', name: 'Mike Johnson', class: 'Grade 2A', balance: 7500 },
  ];

  const mockTransactions = [
    { 
      id: 'MPX123456789', 
      phone: '254712345678', 
      amount: 10000, 
      student: 'John Doe', 
      time: '2024-01-15 14:30', 
      status: 'completed' 
    },
    { 
      id: 'MPX987654321', 
      phone: '254723456789', 
      amount: 15000, 
      student: 'Jane Smith', 
      time: '2024-01-15 12:15', 
      status: 'completed' 
    },
  ];

  const handleInitiatePayment = async () => {
    if (!phoneNumber || !amount || !studentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!/^254\d{9}$/.test(phoneNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number (254XXXXXXXXX)",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate M-PESA API call
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Payment Initiated",
        description: `STK push sent to ${phoneNumber}. Please complete the payment on your phone.`,
      });
      
      // Simulate successful payment after another delay
      setTimeout(() => {
        toast({
          title: "Payment Successful!",
          description: `KES ${amount} received from ${phoneNumber}`,
        });
        setIsProcessing(false);
        setPhoneNumber('');
        setAmount('');
        setStudentId('');
      }, 5000);
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to initiate M-PESA payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            M-PESA Payment Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Initiate M-PESA Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  >
                    <option value="">Select Student</option>
                    {mockStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.class})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How M-PESA Payment Works:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Enter student details, phone number, and amount</li>
                  <li>2. Click "Send M-PESA Request" to initiate STK push</li>
                  <li>3. Parent receives M-PESA prompt on their phone</li>
                  <li>4. Parent enters M-PESA PIN to complete payment</li>
                  <li>5. Payment is automatically recorded and linked to student</li>
                </ol>
              </div>

              <Button 
                onClick={handleInitiatePayment} 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  'Send M-PESA Request'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outstanding Student Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockStudents.map((student) => (
                  <div key={student.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class} • ID: {student.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">KES {student.balance.toLocaleString()}</p>
                      <Badge variant={student.balance > 0 ? "destructive" : "default"}>
                        {student.balance > 0 ? "Outstanding" : "Paid"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recent M-PESA Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.student}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.phone} • {transaction.time}
                      </p>
                      <p className="text-xs text-muted-foreground">Ref: {transaction.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">+KES {transaction.amount.toLocaleString()}</p>
                      <Badge variant="default">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentModal;
