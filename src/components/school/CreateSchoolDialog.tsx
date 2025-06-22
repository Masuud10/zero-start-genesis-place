
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School, Plus } from 'lucide-react';

interface CreateSchoolDialogProps {
  children: React.ReactNode;
  onSchoolCreated?: () => void;
}

const CreateSchoolDialog = ({ children, onSchoolCreated }: CreateSchoolDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    school_name: '',
    school_email: '',
    school_phone: '',
    school_address: '',
    logo_url: '',
    website_url: '',
    motto: '',
    slogan: '',
    school_type: 'primary',
    registration_number: '',
    year_established: new Date().getFullYear(),
    term_structure: '3-term',
    curriculum_type: 'cbc',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    owner_information: ''
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.school_name || !formData.school_email || !formData.school_phone || !formData.school_address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('create_enhanced_school', {
        school_name: formData.school_name,
        school_email: formData.school_email,
        school_phone: formData.school_phone,
        school_address: formData.school_address,
        logo_url: formData.logo_url || null,
        website_url: formData.website_url || null,
        motto: formData.motto || null,
        slogan: formData.slogan || null,
        school_type: formData.school_type,
        registration_number: formData.registration_number || null,
        year_established: formData.year_established,
        term_structure: formData.term_structure,
        curriculum_type: formData.curriculum_type,
        owner_name: formData.owner_name || null,
        owner_email: formData.owner_email || null,
        owner_phone: formData.owner_phone || null,
        owner_information: formData.owner_information || null
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: data.message || "School created successfully",
        });
        
        setFormData({
          school_name: '',
          school_email: '',
          school_phone: '',
          school_address: '',
          logo_url: '',
          website_url: '',
          motto: '',
          slogan: '',
          school_type: 'primary',
          registration_number: '',
          year_established: new Date().getFullYear(),
          term_structure: '3-term',
          curriculum_type: 'cbc',
          owner_name: '',
          owner_email: '',
          owner_phone: '',
          owner_information: ''
        });
        
        setOpen(false);
        if (onSchoolCreated) onSchoolCreated();
      } else {
        throw new Error(data?.error || 'Failed to create school');
      }
    } catch (error: any) {
      console.error('Error creating school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create school",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Create New School
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school_name">School Name *</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => handleInputChange('school_name', e.target.value)}
                  placeholder="Enter school name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school_email">Email *</Label>
                <Input
                  id="school_email"
                  type="email"
                  value={formData.school_email}
                  onChange={(e) => handleInputChange('school_email', e.target.value)}
                  placeholder="school@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school_phone">Phone *</Label>
                <Input
                  id="school_phone"
                  value={formData.school_phone}
                  onChange={(e) => handleInputChange('school_phone', e.target.value)}
                  placeholder="+254 XXX XXXXXX"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="School registration number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school_type">School Type</Label>
                <Select value={formData.school_type} onValueChange={(value) => handleInputChange('school_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year_established">Year Established</Label>
                <Input
                  id="year_established"
                  type="number"
                  value={formData.year_established}
                  onChange={(e) => handleInputChange('year_established', parseInt(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="curriculum_type">Curriculum Type</Label>
                <Select value={formData.curriculum_type} onValueChange={(value) => handleInputChange('curriculum_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbc">CBC (Competency Based Curriculum)</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="term_structure">Term Structure</Label>
                <Select value={formData.term_structure} onValueChange={(value) => handleInputChange('term_structure', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-term">3 Terms</SelectItem>
                    <SelectItem value="2-semester">2 Semesters</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school_address">Address *</Label>
              <Textarea
                id="school_address"
                value={formData.school_address}
                onChange={(e) => handleInputChange('school_address', e.target.value)}
                placeholder="Enter school address"
                required
              />
            </div>
          </div>

          {/* Branding */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Branding & Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://www.school.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motto">School Motto</Label>
                <Input
                  id="motto"
                  value={formData.motto}
                  onChange={(e) => handleInputChange('motto', e.target.value)}
                  placeholder="Excellence in Education"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slogan">School Slogan</Label>
                <Input
                  id="slogan"
                  value={formData.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder="Nurturing Future Leaders"
                />
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Owner/Administrator Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  placeholder="Owner full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner_email">Owner Email</Label>
                <Input
                  id="owner_email"
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => handleInputChange('owner_email', e.target.value)}
                  placeholder="owner@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner_phone">Owner Phone</Label>
                <Input
                  id="owner_phone"
                  value={formData.owner_phone}
                  onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                  placeholder="+254 XXX XXXXXX"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="owner_information">Additional Owner Information</Label>
              <Textarea
                id="owner_information"
                value={formData.owner_information}
                onChange={(e) => handleInputChange('owner_information', e.target.value)}
                placeholder="Additional details about the school owner"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create School
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;
