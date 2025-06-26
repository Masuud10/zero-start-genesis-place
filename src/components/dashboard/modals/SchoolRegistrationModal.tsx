
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthUser } from '@/types/auth';
import { Building2, Loader2, Shield, User, GraduationCap, Smartphone } from 'lucide-react';
import { InputSanitizer } from '@/utils/inputSanitizer';

interface SchoolRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

interface SchoolFormData {
  // Basic Information
  school_name: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  
  // School Details
  school_type: 'primary' | 'secondary' | 'college';
  curriculum_type: 'cbc' | 'igcse' | 'cambridge';
  term_structure: '3-term' | '2-semester' | 'other';
  registration_number: string;
  year_established: number;
  
  // Branding
  logo_url: string;
  website_url: string;
  motto: string;
  slogan: string;
  
  // Owner Information
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_information: string;
  
  // Principal Information
  principal_name: string;
  principal_email: string;
  principal_contact: string;
  
  // MPESA Configuration
  mpesa_paybill_number: string;
  mpesa_consumer_key: string;
  mpesa_consumer_secret: string;
  mpesa_passkey: string;
}

interface SchoolCreationResult {
  success?: boolean;
  school_id?: string;
  owner_id?: string;
  principal_id?: string;
  message?: string;
  error?: string;
}

