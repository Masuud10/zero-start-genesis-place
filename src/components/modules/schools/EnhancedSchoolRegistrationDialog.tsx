
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
import { SchoolService, CreateSchoolRequest } from '@/services/schoolService';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X, Image, Building2, Mail, Phone, MapPin, Calendar, User, Globe, Hash, FileText, CreditCard, Eye, EyeOff } from 'lucide-react';

interface EnhancedSchoolRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MpesaCredentials {
  mpesa_paybill_number: string;
  mpesa_consumer_key: string;
  mpesa_consumer_secret: string;
  mpesa_passkey: string;
}

const EnhancedSchoolRegistrationDialog: React.FC<EnhancedSchoolRegistrationDialogProps> = ({
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
    curriculumType: 'cbc'
  });

  const [mpesaCredentials, setMpesaCredentials] = useState<MpesaCredentials>({
    mpesa_paybill_number: '',
    mpesa_consumer_key: '',
    mpesa_consumer_secret: '',
    mpesa_passkey: ''
  });

  const [showSecrets, setShowSecrets] = useState({
    consumer_key: false,
    consumer_secret: false,
    passkey: false
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

    // Required owner information
    if (!formData.ownerName?.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!formData.ownerPhone?.trim()) {
      newErrors.ownerPhone = 'Owner phone is required';
    }
    if (!formData.ownerEmail?.trim()) {
      newErrors.ownerEmail = 'Owner email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
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

  const handleMpesaInputChange = (field: keyof MpesaCredentials, value: string) => {
    setMpesaCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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

  const saveMpesaCredentials = async (schoolId: string) => {
    try {
      const { error } = await supabase
        .from('finance_settings')
        .upsert({
          school_id: schoolId,
          mpesa_paybill_number: mpesaCredentials.mpesa_paybill_number,
          mpesa_consumer_key: mpesaCredentials.mpesa_consumer_key,
          mpesa_consumer_secret: mpesaCredentials.mpesa_consumer_secret,
          mpesa_passkey: mpesaCredentials.mpesa_passkey,
          late_fee_percentage: 0,
          late_fee_grace_days: 7,
          tax_rate: 0,
          settings_data: {
            currency: 'KES',
            payment_methods: ['cash', 'mpesa'],
            auto_generate_receipts: true,
            send_payment_notifications: true,
            allow_partial_payments: true,
            require_payment_approval: false,
          } as any
        }, {
          onConflict: 'school_id'
        });

      if (error) {
        console.error('Error saving MPESA credentials:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save MPESA credentials:', error);
      // Don't fail the entire registration for MPESA credentials
      toast({
        title: "Warning",
        description: "School created successfully but MPESA credentials could not be saved",
        variant: "destructive"
      });
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
      
      let schoolData = { ...formData };

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
      
      if (result.success && result.school_id) {
        // Save MPESA credentials if provided
        if (mpesaCredentials.mpesa_paybill_number || mpesaCredentials.mpesa_consumer_key) {
          await saveMpesaCredentials(result.school_id);
        }

        toast({
          title: "Success",
          description: result.message || "School registered successfully",
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register school",
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

  const resetForm = () => {
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
      curriculumType: 'cbc'
    });
    setMpesaCredentials({
      mpesa_paybill_number: '',
      mpesa_consumer_key: '',
      mpesa_consumer_secret: '',
      mpesa_passkey: ''
    });
    setLogoFile(null);
    setLogoPreview('');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Register New School
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Add a new educational institution to the EduFam network
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* School Branding Section */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Image className="h-5 w-5" />
              School Branding & Identity
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Label htmlFor="logo-upload">School Logo</Label>
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-full h-full object-contain rounded-lg" 
                        />
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
                        Upload Logo
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

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Basic Information Section */}
          <div className="bg-blue-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic School Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full school name"
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

              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    placeholder="Enter unique registration number"
                    className={`pl-10 ${errors.registration_number ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.registration_number && <p className="text-sm text-red-500">{errors.registration_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_established">Year of Establishment *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="year_established"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.year_established}
                    onChange={(e) => handleInputChange('year_established', parseInt(e.target.value))}
                    className={`pl-10 ${errors.year_established ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.year_established && <p className="text-sm text-red-500">{errors.year_established}</p>}
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="curriculumType">Curriculum Type</Label>
                <Select 
                  value={formData.curriculumType} 
                  onValueChange={(value) => handleInputChange('curriculumType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbc">CBC (Competency-Based Curriculum)</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-green-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">School Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="school@example.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone Numbers *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+254 700 000 000"
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website_url">School Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://www.yourschool.com"
                    className={`pl-10 ${errors.website_url ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.website_url && <p className="text-sm text-red-500">{errors.website_url}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Physical Location / Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter complete physical address"
                    rows={3}
                    className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* School Owner Information Section */}
          <div className="bg-purple-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              School Owner Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Enter owner's full name"
                  className={errors.ownerName ? 'border-red-500' : ''}
                />
                {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Owner Phone *</Label>
                <Input
                  id="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  placeholder="+254 700 000 000"
                  className={errors.ownerPhone ? 'border-red-500' : ''}
                />
                {errors.ownerPhone && <p className="text-sm text-red-500">{errors.ownerPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email *</Label>
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="owner_information">Additional Owner Information</Label>
                <Textarea
                  id="owner_information"
                  value={formData.owner_information}
                  onChange={(e) => handleInputChange('owner_information', e.target.value)}
                  placeholder="Enter additional information about the school owner"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* MPESA Configuration Section */}
          <div className="bg-orange-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              MPESA Payment Configuration (Optional)
            </h3>
            <p className="text-sm text-gray-600">
              Configure MPESA payment integration for fee collection. These can be set up later if not available now.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mpesa_paybill_number">MPESA Paybill Number</Label>
                <Input
                  id="mpesa_paybill_number"
                  value={mpesaCredentials.mpesa_paybill_number}
                  onChange={(e) => handleMpesaInputChange('mpesa_paybill_number', e.target.value)}
                  placeholder="Enter paybill number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa_consumer_key">Consumer Key</Label>
                <div className="relative">
                  <Input
                    id="mpesa_consumer_key"
                    type={showSecrets.consumer_key ? 'text' : 'password'}
                    value={mpesaCredentials.mpesa_consumer_key}
                    onChange={(e) => handleMpesaInputChange('mpesa_consumer_key', e.target.value)}
                    placeholder="Enter consumer key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('consumer_key')}
                  >
                    {showSecrets.consumer_key ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa_consumer_secret">Consumer Secret</Label>
                <div className="relative">
                  <Input
                    id="mpesa_consumer_secret"
                    type={showSecrets.consumer_secret ? 'text' : 'password'}
                    value={mpesaCredentials.mpesa_consumer_secret}
                    onChange={(e) => handleMpesaInputChange('mpesa_consumer_secret', e.target.value)}
                    placeholder="Enter consumer secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('consumer_secret')}
                  >
                    {showSecrets.consumer_secret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa_passkey">Passkey</Label>
                <div className="relative">
                  <Input
                    id="mpesa_passkey"
                    type={showSecrets.passkey ? 'text' : 'password'}
                    value={mpesaCredentials.mpesa_passkey}
                    onChange={(e) => handleMpesaInputChange('mpesa_passkey', e.target.value)}
                    placeholder="Enter passkey"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('passkey')}
                  >
                    {showSecrets.passkey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
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

export default EnhancedSchoolRegistrationDialog;
