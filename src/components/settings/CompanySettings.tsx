
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Globe, Mail, Phone, MapPin } from 'lucide-react';

const CompanySettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [companyData, setCompanyData] = useState({
    company_name: 'EduFam',
    company_slogan: '',
    company_motto: '',
    headquarters_address: '',
    contact_phone: '',
    support_email: 'support@edufam.com',
    website_url: 'https://edufam.com',
    company_type: 'EdTech SaaS',
    registration_number: '',
    year_established: 2024,
    incorporation_details: ''
  });

  // Fetch company details
  const { data: companyDetails, isLoading } = useQuery({
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
  });

  // Update company details mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (updatedData: typeof companyData) => {
      const { error } = await supabase
        .from('company_details')
        .upsert(updatedData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-details'] });
      toast({
        title: "Success",
        description: "Company details updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company details",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (companyDetails) {
      setCompanyData(prev => ({
        ...prev,
        ...companyDetails
      }));
    }
  }, [companyDetails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate(companyData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={companyData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="EduFam"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company Type</label>
                <Input
                  value={companyData.company_type}
                  onChange={(e) => handleInputChange('company_type', e.target.value)}
                  placeholder="EdTech SaaS"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Registration Number</label>
                <Input
                  value={companyData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="Company registration number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Year Established</label>
                <Input
                  type="number"
                  value={companyData.year_established}
                  onChange={(e) => handleInputChange('year_established', Number(e.target.value))}
                  placeholder="2024"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Support Email
                </label>
                <Input
                  type="email"
                  value={companyData.support_email}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                  placeholder="support@edufam.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Phone
                </label>
                <Input
                  value={companyData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website URL
                </label>
                <Input
                  type="url"
                  value={companyData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://edufam.com"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Headquarters Address
              </label>
              <Textarea
                value={companyData.headquarters_address}
                onChange={(e) => handleInputChange('headquarters_address', e.target.value)}
                placeholder="Company headquarters address"
                rows={3}
              />
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Slogan</label>
                <Input
                  value={companyData.company_slogan}
                  onChange={(e) => handleInputChange('company_slogan', e.target.value)}
                  placeholder="Empowering Education Through Technology"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company Motto</label>
                <Input
                  value={companyData.company_motto}
                  onChange={(e) => handleInputChange('company_motto', e.target.value)}
                  placeholder="Innovation in Education"
                />
              </div>
            </div>

            {/* Legal Information */}
            <div>
              <label className="text-sm font-medium">Incorporation Details</label>
              <Textarea
                value={companyData.incorporation_details}
                onChange={(e) => handleInputChange('incorporation_details', e.target.value)}
                placeholder="Legal incorporation details and compliance information"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={updateCompanyMutation.isPending}
              className="w-full"
            >
              {updateCompanyMutation.isPending ? 'Updating...' : 'Update Company Details'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettings;