const SchoolRegistrationModal: React.FC<SchoolRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<SchoolFormData>({
    // Basic Information
    school_name: '',
    school_email: '',
    school_phone: '',
    school_address: '',
    
    // School Details
    school_type: 'primary',
    curriculum_type: 'cbc',
    term_structure: '3-term',
    registration_number: '',
    year_established: new Date().getFullYear(),
    
    // Branding
    logo_url: '',
    website_url: '',
    motto: '',
    slogan: '',
    
    // Owner Information
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    owner_information: '',
    
    // Principal Information
    principal_name: '',
    principal_email: '',
    principal_contact: '',
    
    // MPESA Configuration
    mpesa_paybill_number: '',
    mpesa_consumer_key: '',
    mpesa_consumer_secret: '',
    mpesa_passkey: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Required field validation
    if (!formData.school_name.trim()) {
      errors.school_name = 'School name is required';
    }
    
    if (!formData.school_email.trim()) {
      errors.school_email = 'School email is required';
    } else {
      try {
        InputSanitizer.sanitizeEmail(formData.school_email);
      } catch {
        errors.school_email = 'Invalid email format';
      }
    }
    
    if (!formData.school_phone.trim()) {
      errors.school_phone = 'School phone is required';
    }
    
    if (!formData.school_address.trim()) {
      errors.school_address = 'School address is required';
    }
    
    // Optional email validations
    if (formData.owner_email && formData.owner_email.trim()) {
      try {
        InputSanitizer.sanitizeEmail(formData.owner_email);
      } catch {
        errors.owner_email = 'Invalid owner email format';
      }
    }
    
    if (formData.principal_email && formData.principal_email.trim()) {
      try {
        InputSanitizer.sanitizeEmail(formData.principal_email);
      } catch {
        errors.principal_email = 'Invalid principal email format';
      }
    }
    
    // Year validation
    const currentYear = new Date().getFullYear();
    if (formData.year_established < 1800 || formData.year_established > currentYear) {
      errors.year_established = `Year must be between 1800 and ${currentYear}`;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createSchool = useMutation({
    mutationFn: async (data: SchoolFormData) => {
      console.log('🏫 Creating comprehensive school with data:', data);
      
      const { data: result, error } = await supabase.rpc('create_comprehensive_school', {
        // Basic Information
        school_name: InputSanitizer.sanitizeAlphanumeric(data.school_name.trim()),
        school_email: InputSanitizer.sanitizeEmail(data.school_email.trim()),
        school_phone: InputSanitizer.sanitizePhoneNumber(data.school_phone.trim()),
        school_address: InputSanitizer.sanitizeAlphanumeric(data.school_address.trim()),
        
        // School Details
        school_type: data.school_type,
        curriculum_type: data.curriculum_type,
        term_structure: data.term_structure,
        registration_number: data.registration_number.trim() || null,
        year_established: data.year_established,
        
        // Branding
        logo_url: data.logo_url.trim() || null,
        website_url: data.website_url.trim() || null,
        motto: data.motto.trim() || null,
        slogan: data.slogan.trim() || null,
        
        // Owner Information
        owner_name: data.owner_name.trim() || null,
        owner_email: data.owner_email.trim() || null,
        owner_phone: data.owner_phone.trim() || null,
        owner_information: data.owner_information.trim() || null,
        
        // Principal Information
        principal_name: data.principal_name.trim() || null,
        principal_email: data.principal_email.trim() || null,
        principal_contact: data.principal_contact.trim() || null,
        
        // MPESA Configuration
        mpesa_paybill_number: data.mpesa_paybill_number.trim() || null,
        mpesa_consumer_key: data.mpesa_consumer_key.trim() || null,
        mpesa_consumer_secret: data.mpesa_consumer_secret.trim() || null,
        mpesa_passkey: data.mpesa_passkey.trim() || null
      });

      if (error) {
        console.error('🏫 Database function error:', error);
        throw error;
      }

      console.log('🏫 Database function result:', result);
      return result as SchoolCreationResult;
    },
    onSuccess: (result) => {
      console.log('🏫 School creation result:', result);
      
      if (result?.success) {
        toast({
          title: "Success",
          description: result.message || "School registered successfully with complete setup",
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['schools'] });
        queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        
        onSuccess();
        onClose();
        
        // Reset form
        setFormData({
          school_name: '', school_email: '', school_phone: '', school_address: '',
          school_type: 'primary', curriculum_type: 'cbc', term_structure: '3-term',
          registration_number: '', year_established: new Date().getFullYear(),
          logo_url: '', website_url: '', motto: '', slogan: '',
          owner_name: '', owner_email: '', owner_phone: '', owner_information: '',
          principal_name: '', principal_email: '', principal_contact: '',
          mpesa_paybill_number: '', mpesa_consumer_key: '', mpesa_consumer_secret: '', mpesa_passkey: ''
        });
        setValidationErrors({});
      } else {
        toast({
          title: "Registration Failed",
          description: result?.error || "Failed to register school. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('🏫 School creation error:', error);
      toast({
        title: "Registration Error",
        description: error.message || "An unexpected error occurred during school registration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before submitting",
        variant: "destructive",
      });
      return;
    }

    createSchool.mutate(formData);
  };

  const handleInputChange = (field: keyof SchoolFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Register New School
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive school profile with administrative setup and payment configuration
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="school_name">School Name *</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => handleInputChange('school_name', e.target.value)}
                  placeholder="ABC Primary School"
                  className={validationErrors.school_name ? 'border-red-500' : ''}
                />
                {validationErrors.school_name && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.school_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="school_email">School Email *</Label>
                <Input
                  id="school_email"
                  type="email"
                  value={formData.school_email}
                  onChange={(e) => handleInputChange('school_email', e.target.value)}
                  placeholder="info@abcschool.com"
                  className={validationErrors.school_email ? 'border-red-500' : ''}
                />
                {validationErrors.school_email && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.school_email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="school_phone">Phone Number *</Label>
                <Input
                  id="school_phone"
                  value={formData.school_phone}
                  onChange={(e) => handleInputChange('school_phone', e.target.value)}
                  placeholder="+254 700 000 000"
                  className={validationErrors.school_phone ? 'border-red-500' : ''}
                />
                {validationErrors.school_phone && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.school_phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="REG/2024/001"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="school_address">School Address *</Label>
              <Textarea
                id="school_address"
                value={formData.school_address}
                onChange={(e) => handleInputChange('school_address', e.target.value)}
                placeholder="Complete address of the school including city and postal code"
                className={validationErrors.school_address ? 'border-red-500' : ''}
                rows={3}
              />
              {validationErrors.school_address && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.school_address}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* School Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <h3 className="text-lg font-semibold">School Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="school_type">School Type</Label>
                <Select value={formData.school_type} onValueChange={(value: 'primary' | 'secondary' | 'college') => handleInputChange('school_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Select value={formData.curriculum_type} onValueChange={(value: 'cbc' | 'igcse' | 'cambridge') => handleInputChange('curriculum_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbc">CBC (Competency Based Curriculum)</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="cambridge">Cambridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="term_structure">Term Structure</Label>
                <Select value={formData.term_structure} onValueChange={(value: '3-term' | '2-semester' | 'other') => handleInputChange('term_structure', value)}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year_established">Year Established</Label>
                <Input
                  id="year_established"
                  type="number"
                  value={formData.year_established}
                  onChange={(e) => handleInputChange('year_established', parseInt(e.target.value) || new Date().getFullYear())}
                  min="1800"
                  max={new Date().getFullYear()}
                  className={validationErrors.year_established ? 'border-red-500' : ''}
                />
                {validationErrors.year_established && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.year_established}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://www.abcschool.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="motto">School Motto</Label>
                <Input
                  id="motto"
                  value={formData.motto}
                  onChange={(e) => handleInputChange('motto', e.target.value)}
                  placeholder="Excellence in Education"
                />
              </div>

              <div>
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

          <Separator />

          {/* Administrative Contacts Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <h3 className="text-lg font-semibold">Administrative Contacts</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">School Owner (Optional)</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="owner_name">Owner Name</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => handleInputChange('owner_name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner_email">Owner Email</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={formData.owner_email}
                      onChange={(e) => handleInputChange('owner_email', e.target.value)}
                      placeholder="owner@example.com"
                      className={validationErrors.owner_email ? 'border-red-500' : ''}
                    />
                    {validationErrors.owner_email && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.owner_email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="owner_phone">Owner Phone</Label>
                    <Input
                      id="owner_phone"
                      value={formData.owner_phone}
                      onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>
              </div>

              {/* Principal Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Principal (Optional)</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="principal_name">Principal Name</Label>
                    <Input
                      id="principal_name"
                      value={formData.principal_name}
                      onChange={(e) => handleInputChange('principal_name', e.target.value)}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="principal_email">Principal Email</Label>
                    <Input
                      id="principal_email"
                      type="email"
                      value={formData.principal_email}
                      onChange={(e) => handleInputChange('principal_email', e.target.value)}
                      placeholder="principal@example.com"
                      className={validationErrors.principal_email ? 'border-red-500' : ''}
                    />
                    {validationErrors.principal_email && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.principal_email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="principal_contact">Principal Contact</Label>
                    <Input
                      id="principal_contact"
                      value={formData.principal_contact}
                      onChange={(e) => handleInputChange('principal_contact', e.target.value)}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* MPESA Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <h3 className="text-lg font-semibold">MPESA Payment Configuration (Optional)</h3>
            </div>
            <p className="text-sm text-gray-600">Configure MPESA integration for fee collection</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mpesa_paybill_number">MPESA Paybill Number</Label>
                <Input
                  id="mpesa_paybill_number"
                  value={formData.mpesa_paybill_number}
                  onChange={(e) => handleInputChange('mpesa_paybill_number', e.target.value)}
                  placeholder="123456"
                />
              </div>

              <div>
                <Label htmlFor="mpesa_passkey">MPESA Passkey</Label>
                <Input
                  id="mpesa_passkey"
                  type="password"
                  value={formData.mpesa_passkey}
                  onChange={(e) => handleInputChange('mpesa_passkey', e.target.value)}
                  placeholder="Enter MPESA passkey"
                />
              </div>

              <div>
                <Label htmlFor="mpesa_consumer_key">Consumer Key</Label>
                <Input
                  id="mpesa_consumer_key"
                  type="password"
                  value={formData.mpesa_consumer_key}
                  onChange={(e) => handleInputChange('mpesa_consumer_key', e.target.value)}
                  placeholder="Enter consumer key"
                />
              </div>

              <div>
                <Label htmlFor="mpesa_consumer_secret">Consumer Secret</Label>
                <Input
                  id="mpesa_consumer_secret"
                  type="password"
                  value={formData.mpesa_consumer_secret}
                  onChange={(e) => handleInputChange('mpesa_consumer_secret', e.target.value)}
                  placeholder="Enter consumer secret"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createSchool.isPending}
              className="flex-1"
            >
              {createSchool.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering School...
                </>
              ) : (
                'Register School'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolRegistrationModal;
