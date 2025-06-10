
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface FeeCollectionModalProps {
  onClose: () => void;
}

const FeeCollectionModal: React.FC<FeeCollectionModalProps> = ({ onClose }) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const mockStudents = [
    { id: '1', name: 'John Doe', class: 'Grade 1A', balance: 15000 },
    { id: '2', name: 'Jane Smith', class: 'Grade 1B', balance: 0 },
    { id: '3', name: 'Mike Johnson', class: 'Grade 2A', balance: 7500 },
  ];

  const mockPayments = [
    { date: '2024-01-15', student: 'John Doe', amount: 10000, method: 'M-PESA', status: 'Confirmed' },
    { date: '2024-01-14', student: 'Jane Smith', amount: 15000, method: 'Bank Transfer', status: 'Confirmed' },
    { date: '2024-01-13', student: 'Mike Johnson', amount: 7500, method: 'Cash', status: 'Pending' },
  ];

  const handleRecordPayment = () => {
    if (!selectedStudent || !paymentAmount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Payment recorded successfully",
    });
    
    setSelectedStudent('');
    setPaymentAmount('');
    setPaymentMethod('');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-PESA</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleRecordPayment} className="w-full">
                Record Payment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outstanding Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockStudents.map((student) => (
                  <div key={student.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
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
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPayments.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.student}</p>
                      <p className="text-sm text-muted-foreground">{payment.date} • {payment.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">KES {payment.amount.toLocaleString()}</p>
                      <Badge variant={payment.status === 'Confirmed' ? "default" : "secondary"}>
                        {payment.status}
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

export default FeeCollectionModal;
