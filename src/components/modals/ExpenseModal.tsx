
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExpenseModalProps {
  onClose: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [expenseData, setExpenseData] = useState({
    title: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    vendor: '',
    receiptNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const expenseCategories = [
    'Salaries & Wages',
    'Utilities',
    'Maintenance',
    'Supplies & Materials',
    'Transportation',
    'Insurance',
    'Professional Services',
    'Marketing',
    'Food & Catering',
    'Equipment',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setExpenseData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveExpense = async () => {
    if (!expenseData.title || !expenseData.category || !expenseData.amount || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(expenseData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Record the expense in financial_transactions
      const { error } = await supabase
        .from('financial_transactions')
        .insert({
          transaction_type: 'expense',
          amount: amount,
          description: `${expenseData.title} - ${expenseData.description}`,
          payment_method: 'cash', // Default payment method
          reference_number: expenseData.receiptNumber || null,
          processed_by: user.id,
          school_id: user.school_id,
          term: 'term1', // You might want to make this dynamic
          academic_year: new Date().getFullYear().toString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Expense Recorded",
        description: `Expense of KES ${amount.toLocaleString()} has been recorded successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Error recording expense:', error);
      toast({
        title: "Error",
        description: "Failed to record expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Record Expense
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Expense Title *</Label>
                  <Input
                    value={expenseData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter expense title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={expenseData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input
                    type="number"
                    value={expenseData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    type="date"
                    value={expenseData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor/Supplier</Label>
                  <Input
                    value={expenseData.vendor}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <Label htmlFor="receiptNumber">Receipt Number</Label>
                  <Input
                    value={expenseData.receiptNumber}
                    onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                    placeholder="Enter receipt number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={expenseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter expense description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <span className="ml-2 font-medium">{expenseData.title || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 font-medium">{expenseData.category || 'Not selected'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-medium">
                      KES {expenseData.amount ? parseFloat(expenseData.amount).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2 font-medium">{expenseData.date}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveExpense} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Recording...' : 'Record Expense'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;
