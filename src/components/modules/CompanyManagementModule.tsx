
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CompanyDetails {
  id?: string;
  company_name: string;
  company_logo_url: string;
  company_slogan: string;
  company_motto: string;
  website_url: string;
  support_email: string;
  contact_phone: string;
  headquarters_address: string;
  registration_number: string;
  incorporation_details: string;
  year_established: number;
  company_type: string;
}

const CompanyManagementModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    company_name: 'EduFam',
    company_logo_url: '',
    company_slogan: '',
    company_motto: '',
    website_url: 'https://edufam.com',
    support_email: 'support@edufam.com',
    contact_phone: '',
    headquarters_address: '',
    registration_number: '',
    incorporation_details: '',
    year_established: 2024,
    company_type: 'EdTech SaaS'
  });

  // Permission check
  if (!user || user.role !== 'edufam_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can access company management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_details')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCompanyDetails({
          id: data.id,
          company_name: data.company_name || 'EduFam',
          company_logo_url: data.company_logo_url || '',
          company_slogan: data.company_slogan || '',
          company_motto: data.company_motto || '',
          website_url: data.website_url || 'https://edufam.com',
          support_email: data.support_email || 'support@edufam.com',
          contact_phone: data.contact_phone || '',
          headquarters_address: data.headquarters_address || '',
          registration_number: data.registration_number || '',
          incorporation_details: data.incorporation_details || '',
          year_established: data.year_established || 2024,
          company_type: data.company_type || 'EdTech SaaS'
        });
      }
    } catch (error: any) {
      console.error('Error fetching company details:', error);
      toast({
        title: "Error",
        description: "Failed to load company details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyDetails = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('company_details')
        .upsert({
          ...companyDetails,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company details saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving company details:', error);
      toast({
        title: "Error",
        description: "Failed to save company details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const handleInputChange = (field: keyof CompanyDetails, value: string | number) => {
    setCompanyDetails(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading company details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Building2 className="h-6 w-6" />
          Company Management
        </h2>
        <p className="text-muted-foreground">
          Manage EduFam company information and details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={companyDetails.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <Label htmlFor="company_type">Company Type</Label>
              <Input
                id="company_type"
                value={companyDetails.company_type}
                onChange={(e) => handleInputChange('company_type', e.target.value)}
                placeholder="Enter company type"
              />
            </div>

            <div>
              <Label htmlFor="year_established">Year Established</Label>
              <Input
                id="year_established"
                type="number"
                value={companyDetails.year_established}
                onChange={(e) => handleInputChange('year_established', parseInt(e.target.value) || 2024)}
                placeholder="Enter establishment year"
              />
            </div>

            <div>
              <Label htmlFor="company_slogan">Company Slogan</Label>
              <Input
                id="company_slogan"
                value={companyDetails.company_slogan}
                onChange={(e) => handleInputChange('company_slogan', e.target.value)}
                placeholder="Enter company slogan"
              />
            </div>

            <div>
              <Label htmlFor="company_motto">Company Motto</Label>
              <Input
                id="company_motto"
                value={companyDetails.company_motto}
                onChange={(e) => handleInputChange('company_motto', e.target.value)}
                placeholder="Enter company motto"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={companyDetails.support_email}
                onChange={(e) => handleInputChange('support_email', e.target.value)}
                placeholder="Enter support email"
              />
            </div>

            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={companyDetails.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="Enter contact phone"
              />
            </div>

            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={companyDetails.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                placeholder="Enter website URL"
              />
            </div>

            <div>
              <Label htmlFor="headquarters_address">Headquarters Address</Label>
              <Textarea
                id="headquarters_address"
                value={companyDetails.headquarters_address}
                onChange={(e) => handleInputChange('headquarters_address', e.target.value)}
                placeholder="Enter headquarters address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={companyDetails.registration_number}
                onChange={(e) => handleInputChange('registration_number', e.target.value)}
                placeholder="Enter registration number"
              />
            </div>

            <div>
              <Label htmlFor="incorporation_details">Incorporation Details</Label>
              <Textarea
                id="incorporation_details"
                value={companyDetails.incorporation_details}
                onChange={(e) => handleInputChange('incorporation_details', e.target.value)}
                placeholder="Enter incorporation details"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_logo_url">Company Logo URL</Label>
              <Input
                id="company_logo_url"
                type="url"
                value={companyDetails.company_logo_url}
                onChange={(e) => handleInputChange('company_logo_url', e.target.value)}
                placeholder="Enter logo URL"
              />
            </div>
            
            {companyDetails.company_logo_url && (
              <div className="mt-2">
                <Label>Logo Preview</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img 
                    src={companyDetails.company_logo_url} 
                    alt="Company Logo" 
                    className="h-16 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={saveCompanyDetails} 
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Company Details
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CompanyManagementModule;
