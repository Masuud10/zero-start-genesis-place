
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, Globe, Mail, Phone, FileText } from 'lucide-react';

const CompanySettings: React.FC = () => {
  const [companyData, setCompanyData] = React.useState({
    name: 'EduFam',
    slogan: 'Empowering Education Through Technology',
    motto: 'Excellence in Educational Management',
    address: 'Nairobi, Kenya',
    phone: '+254 700 000 000',
    email: 'info@edufam.com',
    website: 'https://edufam.com',
    logoUrl: '',
    description: 'EduFam is a comprehensive school management system designed to streamline educational processes and enhance learning outcomes.',
    yearEstablished: '2024',
    registrationNumber: 'EDU/2024/001'
  });

  const handleSave = () => {
    console.log('Saving company settings:', companyData);
  };

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
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
              <Label>Year Established</Label>
              <Input
                value={companyData.yearEstablished}
                onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
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
              <Label>Logo URL</Label>
              <Input
                value={companyData.logoUrl}
                onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company Slogan</Label>
            <Input
              value={companyData.slogan}
              onChange={(e) => handleInputChange('slogan', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Company Motto</Label>
            <Input
              value={companyData.motto}
              onChange={(e) => handleInputChange('motto', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Company Description</Label>
            <Textarea
              value={companyData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                type="email"
                value={companyData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                value={companyData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website URL
              </Label>
              <Input
                value={companyData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={companyData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Branding Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
            <div className="text-center space-y-2">
              {companyData.logoUrl && (
                <img
                  src={companyData.logoUrl}
                  alt="Company Logo"
                  className="h-16 w-16 mx-auto rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <h2 className="text-2xl font-bold text-gray-900">{companyData.name}</h2>
              <p className="text-blue-600 font-medium">{companyData.slogan}</p>
              <p className="text-sm text-gray-600 italic">"{companyData.motto}"</p>
              <div className="text-sm text-gray-500 space-y-1 mt-4">
                <p>{companyData.address}</p>
                <p>{companyData.email} • {companyData.phone}</p>
                <p>{companyData.website}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Company Settings
        </Button>
      </div>
    </div>
  );
};

export default CompanySettings;
