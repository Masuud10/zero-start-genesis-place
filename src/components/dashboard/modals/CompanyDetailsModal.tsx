import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Globe, Users } from "lucide-react";

interface CompanyDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    industry: string;
    size: string;
    founded: string;
    status: "active" | "inactive";
  };
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  open,
  onOpenChange,
  company,
}) => {
  const [formData, setFormData] = React.useState({
    name: company?.name || "",
    description: company?.description || "",
    address: company?.address || "",
    phone: company?.phone || "",
    email: company?.email || "",
    website: company?.website || "",
    industry: company?.industry || "",
    size: company?.size || "",
    founded: company?.founded || "",
  });

  React.useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        industry: company.industry,
        size: company.size,
        founded: company.founded,
      });
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Company details:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>{company ? "Edit Company" : "Add Company"}</span>
          </DialogTitle>
          <DialogDescription>
            {company
              ? "Update company information and details."
              : "Add a new company to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the company"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Company address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="contact@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="e.g., 50-100 employees"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="founded">Founded</Label>
              <Input
                id="founded"
                value={formData.founded}
                onChange={(e) =>
                  setFormData({ ...formData, founded: e.target.value })
                }
                placeholder="Year founded"
              />
            </div>
          </div>

          {company && (
            <div className="flex items-center space-x-2">
              <Label>Status:</Label>
              <Badge
                variant={company.status === "active" ? "default" : "secondary"}
              >
                {company.status}
              </Badge>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {company ? "Update Company" : "Add Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailsModal;
