
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { AuthUser } from '@/types/auth';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    owner_name: '',
    owner_email: '',
    logo_url: '',
    website_url: '',
    motto: '',
    slogan: '',
    registration_number: '',
    year_established: new Date().getFullYear(),
    curriculum_type: 'cbc'
  });

  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: typeof formData) => {
      const { data, error } = await supabase.rpc('create_enhanced_school', {
        school_name: schoolData.name,
        school_email: schoolData.email,
        school_phone: schoolData.phone,
        school_address: schoolData.address,
        logo_url: schoolData.logo_url || null,
        website_url: schoolData.website_url || null,
        motto: schoolData.motto || null,
        slogan: schoolData.slogan || null,
        registration_number: schoolData.registration_number || null,
        year_established: schoolData.year_established,
        owner_name: schoolData.owner_name || null,
        owner_email: schoolData.owner_email || null,
        curriculum_type: schoolData.curriculum_type
      });

      if (error) throw error;
      
      // Check if the response indicates an error
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(data.error as string);
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "School created successfully",
      });
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        owner_name: '',
        owner_email: '',
        logo_url: '',
        website_url: '',
        motto: '',
        slogan: '',
        registration_number: '',
        year_established: new Date().getFullYear(),
        curriculum_type: 'cbc'
      });
    },
    onError: (error: any) => {
      console.error('Error creating school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create school",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createSchoolMutation.mutate(formData);
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
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ABC Primary School"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">School Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@abcschool.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+254 700 000 000"
                required
              />
            </div>

            <div>
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                placeholder="REG/2024/001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">School Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Full address of the school"
              required
            />
          </div>

          {/* Owner Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="owner_email">Owner Email</Label>
              <Input
                id="owner_email"
                type="email"
                value={formData.owner_email}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_email: e.target.value }))}
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
                value={formData.motto}
                onChange={(e) => setFormData(prev => ({ ...prev, motto: e.target.value }))}
                placeholder="Excellence in Education"
              />
            </div>

            <div>
              <Label htmlFor="slogan">School Slogan</Label>
              <Input
                id="slogan"
                value={formData.slogan}
                onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                placeholder="Nurturing Future Leaders"
              />
            </div>

            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://www.abcschool.com"
              />
            </div>

            <div>
              <Label htmlFor="year_established">Year Established</Label>
              <Input
                id="year_established"
                type="number"
                value={formData.year_established}
                onChange={(e) => setFormData(prev => ({ ...prev, year_established: parseInt(e.target.value) }))}
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
              disabled={createSchoolMutation.isPending}
              className="flex-1"
            >
              {createSchoolMutation.isPending ? 'Creating...' : 'Create School'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolModal;
