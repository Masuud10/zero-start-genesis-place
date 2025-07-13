import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { School } from "lucide-react";

interface CreateSchoolDialogProps {
  children: React.ReactNode;
  onSchoolCreated?: () => void;
}

interface SchoolCreationResponse {
  success?: boolean;
  school_id?: string;
  owner_id?: string;
  principal_id?: string;
  message?: string;
  error?: string;
}

const CreateSchoolDialog = ({
  children,
  onSchoolCreated,
}: CreateSchoolDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    school_name: "",
    school_email: "",
    school_phone: "",
    school_address: "",
    location: "",
    logo_url: "",
    website_url: "",
    motto: "",
    slogan: "",
    school_type: "primary",
    registration_number: "",
    year_established: new Date().getFullYear(),
    term_structure: "3-term",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    principal_name: "",
    principal_email: "",
    principal_phone: "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      school_name: "",
      school_email: "",
      school_phone: "",
      school_address: "",
      location: "",
      logo_url: "",
      website_url: "",
      motto: "",
      slogan: "",
      school_type: "primary",
      registration_number: "",
      year_established: new Date().getFullYear(),
      term_structure: "3-term",
      owner_name: "",
      owner_email: "",
      owner_phone: "",
      principal_name: "",
      principal_email: "",
      principal_phone: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.school_name ||
      !formData.school_email ||
      !formData.school_phone ||
      !formData.school_address
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (marked with *)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        "create_comprehensive_school",
        {
          school_name: formData.school_name,
          school_email: formData.school_email,
          school_phone: formData.school_phone,
          school_address: formData.school_address,
          logo_url: formData.logo_url || null,
          website_url: formData.website_url || null,
          motto: formData.motto || null,
          slogan: formData.slogan || null,
          school_type: formData.school_type,
          registration_number: formData.registration_number || null,
          year_established: formData.year_established,
          term_structure: formData.term_structure,
          owner_name: formData.owner_name || null,
          owner_email: formData.owner_email || null,
          owner_phone: formData.owner_phone || null,
          principal_name: formData.principal_name || null,
          principal_email: formData.principal_email || null,
          principal_phone: formData.principal_phone || null,
        }
      );

      if (error) throw error;

      // Type assertion for the response
      const response = data as SchoolCreationResponse;

      if (response?.success && response?.school_id) {
        toast({
          title: "Success!",
          description:
            response.message ||
            "School registered successfully in the EduFam network",
        });

        resetForm();
        setOpen(false);
        if (onSchoolCreated) onSchoolCreated();
      } else {
        throw new Error(response?.error || "Failed to register school");
      }
    } catch (error: unknown) {
      console.error("Error creating school:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register school. Please try again.";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Register New School
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a new school profile with essential information. Only
            required fields are marked with *.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Essential School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Essential School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school_name">School Name *</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) =>
                    handleInputChange("school_name", e.target.value)
                  }
                  placeholder="Enter full school name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_type">School Type *</Label>
                <Select
                  value={formData.school_type}
                  onValueChange={(value) =>
                    handleInputChange("school_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary School</SelectItem>
                    <SelectItem value="secondary">Secondary School</SelectItem>
                    <SelectItem value="college">College/University</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_email">Official Email *</Label>
                <Input
                  id="school_email"
                  type="email"
                  value={formData.school_email}
                  onChange={(e) =>
                    handleInputChange("school_email", e.target.value)
                  }
                  placeholder="admin@schoolname.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_phone">Phone Number *</Label>
                <Input
                  id="school_phone"
                  value={formData.school_phone}
                  onChange={(e) =>
                    handleInputChange("school_phone", e.target.value)
                  }
                  placeholder="+254 XXX XXXXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (County) *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    handleInputChange("location", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nairobi">Nairobi</SelectItem>
                    <SelectItem value="mombasa">Mombasa</SelectItem>
                    <SelectItem value="kisumu">Kisumu</SelectItem>
                    <SelectItem value="nakuru">Nakuru</SelectItem>
                    <SelectItem value="eldoret">
                      Uasin Gishu (Eldoret)
                    </SelectItem>
                    <SelectItem value="thika">Kiambu (Thika)</SelectItem>
                    <SelectItem value="meru">Meru</SelectItem>
                    <SelectItem value="nyeri">Nyeri</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_established">Year Established</Label>
                <Input
                  id="year_established"
                  type="number"
                  value={formData.year_established}
                  onChange={(e) =>
                    handleInputChange(
                      "year_established",
                      parseInt(e.target.value) || new Date().getFullYear()
                    )
                  }
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="2000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) =>
                    handleInputChange("registration_number", e.target.value)
                  }
                  placeholder="Ministry of Education registration number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) =>
                    handleInputChange("website_url", e.target.value)
                  }
                  placeholder="https://www.schoolname.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school_address">Physical Address *</Label>
              <Textarea
                id="school_address"
                value={formData.school_address}
                onChange={(e) =>
                  handleInputChange("school_address", e.target.value)
                }
                placeholder="Enter complete physical address including postal code"
                required
                rows={3}
              />
            </div>
          </div>

          {/* Optional Branding */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              School Branding (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motto">School Motto</Label>
                <Input
                  id="motto"
                  value={formData.motto}
                  onChange={(e) => handleInputChange("motto", e.target.value)}
                  placeholder="e.g., Excellence in Education"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slogan">School Slogan</Label>
                <Input
                  id="slogan"
                  value={formData.slogan}
                  onChange={(e) => handleInputChange("slogan", e.target.value)}
                  placeholder="e.g., Nurturing Future Leaders"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="logo_url">Logo URL (PNG/JPG)</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    handleInputChange("logo_url", e.target.value)
                  }
                  placeholder="https://example.com/school-logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Direct link to your school logo image file
                </p>
              </div>
            </div>
          </div>

          {/* Administrative Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Administrative Contacts (Optional)
            </h3>
            <p className="text-sm text-muted-foreground">
              These users will be automatically created with access to the
              school's management system.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* School Owner */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">School Owner</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner Name</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) =>
                        handleInputChange("owner_name", e.target.value)
                      }
                      placeholder="Full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_email">Owner Email</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={formData.owner_email}
                      onChange={(e) =>
                        handleInputChange("owner_email", e.target.value)
                      }
                      placeholder="owner@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_phone">Owner Phone</Label>
                    <Input
                      id="owner_phone"
                      value={formData.owner_phone}
                      onChange={(e) =>
                        handleInputChange("owner_phone", e.target.value)
                      }
                      placeholder="+254 XXX XXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Principal */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Principal</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="principal_name">Principal Name</Label>
                    <Input
                      id="principal_name"
                      value={formData.principal_name}
                      onChange={(e) =>
                        handleInputChange("principal_name", e.target.value)
                      }
                      placeholder="Full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="principal_email">Principal Email</Label>
                    <Input
                      id="principal_email"
                      type="email"
                      value={formData.principal_email}
                      onChange={(e) =>
                        handleInputChange("principal_email", e.target.value)
                      }
                      placeholder="principal@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="principal_phone">Principal Phone</Label>
                    <Input
                      id="principal_phone"
                      value={formData.principal_phone}
                      onChange={(e) =>
                        handleInputChange("principal_phone", e.target.value)
                      }
                      placeholder="+254 XXX XXXXXX"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? "Registering School..." : "Register School"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;
