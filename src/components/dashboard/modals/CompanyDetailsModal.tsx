
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthUser } from '@/types/auth';
import { Building2, Globe, Mail, Phone, Loader2 } from 'lucide-react';

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
  const [saving, setSaving] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: 'EduFam',
    companyType: 'EdTech SaaS',
    yearEstablished: 2024,
    registrationNumber: '',
    headquartersAddress: '',
    contactPhone: '',
    supportEmail: 'support@edufam.com',
    websiteUrl: 'https://edufam.com',
    companyMotto: '',
    companySlogan: '',
    incorporationDetails: '',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Company details updated successfully",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating company details:', error);
      toast({
        title: "Error",
        description: "Failed to update company details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Details
          </DialogTitle>
          <DialogDescription>
            Manage company information and contact details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Alert>
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              Update company information that will be displayed across the platform.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyData.companyName}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, companyName: e.target.value }))
                }
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <Label htmlFor="company-type">Company Type</Label>
              <Input
                id="company-type"
                value={companyData.companyType}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, companyType: e.target.value }))
                }
                placeholder="Enter company type"
              />
            </div>
            
            <div>
              <Label htmlFor="year-established">Year Established</Label>
              <Input
                id="year-established"
                type="number"
                value={companyData.yearEstablished}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, yearEstablished: parseInt(e.target.value) }))
                }
                placeholder="Enter year established"
              />
            </div>
            
            <div>
              <Label htmlFor="registration-number">Registration Number</Label>
              <Input
                id="registration-number"
                value={companyData.registrationNumber}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, registrationNumber: e.target.value }))
                }
                placeholder="Enter registration number"
              />
            </div>
            
            <div>
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={companyData.contactPhone}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, contactPhone: e.target.value }))
                }
                placeholder="Enter contact phone"
              />
            </div>
            
            <div>
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                value={companyData.supportEmail}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, supportEmail: e.target.value }))
                }
                placeholder="Enter support email"
              />
            </div>
            
            <div>
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                type="url"
                value={companyData.websiteUrl}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, websiteUrl: e.target.value }))
                }
                placeholder="Enter website URL"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="headquarters-address">Headquarters Address</Label>
            <Textarea
              id="headquarters-address"
              value={companyData.headquartersAddress}
              onChange={(e) => 
                setCompanyData(prev => ({ ...prev, headquartersAddress: e.target.value }))
              }
              placeholder="Enter headquarters address"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-motto">Company Motto</Label>
              <Input
                id="company-motto"
                value={companyData.companyMotto}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, companyMotto: e.target.value }))
                }
                placeholder="Enter company motto"
              />
            </div>
            
            <div>
              <Label htmlFor="company-slogan">Company Slogan</Label>
              <Input
                id="company-slogan"
                value={companyData.companySlogan}
                onChange={(e) => 
                  setCompanyData(prev => ({ ...prev, companySlogan: e.target.value }))
                }
                placeholder="Enter company slogan"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="incorporation-details">Incorporation Details</Label>
            <Textarea
              id="incorporation-details"
              value={companyData.incorporationDetails}
              onChange={(e) => 
                setCompanyData(prev => ({ ...prev, incorporationDetails: e.target.value }))
              }
              placeholder="Enter incorporation details"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Details'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailsModal;
