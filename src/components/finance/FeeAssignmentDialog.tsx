
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Calculator, Calendar } from 'lucide-react';
import { useStudentFees } from '@/hooks/useStudentFees';
import { useFeeStructures } from '@/hooks/useFeeStructures';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeeAssignmentData {
  fee_name: string;
  amount: number;
  due_date: string;
  academic_year: string;
  term: string;
  description?: string;
  discount_type: 'none' | 'percentage' | 'fixed';
  discount_amount: number;
  late_fee_penalty: number;
  allow_installments: boolean;
  installment_count?: number;
}

const FeeAssignmentDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<'class' | 'individual'>('class');
  const [formData, setFormData] = useState<FeeAssignmentData>({
    fee_name: '',
    amount: 0,
    due_date: '',
    academic_year: new Date().getFullYear().toString(),
    term: 'Term 1',
    description: '',
    discount_type: 'none',
    discount_amount: 0,
    late_fee_penalty: 0,
    allow_installments: false,
    installment_count: 1,
  });

  const { assignFeeToClass } = useStudentFees();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.school_id && open) {
      fetchClasses();
    }
  }, [user?.school_id, open]);

  const fetchClasses = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', user.school_id)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass) {
      toast({
        title: "Validation Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fee_name || !formData.amount || !formData.due_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const result = await assignFeeToClass(selectedClass, {
      amount: formData.amount,
      due_date: formData.due_date,
      academic_year: formData.academic_year,
      term: formData.term,
    });

    if (!result.error) {
      setOpen(false);
      setFormData({
        fee_name: '',
        amount: 0,
        due_date: '',
        academic_year: new Date().getFullYear().toString(),
        term: 'Term 1',
        description: '',
        discount_type: 'none',
        discount_amount: 0,
        late_fee_penalty: 0,
        allow_installments: false,
        installment_count: 1,
      });
      setSelectedClass('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Assign Fees
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Fees to Students
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Type */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={assignmentType === 'class' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('class')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Users className="h-6 w-6" />
              <div>
                <div className="font-medium">Assign to Class</div>
                <div className="text-xs opacity-80">All students in selected class</div>
              </div>
            </Button>
            <Button
              type="button"
              variant={assignmentType === 'individual' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('individual')}
              className="h-auto p-4 flex flex-col items-center gap-2"
              disabled
            >
              <Users className="h-6 w-6" />
              <div>
                <div className="font-medium">Individual Assignment</div>
                <div className="text-xs opacity-80">Coming soon</div>
              </div>
            </Button>
          </div>

          {/* Class Selection */}
          <div>
            <Label htmlFor="class">Select Class *</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.level} {cls.stream}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fee_name">Fee Name *</Label>
              <Input
                id="fee_name"
                value={formData.fee_name}
                onChange={(e) => setFormData(prev => ({ ...prev, fee_name: e.target.value }))}
                placeholder="e.g., Tuition Fee"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                value={formData.academic_year}
                onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
                placeholder="2024"
              />
            </div>
            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={formData.term} onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}>
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

          {/* Discount Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Discount & Penalties
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select 
                  value={formData.discount_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, discount_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.discount_type !== 'none' && (
                <div>
                  <Label htmlFor="discount_amount">
                    Discount {formData.discount_type === 'percentage' ? '(%)' : '(KES)'}
                  </Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="late_fee_penalty">Late Fee Penalty (KES)</Label>
                <Input
                  id="late_fee_penalty"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.late_fee_penalty}
                  onChange={(e) => setFormData(prev => ({ ...prev, late_fee_penalty: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>

          {/* Installment Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Installment Plan
              </h3>
              <Switch 
                checked={formData.allow_installments}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_installments: checked }))}
              />
            </div>
            
            {formData.allow_installments && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="installment_count">Number of Installments</Label>
                  <Select 
                    value={formData.installment_count?.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, installment_count: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map(count => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} Installments
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Badge variant="secondary">
                    {formData.installment_count ? 
                      `KES ${(formData.amount / formData.installment_count).toFixed(2)} per installment` : 
                      'Select installment count'
                    }
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional fee details..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Assign Fees
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeeAssignmentDialog;
