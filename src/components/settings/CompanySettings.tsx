
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building2, Globe, Mail } from 'lucide-react';

const CompanySettings: React.FC = () => {
  const { toast } = useToast();

  const handleUpdateCompany = () => {
    toast({
      title: "Company Settings Updated",
      description: "Company information has been updated successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            defaultValue="EduFam"
            placeholder="Company name"
          />
        </div>

        <div>
          <Label htmlFor="company_email">Company Email</Label>
          <Input
            id="company_email"
            type="email"
            defaultValue="admin@edufam.com"
            placeholder="Company contact email"
          />
        </div>

        <div>
          <Label htmlFor="company_phone">Company Phone</Label>
          <Input
            id="company_phone"
            defaultValue="+254 700 000 000"
            placeholder="Company phone number"
          />
        </div>

        <div>
          <Label htmlFor="company_address">Company Address</Label>
          <Textarea
            id="company_address"
            defaultValue="Nairobi, Kenya"
            placeholder="Company physical address"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="company_website">Company Website</Label>
          <Input
            id="company_website"
            type="url"
            defaultValue="https://edufam.com"
            placeholder="Company website URL"
          />
        </div>

        <Button onClick={handleUpdateCompany} className="w-full">
          Update Company Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanySettings;
