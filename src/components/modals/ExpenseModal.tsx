
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface ExpenseModalProps {
  onClose: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ onClose }) => {
  const [expenseType, setExpenseType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('pending');

  const expenseCategories = [
    'Salaries & Benefits',
    'Utilities',
    'Supplies & Materials',
    'Maintenance & Repairs',
    'Transportation',
    'Marketing',
    'Professional Services',
    'Insurance',
    'Other'
  ];

  const mockExpenses = [
    { id: 1, type: 'Utilities', amount: 35000, date: '2024-01-15', description: 'Electricity bill for January', status: 'approved' },
    { id: 2, type: 'Supplies', amount: 15000, date: '2024-01-14', description: 'Classroom supplies and stationery', status: 'pending' },
    { id: 3, type: 'Maintenance', amount: 25000, date: '2024-01-13', description: 'Plumbing repairs in Block A', status: 'approved' },
  ];

  const handleSubmitExpense = () => {
    if (!expenseType || !amount || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Expense recorded successfully and pending approval",
    });
    
    setExpenseType('');
    setAmount('');
    setDescription('');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Expense Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expenseType">Expense Category</Label>
                  <Select value={expenseType} onValueChange={setExpenseType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the expense purpose"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmitExpense} className="w-full">
                Submit for Approval
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockExpenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{expense.type}</p>
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{expense.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-red-600">-KES {expense.amount.toLocaleString()}</p>
                      <Badge variant={expense.status === 'approved' ? "default" : "secondary"}>
                        {expense.status}
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

export default ExpenseModal;
