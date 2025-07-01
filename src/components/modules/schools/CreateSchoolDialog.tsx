
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SchoolCreationService } from './SchoolCreationService';
import { Plus, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ComprehensiveSchoolData } from '@/types/schoolTypes';

interface CreateSchoolDialogProps {
  onSchoolCreated?: () => void;
}

const CreateSchoolDialog = ({ onSchoolCreated }: CreateSchoolDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<ComprehensiveSchoolData>>({
    school_name: '',
    school_email: '',
    school_phone: '',
    school_address: '',
    owner_email: '',
    owner_name: '',
    curriculum_type: 'cbc',
    school_type: 'primary',
    term_structure: '3-term'
  });

  const handleInputChange = (field: keyof ComprehensiveSchoolData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      school_name: '',
      school_email: '',
      school_phone: '',
      school_address: '',
      owner_email: '',
      owner_name: '',
      curriculum_type: 'cbc',
      school_type: 'primary',
      term_structure: '3-term'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      console.log('🏫 CreateSchoolDialog: Submitting school creation', formData);
      
      // Convert to ComprehensiveSchoolData format
      const schoolData: ComprehensiveSchoolData = {
        school_name: formData.school_name || '',
        school_email: formData.school_email || '',
        school_phone: formData.school_phone || '',
        school_address: formData.school_address || '',
        school_type: formData.school_type || 'primary',
        curriculum_type: formData.curriculum_type || 'cbc',
        term_structure: formData.term_structure || '3-term',
        registration_number: formData.registration_number,
        year_established: formData.year_established,
        logo_url: formData.logo_url,
        website_url: formData.website_url,
        motto: formData.motto,
        slogan: formData.slogan,
        owner_name: formData.owner_name,
        owner_email: formData.owner_email,
        owner_phone: formData.owner_phone,
        owner_information: formData.owner_information,
        principal_name: formData.principal_name,
        principal_email: formData.principal_email,
        principal_contact: formData.principal_contact,
        mpesa_paybill_number: formData.mpesa_paybill_number,
        mpesa_consumer_key: formData.mpesa_consumer_key,
        mpesa_consumer_secret: formData.mpesa_consumer_secret,
        mpesa_passkey: formData.mpesa_passkey
      };
      
      const result = await SchoolCreationService.createSchool(schoolData);

      if (result.success) {
        toast({
          title: "School Created Successfully",
          description: result.message || "The school has been created and is ready for use.",
        });

        resetForm();
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
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  <Label htmlFor="school_name">School Name *</Label>
                  <Input
                    id="school_name"
                    value={formData.school_name || ''}
                    onChange={(e) => handleInputChange('school_name', e.target.value)}
                    placeholder="e.g., Sunshine Primary School"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_email">School Email *</Label>
                  <Input
                    id="school_email"
                    type="email"
                    value={formData.school_email || ''}
                    onChange={(e) => handleInputChange('school_email', e.target.value)}
                    placeholder="info@school.edu"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_phone">Phone Number *</Label>
                <Input
                  id="school_phone"
                  value={formData.school_phone || ''}
                  onChange={(e) => handleInputChange('school_phone', e.target.value)}
                  placeholder="+254 123 456 789"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_address">Address *</Label>
                <Textarea
                  id="school_address"
                  value={formData.school_address || ''}
                  onChange={(e) => handleInputChange('school_address', e.target.value)}
                  placeholder="Full address of the school"
                  rows={3}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="curriculum_type">Curriculum Type *</Label>
                  <Select
                    value={formData.curriculum_type || 'cbc'}
                    onValueChange={(value) => handleInputChange('curriculum_type', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cbc">Kenyan CBC</SelectItem>
                      <SelectItem value="igcse">IGCSE (British International)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_type">School Type</Label>
                  <Select
                    value={formData.school_type || 'primary'}
                    onValueChange={(value) => handleInputChange('school_type', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary School</SelectItem>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Label htmlFor="owner_name">Owner Full Name</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name || ''}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_email">Owner Email</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email || ''}
                    onChange={(e) => handleInputChange('owner_email', e.target.value)}
                    placeholder="owner@school.edu"
                    disabled={isLoading}
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
              onClick={() => handleOpenChange(false)}
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
