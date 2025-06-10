
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Save, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseModalProps {
  onClose: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ onClose }) => {
  const [expenseData, setExpenseData] = useState({
    title: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    vendor: '',
    receiptNumber: ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveExpense = () => {
    if (!expenseData.title || !expenseData.category || !expenseData.amount) {
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

    // Simulate saving expense
    toast({
      title: "Expense Recorded",
      description: `Expense of KES ${amount.toLocaleString()} has been recorded successfully.`,
    });

    onClose();
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
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload receipt or supporting documents
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </Label>
                {attachment && (
                  <p className="text-sm text-green-600 mt-2">
                    File uploaded: {attachment.name}
                  </p>
                )}
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
            <Button onClick={handleSaveExpense}>
              <Save className="w-4 h-4 mr-2" />
              Record Expense
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;
