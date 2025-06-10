
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, DollarSign, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeeCollectionModalProps {
  onClose: () => void;
}

const FeeCollectionModal: React.FC<FeeCollectionModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      admissionNo: 'STU001', 
      class: 'Grade 8A',
      totalFees: 15000,
      paidAmount: 10000,
      balance: 5000,
      lastPayment: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      admissionNo: 'STU002', 
      class: 'Grade 8A',
      totalFees: 15000,
      paidAmount: 15000,
      balance: 0,
      lastPayment: '2024-01-20'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      admissionNo: 'STU003', 
      class: 'Grade 8B',
      totalFees: 15000,
      paidAmount: 8000,
      balance: 7000,
      lastPayment: '2024-01-10'
    },
  ]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const { toast } = useToast();

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handlePayment = () => {
    if (!paymentAmount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedStudent.balance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }

    // Update student payment
    setStudents(prev => prev.map(student => 
      student.id === selectedStudent.id 
        ? { 
            ...student, 
            paidAmount: student.paidAmount + amount,
            balance: student.balance - amount,
            lastPayment: new Date().toISOString().split('T')[0]
          }
        : student
    ));

    toast({
      title: "Payment Recorded",
      description: `Payment of KES ${amount.toLocaleString()} recorded for ${selectedStudent.name}.`,
    });

    setShowPaymentForm(false);
    setSelectedStudent(null);
    setPaymentAmount('');
    setPaymentMethod('');
    setMpesaCode('');
  };

  const openPaymentForm = (student: any) => {
    setSelectedStudent(student);
    setShowPaymentForm(true);
  };

  const getTotalStats = () => {
    const totalFees = students.reduce((sum, s) => sum + s.totalFees, 0);
    const totalPaid = students.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalBalance = students.reduce((sum, s) => sum + s.balance, 0);
    const collectionRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

    return { totalFees, totalPaid, totalBalance, collectionRate };
  };

  const stats = getTotalStats();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Collection Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fees</p>
                    <p className="text-lg font-bold">KES {stats.totalFees.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Collected</p>
                    <p className="text-lg font-bold">KES {stats.totalPaid.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-lg font-bold">KES {stats.totalBalance.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Collection Rate</p>
                    <p className="text-lg font-bold">{stats.collectionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or admission number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="Grade 8A">Grade 8A</SelectItem>
                    <SelectItem value="Grade 8B">Grade 8B</SelectItem>
                    <SelectItem value="Grade 7A">Grade 7A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Students Fee Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.admissionNo} • {student.class}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">
                          Paid: <span className="font-medium">KES {student.paidAmount.toLocaleString()}</span>
                        </p>
                        <p className="text-sm">
                          Balance: <span className={`font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            KES {student.balance.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <Badge variant={student.balance === 0 ? 'default' : 'destructive'}>
                        {student.balance === 0 ? 'Paid' : 'Pending'}
                      </Badge>
                      {student.balance > 0 && (
                        <Button 
                          size="sm" 
                          onClick={() => openPaymentForm(student)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Record Payment
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {showPaymentForm && selectedStudent && (
            <Card>
              <CardHeader>
                <CardTitle>Record Payment for {selectedStudent.name}</CardTitle>
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
                      max={selectedStudent.balance}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Outstanding balance: KES {selectedStudent.balance.toLocaleString()}
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
                  <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePayment}>
                    Record Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeCollectionModal;
