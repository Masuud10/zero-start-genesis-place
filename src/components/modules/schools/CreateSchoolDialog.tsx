
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SchoolService, CreateSchoolRequest } from '@/services/schoolService';
import { Plus, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CreateSchoolDialogProps {
  onSchoolCreated?: () => void;
}

const CreateSchoolDialog = ({ onSchoolCreated }: CreateSchoolDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateSchoolRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    ownerEmail: '',
    ownerName: ''
  });

  const handleInputChange = (field: keyof CreateSchoolRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "School name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "School email is required",
        variant: "destructive"
      });
      return false;
    }

    // If owner details are provided, both email and name are required
    if (formData.ownerEmail || formData.ownerName) {
      if (!formData.ownerEmail || !formData.ownerName) {
        toast({
          title: "Validation Error",
          description: "Both owner email and name are required if creating an owner account",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      console.log('🏫 CreateSchoolDialog: Submitting school creation', formData);
      
      const result = await SchoolService.createSchool(formData);

      if (result.success) {
        toast({
          title: "School Created Successfully",
          description: result.message || "The school has been created and is ready for use.",
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          ownerEmail: '',
          ownerName: ''
        });

        setOpen(false);
        onSchoolCreated?.();
      } else {
        toast({
          title: "Failed to Create School",
          description: result.error || "An unexpected error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('🏫 CreateSchoolDialog: Error creating school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create school",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New School
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New School (Tenant)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">School Information</CardTitle>
              <CardDescription>
                Basic details about the new school institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Sunshine Primary School"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">School Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@school.edu"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+254 123 456 789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address of the school"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">School Owner (Optional)</CardTitle>
              <CardDescription>
                Create an owner account for this school. If left blank, you can assign an owner later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Full Name</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Owner Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                    placeholder="owner@school.edu"
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                <strong>Note:</strong> If you provide owner details, a school owner account will be created with a temporary password (TempPassword123!). The owner should change this password on first login.
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating School...' : 'Create School'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;
