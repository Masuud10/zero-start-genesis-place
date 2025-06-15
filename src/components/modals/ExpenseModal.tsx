
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Receipt, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExpenseModalProps {
  onClose: () => void;
  onExpenseAdded: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ onClose, onExpenseAdded }) => {
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
    if (!expenseData.category || !expenseData.amount || !user?.school_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in category and amount.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(expenseData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive expense amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const description = `${expenseData.title || 'Untitled Expense'}${expenseData.vendor ? ` (Vendor: ${expenseData.vendor})` : ''}${expenseData.description ? ` - ${expenseData.description}` : ''}`;

      const { error } = await supabase
        .from('expenses')
        .insert({
          school_id: user.school_id,
          category: expenseData.category,
          amount: amount,
          date: expenseData.date,
          description: description,
          approved_by: user.id,
          receipt_url: expenseData.receiptNumber || null,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Expense Recorded",
        description: `Expense of KES ${amount.toLocaleString()} has been recorded successfully.`,
      });

      onExpenseAdded();
    } catch (error: any) {
      console.error('Error recording expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record expense. Please try again.",
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
                  <Label htmlFor="title">Expense Title</Label>
                  <Input
                    value={expenseData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Office Stationery"
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
                  <Label htmlFor="receiptNumber">Receipt Number/URL</Label>
                  <Input
                    value={expenseData.receiptNumber}
                    onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                    placeholder="Enter receipt number or URL"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={expenseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter any additional details"
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
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
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
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSaveExpense} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {loading ? 'Recording...' : 'Record Expense'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;

