
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building, Mail, Phone, Globe, MapPin, FileText, Calendar, Users, Shield, Loader2 } from 'lucide-react';

interface CompanyDetails {
  id?: string;
  company_name: string;
  company_logo_url: string;
  company_slogan: string;
  company_motto: string;
  company_type: string;
  website_url: string;
  support_email: string;
  contact_phone: string;
  headquarters_address: string;
  registration_number: string;
  incorporation_details: string;
  year_established: number;
}

const CompanyManagementModule = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    company_name: 'EduFam Technologies',
    company_logo_url: '',
    company_slogan: 'Empowering Education Through Technology',
    company_motto: 'Excellence in Educational Management',
    company_type: 'EdTech SaaS Platform',
    website_url: 'https://edufam.com',
    support_email: 'support@edufam.com',
    contact_phone: '',
    headquarters_address: '',
    registration_number: '',
    incorporation_details: '',
    year_established: 2024
  });

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching company details...');
      
      const { data, error } = await supabase
        .from('company_details')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, use default values
          console.log('No company details found, using defaults');
        } else {
          console.error('Error fetching company details:', error);
          throw error;
        }
      } else if (data) {
        console.log('Company details fetched:', data);
        setCompanyDetails({
          id: data.id,
          company_name: data.company_name || 'EduFam Technologies',
          company_logo_url: data.company_logo_url || '',
          company_slogan: data.company_slogan || 'Empowering Education Through Technology',
          company_motto: data.company_motto || 'Excellence in Educational Management',
          company_type: data.company_type || 'EdTech SaaS Platform',
          website_url: data.website_url || 'https://edufam.com',
          support_email: data.support_email || 'support@edufam.com',
          contact_phone: data.contact_phone || '',
          headquarters_address: data.headquarters_address || '',
          registration_number: data.registration_number || '',
          incorporation_details: data.incorporation_details || '',
          year_established: data.year_established || 2024
        });
      }
    } catch (error: any) {
      console.error('Error in fetchCompanyDetails:', error);
      toast({
        title: "Error",
        description: `Failed to fetch company details: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyDetails, value: string | number) => {
    setCompanyDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving company details:', companyDetails);

      const saveData = {
        company_name: companyDetails.company_name,
        company_logo_url: companyDetails.company_logo_url,
        company_slogan: companyDetails.company_slogan,
        company_motto: companyDetails.company_motto,
        company_type: companyDetails.company_type,
        website_url: companyDetails.website_url,
        support_email: companyDetails.support_email,
        contact_phone: companyDetails.contact_phone,
        headquarters_address: companyDetails.headquarters_address,
        registration_number: companyDetails.registration_number,
        incorporation_details: companyDetails.incorporation_details,
        year_established: companyDetails.year_established,
        updated_at: new Date().toISOString()
      };

      let result;
      if (companyDetails.id) {
        // Update existing record
        result = await supabase
          .from('company_details')
          .update(saveData)
          .eq('id', companyDetails.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('company_details')
          .insert(saveData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw result.error;
      }

      console.log('Company details saved successfully:', result.data);
      
      // Update local state with returned data
      if (result.data) {
        setCompanyDetails(prev => ({
          ...prev,
          id: result.data.id
        }));
      }

      toast({
        title: "Success",
        description: "Company details saved successfully",
      });

    } catch (error: any) {
      console.error('Error saving company details:', error);
      toast({
        title: "Error",
        description: `Failed to save company details: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading company details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">Manage your company information and settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={companyDetails.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company_type">Company Type</Label>
              <Input
                id="company_type"
                value={companyDetails.company_type}
                onChange={(e) => handleInputChange('company_type', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company_slogan">Company Slogan</Label>
              <Input
                id="company_slogan"
                value={companyDetails.company_slogan}
                onChange={(e) => handleInputChange('company_slogan', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company_motto">Company Motto</Label>
              <Input
                id="company_motto"
                value={companyDetails.company_motto}
                onChange={(e) => handleInputChange('company_motto', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="year_established">Year Established</Label>
              <Input
                id="year_established"
                type="number"
                value={companyDetails.year_established}
                onChange={(e) => handleInputChange('year_established', parseInt(e.target.value) || 2024)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={companyDetails.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={companyDetails.support_email}
                onChange={(e) => handleInputChange('support_email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={companyDetails.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="headquarters_address">Headquarters Address</Label>
              <Textarea
                id="headquarters_address"
                value={companyDetails.headquarters_address}
                onChange={(e) => handleInputChange('headquarters_address', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={companyDetails.registration_number}
                onChange={(e) => handleInputChange('registration_number', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="incorporation_details">Incorporation Details</Label>
              <Textarea
                id="incorporation_details"
                value={companyDetails.incorporation_details}
                onChange={(e) => handleInputChange('incorporation_details', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_logo_url">Company Logo URL</Label>
              <Input
                id="company_logo_url"
                type="url"
                value={companyDetails.company_logo_url}
                onChange={(e) => handleInputChange('company_logo_url', e.target.value)}
              />
            </div>
            {companyDetails.company_logo_url && (
              <div>
                <Label>Logo Preview</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <img
                    src={companyDetails.company_logo_url}
                    alt="Company Logo"
                    className="h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyManagementModule;
