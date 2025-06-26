
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthUser } from '@/types/auth';
import { Building2, Loader2 } from 'lucide-react';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    company_name: 'EduFam',
    company_slogan: '',
    company_motto: '',
    website_url: 'https://edufam.com',
    support_email: 'support@edufam.com',
    contact_phone: '',
    headquarters_address: '',
    year_established: 2024,
    registration_number: '',
    company_type: 'EdTech SaaS',
    incorporation_details: ''
  });

  // Fetch company details
  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company-details'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_details')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: isOpen
  });

  useEffect(() => {
    if (companyData) {
      setFormData({
        company_name: companyData.company_name || 'EduFam',
        company_slogan: companyData.company_slogan || '',
        company_motto: companyData.company_motto || '',
        website_url: companyData.website_url || 'https://edufam.com',
        support_email: companyData.support_email || 'support@edufam.com',
        contact_phone: companyData.contact_phone || '',
        headquarters_address: companyData.headquarters_address || '',
        year_established: companyData.year_established || 2024,
        registration_number: companyData.registration_number || '',
        company_type: companyData.company_type || 'EdTech SaaS',
        incorporation_details: companyData.incorporation_details || ''
      });
    }
  }, [companyData]);

  const updateCompanyDetails = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('company_details')
        .upsert({
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['company-details'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company details",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyDetails.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading company details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Details
          </DialogTitle>
          <DialogDescription>
            Manage EduFam company information and branding
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-h-96 overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company_type">Company Type</Label>
                <Input
                  id="company_type"
                  value={formData.company_type}
                  onChange={(e) => handleInputChange('company_type', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company_slogan">Company Slogan</Label>
              <Input
                id="company_slogan"
                value={formData.company_slogan}
                onChange={(e) => handleInputChange('company_slogan', e.target.value)}
                placeholder="Your company slogan"
              />
            </div>

            <div>
              <Label htmlFor="company_motto">Company Motto</Label>
              <Textarea
                id="company_motto"
                value={formData.company_motto}
                onChange={(e) => handleInputChange('company_motto', e.target.value)}
                placeholder="Your company motto or mission statement"
                rows={2}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+254 xxx xxx xxx"
              />
            </div>

            <div>
              <Label htmlFor="headquarters_address">Headquarters Address</Label>
              <Textarea
                id="headquarters_address"
                value={formData.headquarters_address}
                onChange={(e) => handleInputChange('headquarters_address', e.target.value)}
                placeholder="Physical address of headquarters"
                rows={2}
              />
            </div>
          </div>

          {/* Legal Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Legal Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year_established">Year Established</Label>
                <Input
                  id="year_established"
                  type="number"
                  value={formData.year_established}
                  onChange={(e) => handleInputChange('year_established', parseInt(e.target.value) || 2024)}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="Business registration number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="incorporation_details">Incorporation Details</Label>
              <Textarea
                id="incorporation_details"
                value={formData.incorporation_details}
                onChange={(e) => handleInputChange('incorporation_details', e.target.value)}
                placeholder="Additional incorporation or legal details"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateCompanyDetails.isPending}
              className="flex-1"
            >
              {updateCompanyDetails.isPending ? 'Updating...' : 'Save Details'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailsModal;
