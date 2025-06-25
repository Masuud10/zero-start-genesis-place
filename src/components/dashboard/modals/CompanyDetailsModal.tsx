
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AuthUser } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState({
    company_name: 'EduFam',
    company_slogan: '',
    company_motto: '',
    website_url: 'https://edufam.com',
    support_email: 'support@edufam.com',
    contact_phone: '',
    headquarters_address: '',
    registration_number: '',
    year_established: 2024,
    company_type: 'EdTech SaaS'
  });

  useEffect(() => {
    if (isOpen) {
      fetchCompanyDetails();
    }
  }, [isOpen]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_details')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company details:', error);
      } else if (data) {
        setDetails({
          company_name: data.company_name || 'EduFam',
          company_slogan: data.company_slogan || '',
          company_motto: data.company_motto || '',
          website_url: data.website_url || 'https://edufam.com',
          support_email: data.support_email || 'support@edufam.com',
          contact_phone: data.contact_phone || '',
          headquarters_address: data.headquarters_address || '',
          registration_number: data.registration_number || '',
          year_established: data.year_established || 2024,
          company_type: data.company_type || 'EdTech SaaS'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('company_details')
        .upsert([details], {
          onConflict: 'id'
        });

      if (error) {
        throw error;
      }

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

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Details
          </DialogTitle>
          <DialogDescription>
            Manage company information and settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={details.company_name}
                onChange={(e) => setDetails(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            
            <div>
              <Label htmlFor="company_type">Company Type</Label>
              <Input
                id="company_type"
                value={details.company_type}
                onChange={(e) => setDetails(prev => ({ ...prev, company_type: e.target.value }))}
                placeholder="e.g., EdTech SaaS"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company_slogan">Company Slogan</Label>
            <Input
              id="company_slogan"
              value={details.company_slogan}
              onChange={(e) => setDetails(prev => ({ ...prev, company_slogan: e.target.value }))}
              placeholder="Company slogan"
            />
          </div>

          <div>
            <Label htmlFor="company_motto">Company Motto</Label>
            <Textarea
              id="company_motto"
              value={details.company_motto}
              onChange={(e) => setDetails(prev => ({ ...prev, company_motto: e.target.value }))}
              placeholder="Company motto or mission statement"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={details.website_url}
                onChange={(e) => setDetails(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={details.support_email}
                onChange={(e) => setDetails(prev => ({ ...prev, support_email: e.target.value }))}
                placeholder="support@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={details.contact_phone}
              onChange={(e) => setDetails(prev => ({ ...prev, contact_phone: e.target.value }))}
              placeholder="Phone number"
            />
          </div>

          <div>
            <Label htmlFor="headquarters_address">Headquarters Address</Label>
            <Textarea
              id="headquarters_address"
              value={details.headquarters_address}
              onChange={(e) => setDetails(prev => ({ ...prev, headquarters_address: e.target.value }))}
              placeholder="Full address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={details.registration_number}
                onChange={(e) => setDetails(prev => ({ ...prev, registration_number: e.target.value }))}
                placeholder="Company registration number"
              />
            </div>
            
            <div>
              <Label htmlFor="year_established">Year Established</Label>
              <Input
                id="year_established"
                type="number"
                value={details.year_established}
                onChange={(e) => setDetails(prev => ({ ...prev, year_established: parseInt(e.target.value) || 2024 }))}
                placeholder="2024"
              />
            </div>
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
