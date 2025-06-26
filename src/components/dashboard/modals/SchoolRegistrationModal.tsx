
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

  const createSchool = useMutation({
    mutationFn: async (data: SchoolFormData) => {
      console.log('🏫 Creating school with data:', data);
      
      const { data: result, error } = await supabase.rpc('create_comprehensive_school', {
        // Basic Information
        school_name: data.school_name,
        school_email: data.school_email,
        school_phone: data.school_phone,
        school_address: data.school_address,
        
        // School Details
        school_type: data.school_type,
        curriculum_type: data.curriculum_type,
        term_structure: data.term_structure,
        registration_number: data.registration_number || null,
        year_established: data.year_established,
        
        // Branding
        logo_url: data.logo_url || null,
        website_url: data.website_url || null,
        motto: data.motto || null,
        slogan: data.slogan || null,
        
        // Owner Information
        owner_name: data.owner_name || null,
        owner_email: data.owner_email || null,
        owner_phone: data.owner_phone || null,
        owner_information: data.owner_information || null,
        
        // Principal Information
        principal_name: data.principal_name || null,
        principal_email: data.principal_email || null,
        principal_contact: data.principal_contact || null,
        
        // MPESA Configuration
        mpesa_paybill_number: data.mpesa_paybill_number || null,
        mpesa_consumer_key: data.mpesa_consumer_key || null,
        mpesa_consumer_secret: data.mpesa_consumer_secret || null,
        mpesa_passkey: data.mpesa_passkey || null
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
          description: result.message || "School registered successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['schools'] });
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
      } else {
        toast({
          title: "Error",
          description: result?.error || "Failed to register school",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('🏫 School creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register school",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.school_name || !formData.school_email || !formData.school_phone || !formData.school_address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required basic information fields",
        variant: "destructive",
      });
      return;
    }

    createSchool.mutate(formData);
  };

  const handleInputChange = (field: keyof SchoolFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            Register a new school with comprehensive setup including owner, principal, and payment configuration
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium">Basic School Information</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="school_name">School Name *</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => handleInputChange('school_name', e.target.value)}
                  placeholder="Enter school name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="school_email">School Email *</Label>
                <Input
                  id="school_email"
                  type="email"
                  value={formData.school_email}
                  onChange={(e) => handleInputChange('school_email', e.target.value)}
                  placeholder="admin@school.edu"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="school_phone">School Phone *</Label>
                <Input
                  id="school_phone"
                  value={formData.school_phone}
                  onChange={(e) => handleInputChange('school_phone', e.target.value)}
                  placeholder="+254 xxx xxx xxx"
                  required
                />
              </div>
              <div>
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="Official registration number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="school_address">School Address *</Label>
              <Textarea
                id="school_address"
                value={formData.school_address}
                onChange={(e) => handleInputChange('school_address', e.target.value)}
                placeholder="Complete school address"
                required
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* School Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <h4 className="font-medium">School Configuration</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="curriculum_type">Curriculum</Label>
                <Select value={formData.curriculum_type} onValueChange={(value: 'cbc' | 'igcse' | 'cambridge') => handleInputChange('curriculum_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbc">CBC (Kenyan)</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="cambridge">Cambridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year_established">Year Established</Label>
                <Input
                  id="year_established"
                  type="number"
                  value={formData.year_established}
                  onChange={(e) => handleInputChange('year_established', parseInt(e.target.value) || new Date().getFullYear())}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://school.edu"
                />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="motto">School Motto</Label>
                <Input
                  id="motto"
                  value={formData.motto}
                  onChange={(e) => handleInputChange('motto', e.target.value)}
                  placeholder="School motto"
                />
              </div>
              <div>
                <Label htmlFor="slogan">School Slogan</Label>
                <Input
                  id="slogan"
                  value={formData.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder="School slogan"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Owner Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <h4 className="font-medium">School Owner Information</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  placeholder="School owner's full name"
                />
              </div>
              <div>
                <Label htmlFor="owner_email">Owner Email</Label>
                <Input
                  id="owner_email"
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => handleInputChange('owner_email', e.target.value)}
                  placeholder="owner@school.edu"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner_phone">Owner Phone</Label>
                <Input
                  id="owner_phone"
                  value={formData.owner_phone}
                  onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                  placeholder="+254 xxx xxx xxx"
                />
              </div>
              <div>
                <Label htmlFor="owner_information">Additional Owner Info</Label>
                <Input
                  id="owner_information"
                  value={formData.owner_information}
                  onChange={(e) => handleInputChange('owner_information', e.target.value)}
                  placeholder="Additional information"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Principal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              <h4 className="font-medium">Principal Information</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="principal_name">Principal Name</Label>
                <Input
                  id="principal_name"
                  value={formData.principal_name}
                  onChange={(e) => handleInputChange('principal_name', e.target.value)}
                  placeholder="Principal's full name"
                />
              </div>
              <div>
                <Label htmlFor="principal_email">Principal Email</Label>
                <Input
                  id="principal_email"
                  type="email"
                  value={formData.principal_email}
                  onChange={(e) => handleInputChange('principal_email', e.target.value)}
                  placeholder="principal@school.edu"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="principal_contact">Principal Contact</Label>
              <Input
                id="principal_contact"
                value={formData.principal_contact}
                onChange={(e) => handleInputChange('principal_contact', e.target.value)}
                placeholder="+254 xxx xxx xxx"
              />
            </div>
          </div>

          <Separator />

          {/* MPESA Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <h4 className="font-medium">MPESA Payment Configuration</h4>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mpesa_paybill_number">Paybill Number</Label>
                <Input
                  id="mpesa_paybill_number"
                  value={formData.mpesa_paybill_number}
                  onChange={(e) => handleInputChange('mpesa_paybill_number', e.target.value)}
                  placeholder="123456"
                />
              </div>
              <div>
                <Label htmlFor="mpesa_consumer_key">Consumer Key</Label>
                <Input
                  id="mpesa_consumer_key"
                  value={formData.mpesa_consumer_key}
                  onChange={(e) => handleInputChange('mpesa_consumer_key', e.target.value)}
                  placeholder="Consumer key from Safaricom"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mpesa_consumer_secret">Consumer Secret</Label>
                <Input
                  id="mpesa_consumer_secret"
                  type="password"
                  value={formData.mpesa_consumer_secret}
                  onChange={(e) => handleInputChange('mpesa_consumer_secret', e.target.value)}
                  placeholder="Consumer secret from Safaricom"
                />
              </div>
              <div>
                <Label htmlFor="mpesa_passkey">Passkey</Label>
                <Input
                  id="mpesa_passkey"
                  type="password"
                  value={formData.mpesa_passkey}
                  onChange={(e) => handleInputChange('mpesa_passkey', e.target.value)}
                  placeholder="Passkey from Safaricom"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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
