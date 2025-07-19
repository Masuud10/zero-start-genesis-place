
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, Calculator } from 'lucide-react';
import { useAllSchools, useBillingActions } from '@/hooks/useBillingManagement';
import { BillingManagementService } from '@/services/billing/billingManagementService';
import { useToast } from '@/hooks/use-toast';

interface CreateMonthlySubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMonthlySubscriptionModal: React.FC<CreateMonthlySubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [perStudentRate, setPerStudentRate] = useState<number>(50);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [useManualAmount, setUseManualAmount] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState<string>('');
  const [billingMonth, setBillingMonth] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data: schools, isLoading: schoolsLoading } = useAllSchools();
  const { toast } = useToast();

  // Set default values when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const dueDateDefault = new Date(today.getFullYear(), today.getMonth(), 15);
      
      setBillingMonth(nextMonth.toISOString().substring(0, 7)); // YYYY-MM format
      setDueDate(dueDateDefault.toISOString().substring(0, 10)); // YYYY-MM-DD format
      setPerStudentRate(50);
      
      // Reset form
      setSelectedSchoolId('');
      setStudentCount(0);
      setCalculatedAmount(0);
      setManualAmount('');
      setUseManualAmount(false);
      setDescription('');
    }
  }, [isOpen]);

  // Calculate subscription fee when school changes
  useEffect(() => {
    if (selectedSchoolId) {
      calculateSubscriptionFee();
    }
  }, [selectedSchoolId]);

  // Recalculate amount when student count or rate changes
  useEffect(() => {
    if (!useManualAmount) {
      setCalculatedAmount(studentCount * perStudentRate);
    }
  }, [studentCount, perStudentRate, useManualAmount]);

  const calculateSubscriptionFee = async () => {
    if (!selectedSchoolId) return;

    setIsCalculating(true);
    try {
      const result = await BillingManagementService.calculateSubscriptionFee(selectedSchoolId);
      if (result.data) {
        setStudentCount(result.data.student_count || 0);
        setPerStudentRate(result.data.per_student_rate || 50);
        setCalculatedAmount(result.data.calculated_amount || 0);
        
        // Auto-generate description
        const school = schools?.find(s => s.id === selectedSchoolId);
        if (school) {
          const monthName = new Date(billingMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          setDescription(`Monthly subscription fee for ${school.name} - ${monthName} (${result.data.student_count} students)`);
        }
      }
    } catch (error) {
      console.error('Error calculating subscription fee:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate subscription fee. Please try again.",
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

    if (!dueDate) {
      toast({
        title: "Validation Error",
        description: "Please set a due date.",
        variant: "destructive",
      });
      return;
    }

    if (!billingMonth) {
      toast({
        title: "Validation Error",
        description: "Please select a billing month.",
        variant: "destructive",
      });
      return;
    }

    const finalAmount = useManualAmount ? parseFloat(manualAmount) : calculatedAmount;
    
    if (isNaN(finalAmount) || finalAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the subscription record using the service
      const result = await BillingManagementService.createManualFeeRecord({
        school_id: selectedSchoolId,
        billing_type: 'subscription_fee',
        amount: useManualAmount ? parseFloat(manualAmount) / studentCount : perStudentRate, // Per student rate
        description: description || `Monthly subscription fee - ${billingMonth}`,
        due_date: dueDate
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Monthly subscription created successfully.",
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to create subscription');
      }
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create monthly subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSchool = schools?.find(school => school.id === selectedSchoolId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create Monthly Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* School Selection */}
          <div className="space-y-2">
            <Label htmlFor="school">Select School *</Label>
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

          {/* Billing Month */}
          <div className="space-y-2">
            <Label htmlFor="billingMonth">Billing Month *</Label>
            <Input
              id="billingMonth"
              type="month"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
            />
          </div>

          {/* Student Count & Calculation */}
          {selectedSchoolId && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Users className="h-4 w-4" />
                Student Count & Calculation
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Student Count</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={studentCount}
                      onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
                      min="0"
                    />
                    {isCalculating && <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rate per Student (KES)</Label>
                  <Input
                    type="number"
                    value={perStudentRate}
                    onChange={(e) => setPerStudentRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Calculated Amount</Label>
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-lg">
                      KES {calculatedAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual Amount Override */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useManualAmount"
                    checked={useManualAmount}
                    onChange={(e) => setUseManualAmount(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="useManualAmount">Use manual amount (override calculation)</Label>
                </div>
                
                {useManualAmount && (
                  <Input
                    type="number"
                    placeholder="Enter manual amount"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                )}
              </div>
            </div>
          )}

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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description for this subscription..."
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedSchool && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Subscription Summary</h4>
              <div className="space-y-1 text-sm">
                <div><strong>School:</strong> {selectedSchool.name}</div>
                <div><strong>Students:</strong> {studentCount}</div>
                <div><strong>Amount:</strong> KES {(useManualAmount ? parseFloat(manualAmount) || 0 : calculatedAmount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
                <div><strong>Due Date:</strong> {dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedSchoolId || !dueDate || isSubmitting || isCalculating}
          >
            {isSubmitting ? 'Creating...' : 'Create Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMonthlySubscriptionModal;
