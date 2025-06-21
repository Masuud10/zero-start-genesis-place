
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFeeManagement } from '@/hooks/useFeeManagement';
import { Loader2, Plus, Search, DollarSign, Users, CreditCard } from 'lucide-react';

const FeeManagementPanel: React.FC = () => {
  const {
    fees,
    mpesaTransactions,
    classSummaries,
    classes,
    students,
    loading,
    assignFeeToClass,
    assignFeeToStudent,
    recordPayment
  } = useFeeManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  const [feeForm, setFeeForm] = useState({
    type: 'class',
    class_id: '',
    student_id: '',
    amount: '',
    due_date: '',
    academic_year: '2024',
    term: 'Term 1',
    category: 'tuition'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'mpesa',
    mpesa_code: '',
    reference_number: ''
  });

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.student?.admission_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || fee.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  const filteredTransactions = mpesaTransactions.filter(transaction => {
    const matchesSearch = transaction.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAssignFee = async () => {
    if (feeForm.type === 'class') {
      await assignFeeToClass(feeForm.class_id, {
        amount: parseFloat(feeForm.amount),
        due_date: feeForm.due_date,
        academic_year: feeForm.academic_year,
        term: feeForm.term,
        category: feeForm.category
      });
    } else {
      await assignFeeToStudent(feeForm.student_id, {
        amount: parseFloat(feeForm.amount),
        due_date: feeForm.due_date,
        academic_year: feeForm.academic_year,
        term: feeForm.term,
        category: feeForm.category
      });
    }
    setIsAssignDialogOpen(false);
    setFeeForm({
      type: 'class',
      class_id: '',
      student_id: '',
      amount: '',
      due_date: '',
      academic_year: '2024',
      term: 'Term 1',
      category: 'tuition'
    });
  };

  const handleRecordPayment = async () => {
    if (!selectedFee) return;

    await recordPayment(selectedFee.id, {
      amount: parseFloat(paymentForm.amount),
      payment_method: paymentForm.payment_method,
      mpesa_code: paymentForm.mpesa_code,
      reference_number: paymentForm.reference_number
    });

    setIsPaymentDialogOpen(false);
    setPaymentForm({
      amount: '',
      payment_method: 'mpesa',
      mpesa_code: '',
      reference_number: ''
    });
    setSelectedFee(null);
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading fee management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Fee Management
          </h1>
          <p className="text-muted-foreground">Manage fee assignments, track payments, and monitor balances</p>
        </div>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Fee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Fee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Assignment Type</Label>
                <Select value={feeForm.type} onValueChange={(value) => setFeeForm({...feeForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">Entire Class</SelectItem>
                    <SelectItem value="student">Individual Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {feeForm.type === 'class' ? (
                <div>
                  <Label>Class</Label>
                  <Select value={feeForm.class_id} onValueChange={(value) => setFeeForm({...feeForm, class_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label>Student</Label>
                  <Select value={feeForm.student_id} onValueChange={(value) => setFeeForm({...feeForm, student_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.admission_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (KES)</Label>
                  <Input
                    type="number"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={feeForm.due_date}
                    onChange={(e) => setFeeForm({...feeForm, due_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Academic Year</Label>
                  <Select value={feeForm.academic_year} onValueChange={(value) => setFeeForm({...feeForm, academic_year: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Term</Label>
                  <Select value={feeForm.term} onValueChange={(value) => setFeeForm({...feeForm, term: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Term 1">Term 1</SelectItem>
                      <SelectItem value="Term 2">Term 2</SelectItem>
                      <SelectItem value="Term 3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={feeForm.category} onValueChange={(value) => setFeeForm({...feeForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="activities">Activities</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAssignFee} className="w-full">
                Assign Fee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classSummaries.map(summary => (
          <Card key={summary.class_id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{summary.class_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Fees:</span>
                  <span className="font-medium">{formatCurrency(summary.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Paid:</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.paid_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <span className="font-medium text-red-600">{formatCurrency(summary.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Students:</span>
                  <span className="font-medium">{summary.student_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fees">Fee Records</TabsTrigger>
          <TabsTrigger value="mpesa">MPESA Transactions</TabsTrigger>
        </TabsList>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student</th>
                      <th className="text-left p-2">Class</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-right p-2">Paid</th>
                      <th className="text-right p-2">Balance</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Due Date</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFees.map(fee => (
                      <tr key={fee.id} className="border-b">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{fee.student?.name}</div>
                            <div className="text-sm text-muted-foreground">{fee.student?.admission_number}</div>
                          </div>
                        </td>
                        <td className="p-2">{fee.class?.name}</td>
                        <td className="p-2 text-right">{formatCurrency(fee.amount)}</td>
                        <td className="p-2 text-right text-green-600">{formatCurrency(fee.paid_amount || 0)}</td>
                        <td className="p-2 text-right text-red-600">{formatCurrency(fee.amount - (fee.paid_amount || 0))}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                            fee.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="p-2">{new Date(fee.due_date).toLocaleDateString()}</td>
                        <td className="p-2 text-center">
                          {fee.status !== 'paid' && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedFee(fee);
                                setPaymentForm({...paymentForm, amount: (fee.amount - (fee.paid_amount || 0)).toString()});
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              Record Payment
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mpesa">
          <Card>
            <CardHeader>
              <CardTitle>MPESA Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student</th>
                      <th className="text-left p-2">MPESA Code</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction.id} className="border-b">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{transaction.student?.name}</div>
                            <div className="text-sm text-muted-foreground">{transaction.student?.admission_number}</div>
                          </div>
                        </td>
                        <td className="p-2 font-mono">{transaction.mpesa_receipt_number}</td>
                        <td className="p-2">{transaction.phone_number}</td>
                        <td className="p-2 text-right">{formatCurrency(transaction.amount_paid)}</td>
                        <td className="p-2">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.transaction_status === 'Success' ? 'bg-green-100 text-green-800' :
                            transaction.transaction_status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.transaction_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Student:</strong> {selectedFee.student?.name}</p>
                <p><strong>Outstanding Amount:</strong> {formatCurrency(selectedFee.amount - (selectedFee.paid_amount || 0))}</p>
              </div>

              <div>
                <Label>Payment Amount (KES)</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={paymentForm.payment_method} onValueChange={(value) => setPaymentForm({...paymentForm, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">MPESA</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentForm.payment_method === 'mpesa' && (
                <div>
                  <Label>MPESA Code</Label>
                  <Input
                    value={paymentForm.mpesa_code}
                    onChange={(e) => setPaymentForm({...paymentForm, mpesa_code: e.target.value})}
                    placeholder="Enter MPESA transaction code"
                  />
                </div>
              )}

              <div>
                <Label>Reference Number (Optional)</Label>
                <Input
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({...paymentForm, reference_number: e.target.value})}
                  placeholder="Enter reference number"
                />
              </div>

              <Button onClick={handleRecor} className="w-full">
                Record Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeManagementPanel;
