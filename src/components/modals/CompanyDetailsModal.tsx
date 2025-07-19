import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2, Mail, Phone, MapPin } from "lucide-react";

interface CompanyDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "EduFam",
    description: "Comprehensive school management platform",
    email: "contact@edufam.com",
    phone: "+254 700 123 456",
    address: "Nairobi, Kenya",
    website: "https://edufam.com",
    logo: "",
    tagline: "Empowering Education Through Technology",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate saving company details
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Company Details Updated",
        description: "Company information has been saved successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof companyData, value: string) => {
    setCompanyData({ ...companyData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Company Details</span>
          </DialogTitle>
          <DialogDescription>
            Manage your company information and branding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Company Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company-tagline">Tagline</Label>
                <Input
                  id="company-tagline"
                  value={companyData.tagline}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company-description">Description</Label>
                <Textarea
                  id="company-description"
                  value={companyData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company-phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number</span>
                </Label>
                <Input
                  id="company-phone"
                  value={companyData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company-address" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </Label>
                <Textarea
                  id="company-address"
                  value={companyData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company-website">Website URL</Label>
                <Input
                  id="company-website"
                  type="url"
                  value={companyData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div>
            <h3 className="text-lg font-medium mb-3">Branding</h3>
            <div>
              <Label htmlFor="company-logo">Logo URL</Label>
              <Input
                id="company-logo"
                type="url"
                value={companyData.logo}
                onChange={(e) => handleInputChange("logo", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Provide a URL to your company logo
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailsModal;