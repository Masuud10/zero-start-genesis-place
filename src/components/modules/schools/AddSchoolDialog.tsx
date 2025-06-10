
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface AddSchoolDialogProps {
  onSchoolAdded: () => void;
}

const AddSchoolDialog = ({ onSchoolAdded }: AddSchoolDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    planType: 'basic',
    amount: 50
  });
  const { toast } = useToast();

  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Insert school
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert([{
          name: newSchool.name,
          email: newSchool.email,
          phone: newSchool.phone,
          address: newSchool.address
        }])
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Create subscription for the school
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([{
          school_id: schoolData.id,
          plan_type: newSchool.planType,
          amount: newSchool.amount,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }]);

      if (subscriptionError) throw subscriptionError;

      toast({
        title: "Success",
        description: "School added successfully with subscription",
      });

      setIsOpen(false);
      setNewSchool({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '',
        planType: 'basic',
        amount: 50
      });
      onSchoolAdded();
    } catch (error) {
      console.error('Error adding school:', error);
      toast({
        title: "Error",
        description: "Failed to add school. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add School
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New School</DialogTitle>
          <DialogDescription>
            Add a new school to the Elimisha network with subscription
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">School Name *</Label>
            <Input
              id="name"
              value={newSchool.name}
              onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
              placeholder="Enter school name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newSchool.email}
              onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
              placeholder="Enter school email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={newSchool.phone}
              onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={newSchool.address}
              onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
              placeholder="Enter school address"
            />
          </div>
          <div>
            <Label htmlFor="planType">Subscription Plan</Label>
            <Select value={newSchool.planType} onValueChange={(value) => setNewSchool({ ...newSchool, planType: value, amount: value === 'basic' ? 50 : value === 'premium' ? 100 : 200 })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic - $50/month</SelectItem>
                <SelectItem value="premium">Premium - $100/month</SelectItem>
                <SelectItem value="enterprise">Enterprise - $200/month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddSchool} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding School...' : 'Add School'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSchoolDialog;
