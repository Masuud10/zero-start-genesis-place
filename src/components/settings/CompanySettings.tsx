
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Palette,
  Upload,
  Save
} from 'lucide-react';

const CompanySettings: React.FC = () => {
  const { toast } = useToast();
  
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'EduFam Systems',
    companyDescription: 'Comprehensive school management system',
    website: 'https://www.edufam.com',
    email: 'info@edufam.com',
    phone: '+254-700-000-000',
    address: 'Nairobi, Kenya',
    logo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981'
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    userRegistration: true,
    emailVerification: true,
    multiTenant: true,
    backupEnabled: true
  });

  const handleSaveCompanyInfo = () => {
    toast({
      title: "Company Information Updated",
      description: "Company settings have been saved successfully.",
    });
  };

  const handleSaveSystemSettings = () => {
    toast({
      title: "System Settings Updated",
      description: "System configuration has been saved successfully.",
    });
  };

  const handleLogoUpload = () => {
    toast({
      title: "Logo Upload",
      description: "Logo upload functionality will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={companyInfo.companyName}
              onChange={(e) => 
                setCompanyInfo(prev => ({ ...prev, companyName: e.target.value }))
              }
              placeholder="Your company name"
            />
          </div>

          <div>
            <Label htmlFor="company_description">Company Description</Label>
            <Textarea
              id="company_description"
              value={companyInfo.companyDescription}
              onChange={(e) => 
                setCompanyInfo(prev => ({ ...prev, companyDescription: e.target.value }))
              }
              placeholder="Brief description of your company"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_website">Website</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-md">
                  <Globe className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  id="company_website"
                  value={companyInfo.website}
                  onChange={(e) => 
                    setCompanyInfo(prev => ({ ...prev, website: e.target.value }))
                  }
                  placeholder="https://www.yourcompany.com"
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company_email">Contact Email</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-md">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  id="company_email"
                  value={companyInfo.email}
                  onChange={(e) => 
                    setCompanyInfo(prev => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="info@yourcompany.com"
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_phone">Phone Number</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-md">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  id="company_phone"
                  value={companyInfo.phone}
                  onChange={(e) => 
                    setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1-555-000-0000"
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company_address">Address</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-md">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  id="company_address"
                  value={companyInfo.address}
                  onChange={(e) => 
                    setCompanyInfo(prev => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="City, Country"
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveCompanyInfo} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Company Information
          </Button>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding & Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <Button onClick={handleLogoUpload} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={companyInfo.primaryColor}
                  onChange={(e) => 
                    setCompanyInfo(prev => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={companyInfo.primaryColor}
                  onChange={(e) => 
                    setCompanyInfo(prev => ({ ...prev, primaryColor: e.target.value }))
                  }
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={companyInfo.secondaryColor}
                  onChange={(e) => 
                    setCompanyInfo(prev => ({ ...prev, secondaryColor: e.target.value }))
                  }
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={companyInfo.secondaryColor}
                  onChange={(e) => 
                    setCompanyInfo(prev => ({ ...prev, secondaryColor: e.target.value }))
                  }
                  placeholder="#10B981"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-xs text-gray-500">Put system in maintenance mode</p>
            </div>
            <Switch
              checked={systemSettings.maintenanceMode}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>User Registration</Label>
              <p className="text-xs text-gray-500">Allow new user registrations</p>
            </div>
            <Switch
              checked={systemSettings.userRegistration}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, userRegistration: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Verification</Label>
              <p className="text-xs text-gray-500">Require email verification for new users</p>
            </div>
            <Switch
              checked={systemSettings.emailVerification}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, emailVerification: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Multi-Tenant Mode</Label>
              <p className="text-xs text-gray-500">Enable multi-school support</p>
            </div>
            <Switch
              checked={systemSettings.multiTenant}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, multiTenant: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Automated Backups</Label>
              <p className="text-xs text-gray-500">Enable automatic daily backups</p>
            </div>
            <Switch
              checked={systemSettings.backupEnabled}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, backupEnabled: checked }))
              }
            />
          </div>

          <Button onClick={handleSaveSystemSettings} className="w-full">
            Save System Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettings;
