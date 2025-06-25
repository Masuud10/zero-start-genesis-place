
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Globe, Mail, Phone, MapPin, Upload } from 'lucide-react';

const CompanySettings: React.FC = () => {
  const [companyData, setCompanyData] = React.useState({
    name: 'EduFam',
    slogan: 'Empowering Education Through Technology',
    motto: 'Excellence in Educational Management',
    website: 'https://edufam.com',
    email: 'info@edufam.com',
    phone: '+1-234-567-8900',
    address: '123 Education Street, Tech City, TC 12345',
    registrationNumber: 'EDU-2024-001',
    yearEstablished: '2024',
    logoUrl: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving company settings:', companyData);
  };

  const handleLogoUpload = () => {
    console.log('Opening logo upload dialog');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={companyData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input
                value={companyData.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Year Established</Label>
              <Input
                type="number"
                value={companyData.yearEstablished}
                onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Website URL</Label>
              <div className="flex">
                <Globe className="h-4 w-4 mt-3 mr-2 text-gray-400" />
                <Input
                  value={companyData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contact Email</Label>
              <div className="flex">
                <Mail className="h-4 w-4 mt-3 mr-2 text-gray-400" />
                <Input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <div className="flex">
                <Phone className="h-4 w-4 mt-3 mr-2 text-gray-400" />
                <Input
                  value={companyData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company Address</Label>
            <div className="flex">
              <MapPin className="h-4 w-4 mt-3 mr-2 text-gray-400" />
              <Textarea
                value={companyData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company Slogan</Label>
            <Input
              value={companyData.slogan}
              onChange={(e) => handleInputChange('slogan', e.target.value)}
              placeholder="Enter company slogan"
            />
          </div>

          <div className="space-y-2">
            <Label>Company Motto</Label>
            <Textarea
              value={companyData.motto}
              onChange={(e) => handleInputChange('motto', e.target.value)}
              placeholder="Enter company motto"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding & Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {companyData.logoUrl && (
                <img
                  src={companyData.logoUrl}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain border rounded"
                />
              )}
              <Button onClick={handleLogoUpload} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Recommended size: 200x200px, PNG or SVG format
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="min-w-32">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default CompanySettings;
