
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, School, Users } from 'lucide-react';
import { useAllSchools, useBillingActions } from '@/hooks/useBillingManagement';
import { BillingManagementService } from '@/services/billing/billingManagementService';
import { useToast } from '@/hooks/use-toast';

interface CreateBillingRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBillingRecordModal: React.FC<CreateBillingRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [billingType, setBillingType] = useState<'setup_fee' | 'subscription_fee'>('setup_fee');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data: schools, isLoading: schoolsLoading } = useAllSchools();
  const { toast } = useToast();

  // Set default values when modal opens or billing type changes
  React.useEffect(() => {
    if (isOpen) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate.toISOString().split('T')[0]);
      
      if (billingType === 'setup_fee') {
        setAmount('5000');
        setDescription('One-time setup fee for school onboarding');
      } else {
        setAmount('');
        setDescription('Monthly subscription fee based on student count');
      }
    }
  }, [isOpen, billingType]);

  // Calculate subscription fee when school changes
  React.useEffect(() => {
    if (selectedSchoolId && billingType === 'subscription_fee') {
      calculateSubscriptionFee();
    }
  }, [selectedSchoolId, billingType]);

  const calculateSubscriptionFee = async () => {
    if (!selectedSchoolId) return;

    setIsCalculating(true);
    try {
      const result = await BillingManagementService.calculateSubscriptionFee(selectedSchoolId);
      if (result.data) {
        setStudentCount(result.data.student_count || 0);
        const calculatedAmount = (result.data.student_count || 0) * 50; // 50 KES per student
        setAmount(calculatedAmount.toString());
        
        const school = schools?.find(s => s.id === selectedSchoolId);
        if (school) {
          setDescription(`Monthly subscription fee for ${school.name} - ${result.data.student_count} students @ KES 50 per student`);
        }
      }
    } catch (error) {
      console.error('Error calculating subscription fee:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate subscription fee. Please enter amount manually.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedSchoolId) {
      toast({
        title: "Validation Error",
        description: "Please select a school.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (!dueDate) {
      toast({
        title: "Validation Error",
        description: "Please set a due date.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a description.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate billing records
    if (billingType === 'setup_fee') {
      try {
        const existingRecords = await BillingManagementService.getSchoolBillingRecords(selectedSchoolId);
        if (existingRecords.data && existingRecords.data.some(record => record.billing_type === 'setup_fee')) {
          toast({
            title: "Duplicate Record",
            description: "A setup fee record already exists for this school.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error('Error checking existing records:', error);
      }
    }

    setIsSubmitting(true);
    try {
      const result = await BillingManagementService.createManualFeeRecord({
        school_id: selectedSchoolId,
        billing_type: billingType,
        amount: parseFloat(amount),
        description: description.trim(),
        due_date: dueDate
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Billing record created successfully.",
        });
        onSuccess();
        resetForm();
      } else {
        throw new Error(result.error || 'Failed to create billing record');
      }
    } catch (error: any) {
      console.error('Error creating billing record:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create billing record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedSchoolId('');
    setBillingType('setup_fee');
    setAmount('');
    setDescription('');
    setDueDate('');
    setStudentCount(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedSchool = schools?.find(school => school.id === selectedSchoolId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Create Billing Record
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* School Selection */}
          <div className="space-y-2">
            <Label htmlFor="school" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Select School *
            </Label>
            <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a school" />
              </SelectTrigger>
              <SelectContent>
                {schoolsLoading ? (
                  <SelectItem value="" disabled>Loading schools...</SelectItem>
                ) : (
                  schools?.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Billing Type */}
          <div className="space-y-2">
            <Label htmlFor="billingType">Billing Type *</Label>
            <Select value={billingType} onValueChange={(value: 'setup_fee' | 'subscription_fee') => setBillingType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="setup_fee">Setup Fee (One-time)</SelectItem>
                <SelectItem value="subscription_fee">Subscription Fee (Monthly)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Calculation Card */}
          {billingType === 'subscription_fee' && selectedSchoolId && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calculator className="h-4 w-4" />
                  Subscription Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Student Count:
                  </span>
                  <span className="font-medium">
                    {isCalculating ? 'Calculating...' : studentCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rate per Student:</span>
                  <span className="font-medium">KES 50</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">
                    KES {(studentCount * 50).toLocaleString('en-KE')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={billingType === 'subscription_fee' && isCalculating}
            />
            {billingType === 'setup_fee' && (
              <p className="text-xs text-muted-foreground">
                Standard setup fee is KES 5,000
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter billing description..."
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedSchool && amount && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-800">Billing Record Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div><strong>School:</strong> {selectedSchool.name}</div>
                <div><strong>Type:</strong> {billingType === 'setup_fee' ? 'Setup Fee (One-time)' : 'Subscription Fee (Monthly)'}</div>
                <div><strong>Amount:</strong> KES {parseFloat(amount || '0').toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
                <div><strong>Due Date:</strong> {dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}</div>
                {billingType === 'subscription_fee' && (
                  <div><strong>Students:</strong> {studentCount}</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedSchoolId || !amount || !dueDate || isSubmitting || isCalculating}
          >
            {isSubmitting ? 'Creating...' : 'Create Billing Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBillingRecordModal;
