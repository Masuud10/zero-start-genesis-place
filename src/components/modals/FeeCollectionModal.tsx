import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeeCollectionModalProps {
  onClose: () => void;
}

const FeeCollectionModal = ({ onClose }: FeeCollectionModalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const mockStudents = [
    { 
      id: 1, 
      name: 'John Doe', 
      admNo: 'ADM001', 
      class: 'Grade 1A',
      feeBalance: 15000,
      totalFee: 25000,
      paidAmount: 10000
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      admNo: 'ADM002', 
      class: 'Grade 1A',
      feeBalance: 0,
      totalFee: 25000,
      paidAmount: 25000
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      admNo: 'ADM003', 
      class: 'Grade 1A',
      feeBalance: 25000,
      totalFee: 25000,
      paidAmount: 0
    },
  ];

  const mockTransactions = [
    {
      id: 'TXN001',
      student: 'John Doe',
      amount: 5000,
      method: 'M-PESA',
      reference: 'MPX123456789',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 'TXN002',
      student: 'Jane Smith',
      amount: 25000,
      method: 'Bank Transfer',
      reference: 'BNK987654321',
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: 'TXN003',
      student: 'Sarah Wilson',
      amount: 10000,
      method: 'M-PESA',
      reference: 'MPX555666777',
      date: '2024-01-13',
      status: 'pending'
    },
  ];

  const handleRecordPayment = () => {
    console.log('Recording payment:', { amount, paymentMethod, phoneNumber });
    onClose();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getBalanceStatus = (balance: number) => {
    if (balance === 0) return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    if (balance > 0) return <Badge variant="destructive">Outstanding</Badge>;
    return <Badge variant="outline">Overpaid</Badge>;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Fee Collection Management</DialogTitle>
          <DialogDescription>
            Manage student fee payments, M-PESA integration, and payment tracking
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="collect" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collect">Collect Payment</TabsTrigger>
            <TabsTrigger value="students">Student Fees</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="collect" className="space-y-4">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Record New Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Student</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name} ({student.admNo}) - Balance: KES {student.feeBalance.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (KES)</label>
                    <Input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  {paymentMethod === 'mpesa' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="254XXXXXXXXX"
                      />
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleRecordPayment}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!amount}
                >
                  {paymentMethod === 'mpesa' ? 'Initiate M-PESA Payment' : 'Record Payment'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Filter by Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-classes">All Classes</SelectItem>
                    <SelectItem value="grade-1a">Grade 1A</SelectItem>
                    <SelectItem value="grade-1b">Grade 1B</SelectItem>
                    <SelectItem value="grade-2a">Grade 2A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {mockStudents.map((student) => (
                <Card key={student.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.admNo} • {student.class}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Fee</p>
                          <p className="font-medium">KES {student.totalFee.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Paid</p>
                          <p className="font-medium text-green-600">KES {student.paidAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Balance</p>
                          <p className="font-medium text-red-600">KES {student.feeBalance.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-center">
                          {getBalanceStatus(student.feeBalance)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-3">
              {mockTransactions.map((transaction) => (
                <Card key={transaction.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{transaction.student}</h4>
                        <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{transaction.id}</span>
                          <span>•</span>
                          <span>{transaction.method}</span>
                          <span>•</span>
                          <span>{transaction.reference}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-medium">KES {transaction.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-medium">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-center">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeCollectionModal;
