
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, School, Users, Calendar } from 'lucide-react';
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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'termly' | 'annually'>('monthly');
  const [remarks, setRemarks] = useState<string>('');
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
        setDescription('One-time setup fee for school onboarding and system configuration');
      } else {
        setAmount('');
        setDescription(`${billingPeriod.charAt(0).toUpperCase() + billingPeriod.slice(1)} subscription fee based on student enrollment`);
      }
    }
  }, [isOpen, billingType, billingPeriod]);

  // Calculate subscription fee when school or billing period changes
  React.useEffect(() => {
    if (selectedSchoolId && billingType === 'subscription_fee') {
      calculateSubscriptionFee();
    }
  }, [selectedSchoolId, billingType, billingPeriod]);

  const calculateSubscriptionFee = async () => {
    if (!selectedSchoolId) return;

    setIsCalculating(true);
    try {
      const result = await BillingManagementService.calculateSubscriptionFee(selectedSchoolId);
      if (result.data) {
        setStudentCount(result.data.student_count || 0);
        
        // Calculate amount based on billing period
        let baseAmount = (result.data.student_count || 0) * 50; // 50 KES per student per month
        let calculatedAmount = baseAmount;
        
        switch (billingPeriod) {
          case 'termly':
            calculatedAmount = baseAmount * 3; // 3 months per term
            break;
          case 'annually':
            calculatedAmount = baseAmount * 12; // 12 months per year
            break;
          default:
            calculatedAmount = baseAmount; // monthly
        }
        
        setAmount(calculatedAmount.toString());
        
        const school = schools?.find(s => s.id === selectedSchoolId);
        if (school) {
          setDescription(`${billingPeriod.charAt(0).toUpperCase() + billingPeriod.slice(1)} subscription fee for ${school.name} - ${result.data.student_count} students @ KES 50 per student per month`);
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

    // Check for duplicate billing records - especially setup fees
    if (billingType === 'setup_fee') {
      try {
        const existingRecords = await BillingManagementService.getSchoolBillingRecords(selectedSchoolId);
        if (existingRecords.data && existingRecords.data.some(record => record.billing_type === 'setup_fee')) {
          toast({
            title: "Duplicate Record",
            description: "A setup fee record already exists for this school. Setup fees are one-time charges.",
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
      // Create the billing record with enhanced data
      const billingData = {
        school_id: selectedSchoolId,
        billing_type: billingType,
        amount: parseFloat(amount),
        description: description.trim(),
        due_date: dueDate,
        // Add additional metadata
        billing_period: billingType === 'subscription_fee' ? billingPeriod : undefined,
        student_count: billingType === 'subscription_fee' ? studentCount : undefined,
        remarks: remarks.trim() || undefined
      };

      const result = await BillingManagementService.createManualFeeRecord(billingData);

      if (result.success) {
        toast({
          title: "Success",
          description: `${billingType === 'setup_fee' ? 'Setup fee' : 'Subscription fee'} record created successfully.`,
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
    setBillingPeriod('monthly');
    setRemarks('');
    setStudentCount(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedSchool = schools?.find(school => school.id === selectedSchoolId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                <SelectItem value="subscription_fee">Subscription Fee (Recurring)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Billing Period - Only for subscription fees */}
          {billingType === 'subscription_fee' && (
            <div className="space-y-2">
              <Label htmlFor="billingPeriod" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Billing Period *
              </Label>
              <Select value={billingPeriod} onValueChange={(value: 'monthly' | 'termly' | 'annually') => setBillingPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="termly">Termly (3 months)</SelectItem>
                  <SelectItem value="annually">Annually (12 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
                  <span className="text-sm">Rate per Student (Monthly):</span>
                  <span className="font-medium">KES 50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Billing Period:</span>
                  <span className="font-medium capitalize">{billingPeriod}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">
                    KES {amount ? parseFloat(amount).toLocaleString('en-KE') : '0'}
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
                Standard setup fee is KES 5,000 (one-time charge)
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

          {/* Optional Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Additional Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any additional notes or remarks..."
              rows={2}
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
                <div><strong>Type:</strong> {billingType === 'setup_fee' ? 'Setup Fee (One-time)' : `Subscription Fee (${billingPeriod.charAt(0).toUpperCase() + billingPeriod.slice(1)})`}</div>
                <div><strong>Amount:</strong> KES {parseFloat(amount || '0').toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
                <div><strong>Due Date:</strong> {dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}</div>
                {billingType === 'subscription_fee' && (
                  <div><strong>Students:</strong> {studentCount}</div>
                )}
                {remarks && (
                  <div><strong>Remarks:</strong> {remarks}</div>
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
