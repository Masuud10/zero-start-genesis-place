
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AuthUser } from '@/types/auth';
import { ComprehensiveSchoolData } from '@/types/schoolTypes';
import { SchoolCreationService } from '@/components/modules/schools/SchoolCreationService';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

const CreateSchoolModal: React.FC<CreateSchoolModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ComprehensiveSchoolData>>({
    school_name: '',
    school_email: '',
    school_phone: '',
    school_address: '',
    owner_name: '',
    owner_email: '',
    logo_url: '',
    website_url: '',
    motto: '',
    slogan: '',
    registration_number: '',
    year_established: new Date().getFullYear(),
    curriculum_type: 'cbc',
    school_type: 'primary',
    term_structure: '3-term'
  });

  const handleInputChange = (field: keyof ComprehensiveSchoolData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.school_name?.trim()) {
      toast({
        title: "Validation Error",
        description: "School name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.school_email?.trim()) {
      toast({
        title: "Validation Error",
        description: "School email is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.school_phone?.trim()) {
      toast({
        title: "Validation Error",
        description: "School phone is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.school_address?.trim()) {
      toast({
        title: "Validation Error",
        description: "School address is required",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
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
          title: "Success",
          description: result.message || "School created successfully",
        });
        onSuccess();
        onClose();
        
        // Reset form
        setFormData({
          school_name: '',
          school_email: '',
          school_phone: '',
          school_address: '',
          owner_name: '',
          owner_email: '',
          logo_url: '',
          website_url: '',
          motto: '',
          slogan: '',
          registration_number: '',
          year_established: new Date().getFullYear(),
          curriculum_type: 'cbc',
          school_type: 'primary',
          term_structure: '3-term'
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create school",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error creating school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create school",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New School</DialogTitle>
          <DialogDescription>
            Add a new school to the system with all necessary details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="school_name">School Name *</Label>
              <Input
                id="school_name"
                value={formData.school_name || ''}
                onChange={(e) => handleInputChange('school_name', e.target.value)}
                placeholder="ABC Primary School"
                required
              />
            </div>

            <div>
              <Label htmlFor="school_email">School Email *</Label>
              <Input
                id="school_email"
                type="email"
                value={formData.school_email || ''}
                onChange={(e) => handleInputChange('school_email', e.target.value)}
                placeholder="info@abcschool.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="school_phone">Phone Number *</Label>
              <Input
                id="school_phone"
                value={formData.school_phone || ''}
                onChange={(e) => handleInputChange('school_phone', e.target.value)}
                placeholder="+254 700 000 000"
                required
              />
            </div>

            <div>
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number || ''}
                onChange={(e) => handleInputChange('registration_number', e.target.value)}
                placeholder="REG/2024/001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="school_address">School Address *</Label>
            <Textarea
              id="school_address"
              value={formData.school_address || ''}
              onChange={(e) => handleInputChange('school_address', e.target.value)}
              placeholder="Full address of the school"
              required
            />
          </div>

          {/* School Type and Curriculum */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="school_type">School Type</Label>
              <Select
                value={formData.school_type || 'primary'}
                onValueChange={(value) => handleInputChange('school_type', value)}
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

            <div>
              <Label htmlFor="curriculum_type">Curriculum Type</Label>
              <Select
                value={formData.curriculum_type || 'cbc'}
                onValueChange={(value) => handleInputChange('curriculum_type', value)}
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
          </div>

          {/* Owner Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                value={formData.owner_name || ''}
                onChange={(e) => handleInputChange('owner_name', e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="owner_email">Owner Email</Label>
              <Input
                id="owner_email"
                type="email"
                value={formData.owner_email || ''}
                onChange={(e) => handleInputChange('owner_email', e.target.value)}
                placeholder="owner@example.com"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="motto">School Motto</Label>
              <Input
                id="motto"
                value={formData.motto || ''}
                onChange={(e) => handleInputChange('motto', e.target.value)}
                placeholder="Excellence in Education"
              />
            </div>

            <div>
              <Label htmlFor="slogan">School Slogan</Label>
              <Input
                id="slogan"
                value={formData.slogan || ''}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                placeholder="Nurturing Future Leaders"
              />
            </div>

            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                placeholder="https://www.abcschool.com"
              />
            </div>

            <div>
              <Label htmlFor="year_established">Year Established</Label>
              <Input
                id="year_established"
                type="number"
                value={formData.year_established || new Date().getFullYear()}
                onChange={(e) => handleInputChange('year_established', parseInt(e.target.value))}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create School'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolModal;
