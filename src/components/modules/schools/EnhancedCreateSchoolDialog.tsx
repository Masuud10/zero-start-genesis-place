
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SchoolService } from '@/services/schoolService';
import { CreateSchoolRequest } from '@/types/schoolTypes';
import { Loader2, Upload, X, Image } from 'lucide-react';

interface EnhancedCreateSchoolDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EnhancedCreateSchoolDialog: React.FC<EnhancedCreateSchoolDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const [formData, setFormData] = useState<CreateSchoolRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo_url: '',
    website_url: '',
    motto: '',
    slogan: '',
    school_type: 'primary',
    registration_number: '',
    year_established: new Date().getFullYear(),
    term_structure: '3-term',
    owner_information: '',
    ownerEmail: '',
    ownerName: '',
    ownerPhone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'School name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'School email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact phone is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Physical address is required';
    }
    if (!formData.registration_number?.trim()) {
      newErrors.registration_number = 'Registration number is required';
    }
    if (!formData.year_established || formData.year_established < 1800 || formData.year_established > new Date().getFullYear()) {
      newErrors.year_established = 'Please enter a valid year of establishment';
    }
    if (!formData.school_type) {
      newErrors.school_type = 'School type is required';
    }
    if (!formData.term_structure) {
      newErrors.term_structure = 'Term structure is required';
    }

    // Optional owner email validation
    if (formData.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Please enter a valid owner email address';
    }

    // Website URL validation
    if (formData.website_url && !isValidUrl(formData.website_url)) {
      newErrors.website_url = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof CreateSchoolRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating school with data:', formData);
      
      const schoolData = { ...formData };

      // Upload logo if provided
      if (logoFile) {
        const tempSchoolId = `temp-${Date.now()}`;
        const logoResult = await SchoolService.uploadSchoolLogo(logoFile, tempSchoolId);
        
        if (logoResult.error) {
          toast({
            title: "Logo Upload Failed",
            description: logoResult.error,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        schoolData.logo_url = logoResult.url;
      }

      const result = await SchoolService.createSchool(schoolData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "School created successfully",
        });
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          logo_url: '',
          website_url: '',
          motto: '',
          slogan: '',
          school_type: 'primary',
          registration_number: '',
          year_established: new Date().getFullYear(),
          term_structure: '3-term',
          owner_information: '',
          ownerEmail: '',
          ownerName: '',
          ownerPhone: '',
          
        });
        setLogoFile(null);
        setLogoPreview('');
        setErrors({});
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create school",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating school:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Register New School
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Fill out the form below to register a new school in the EduFam network
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* School Logo Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">School Branding</h3>
            
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <Label htmlFor="logo-upload">School Logo</Label>
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <Image className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mb-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Logo
                      </Button>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter school name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_type">School Type *</Label>
                <Select 
                  value={formData.school_type} 
                  onValueChange={(value) => handleInputChange('school_type', value)}
                >
                  <SelectTrigger className={errors.school_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select school type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary School</SelectItem>
                    <SelectItem value="secondary">Secondary School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
                {errors.school_type && <p className="text-sm text-red-500">{errors.school_type}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="motto">School Motto</Label>
                <Input
                  id="motto"
                  value={formData.motto}
                  onChange={(e) => handleInputChange('motto', e.target.value)}
                  placeholder="Enter school motto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slogan">School Slogan</Label>
                <Input
                  id="slogan"
                  value={formData.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder="Enter school slogan"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">School Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="school@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone Numbers *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+254 700 000 000"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">School Website URL</Label>
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                placeholder="https://www.yourschool.com"
                className={errors.website_url ? 'border-red-500' : ''}
              />
              {errors.website_url && <p className="text-sm text-red-500">{errors.website_url}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical Location / Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete physical address"
                rows={3}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>
          </div>

          {/* Registration Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Registration & Academic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number *</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="Enter unique registration number"
                  className={errors.registration_number ? 'border-red-500' : ''}
                />
                {errors.registration_number && <p className="text-sm text-red-500">{errors.registration_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_established">Year of Establishment *</Label>
                <Input
                  id="year_established"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.year_established}
                  onChange={(e) => handleInputChange('year_established', parseInt(e.target.value))}
                  className={errors.year_established ? 'border-red-500' : ''}
                />
                {errors.year_established && <p className="text-sm text-red-500">{errors.year_established}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="term_structure">Term Structure *</Label>
                <Select 
                  value={formData.term_structure} 
                  onValueChange={(value) => handleInputChange('term_structure', value)}
                >
                  <SelectTrigger className={errors.term_structure ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select term structure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-term">3-Term System</SelectItem>
                    <SelectItem value="2-semester">2-Semester System</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.term_structure && <p className="text-sm text-red-500">{errors.term_structure}</p>}
              </div>
            </div>
          </div>

          {/* School Owner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">School Owner Information (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Enter owner's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Owner Phone</Label>
                <Input
                  id="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                placeholder="owner@example.com"
                className={errors.ownerEmail ? 'border-red-500' : ''}
              />
              {errors.ownerEmail && <p className="text-sm text-red-500">{errors.ownerEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_information">Additional Owner Information</Label>
              <Textarea
                id="owner_information"
                value={formData.owner_information}
                onChange={(e) => handleInputChange('owner_information', e.target.value)}
                placeholder="Enter additional information about the school director"
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t bg-gray-50 -mx-6 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Creating School...' : 'Create School'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateSchoolDialog;
