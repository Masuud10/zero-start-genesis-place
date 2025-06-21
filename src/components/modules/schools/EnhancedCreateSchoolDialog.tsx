
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SchoolService, CreateSchoolRequest } from '@/services/schoolService';
import { Plus, Building2, Upload, Globe, Mail, Phone, MapPin, FileText, Calendar, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface EnhancedCreateSchoolDialogProps {
  onSchoolCreated?: () => void;
}

const EnhancedCreateSchoolDialog = ({ onSchoolCreated }: EnhancedCreateSchoolDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    curriculumType: 'cbc'
  });

  const handleInputChange = (field: keyof CreateSchoolRequest, value: string | number) => {
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

    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Contact phone number is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Validation Error",
        description: "Physical address is required",
        variant: "destructive"
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    // Website URL validation (if provided)
    if (formData.website_url && formData.website_url.trim()) {
      try {
        new URL(formData.website_url);
      } catch {
        toast({
          title: "Validation Error",
          description: "Please enter a valid website URL",
          variant: "destructive"
        });
        return false;
      }
    }

    // Year validation
    const currentYear = new Date().getFullYear();
    if (formData.year_established && (formData.year_established < 1800 || formData.year_established > currentYear)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid year of establishment",
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
      console.log('🏫 EnhancedCreateSchoolDialog: Submitting school creation', formData);
      
      const result = await SchoolService.createSchool(formData);

      if (result.success) {
        toast({
          title: "School Registered Successfully",
          description: result.message || "The school has been registered and is ready for use.",
        });

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
          curriculumType: 'cbc'
        });

        setOpen(false);
        onSchoolCreated?.();
      } else {
        toast({
          title: "Failed to Register School",
          description: result.error || "An unexpected error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('🏫 EnhancedCreateSchoolDialog: Error creating school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register school",
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
          Register New School
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            School Registration Form
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic School Information
              </CardTitle>
              <CardDescription>
                Essential details about the school institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    School Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Sunshine Primary School"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_type" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    School Type *
                  </Label>
                  <Select value={formData.school_type} onValueChange={(value) => handleInputChange('school_type', value)}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    School Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@school.edu"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Contact Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+254 123 456 789"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Physical Address *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full physical address of the school"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Details
              </CardTitle>
              <CardDescription>
                Optional information to complete the school profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_url" className="flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    School Logo URL
                  </Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url" className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    School Website
                  </Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://www.school.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_number" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Registration Number
                  </Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    placeholder="REG/2024/001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_established" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Year Established
                  </Label>
                  <Input
                    id="year_established"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.year_established}
                    onChange={(e) => handleInputChange('year_established', parseInt(e.target.value) || new Date().getFullYear())}
                    placeholder={new Date().getFullYear().toString()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="term_structure">Term Structure</Label>
                  <Select value={formData.term_structure} onValueChange={(value) => handleInputChange('term_structure', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term structure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-term">3-Term System</SelectItem>
                      <SelectItem value="2-semester">2-Semester System</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curriculumType">Curriculum Type</Label>
                  <Select value={formData.curriculumType} onValueChange={(value) => handleInputChange('curriculumType', value)}>
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
            </CardContent>
          </Card>

          {/* School Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                School Owner Information (Optional)
              </CardTitle>
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
              <div className="space-y-2">
                <Label htmlFor="owner_information">Additional Owner Information</Label>
                <Textarea
                  id="owner_information"
                  value={formData.owner_information}
                  onChange={(e) => handleInputChange('owner_information', e.target.value)}
                  placeholder="Additional details about the school owner..."
                  rows={3}
                />
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
              {isLoading ? 'Registering School...' : 'Register School'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateSchoolDialog;
