import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/hooks/use-toast";
import { ComprehensiveSchoolData } from "@/types/schoolTypes";
import { SchoolCreationService } from "./SchoolCreationService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, User, Settings } from "lucide-react";

interface EnhancedSchoolRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EnhancedSchoolRegistrationDialog: React.FC<
  EnhancedSchoolRegistrationDialogProps
> = ({ open, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ComprehensiveSchoolData>({
    school_name: "",
    school_email: "",
    school_phone: "",
    school_address: "",
    school_type: "primary",
    term_structure: "3-term",
    registration_number: "",
    year_established: new Date().getFullYear(),
    logo_url: "",
    website_url: "",
    motto: "",
    slogan: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    owner_information: "",
    principal_name: "",
    principal_email: "",
    principal_contact: "",
    mpesa_paybill_number: "",
    mpesa_consumer_key: "",
    mpesa_consumer_secret: "",
    mpesa_passkey: "",
  });

  const handleInputChange = (
    field: keyof ComprehensiveSchoolData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.school_name.trim()) {
      toast({
        title: "Validation Error",
        description: "School name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.school_email.trim()) {
      toast({
        title: "Validation Error",
        description: "School email is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.school_phone.trim()) {
      toast({
        title: "Validation Error",
        description: "School phone is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.school_address.trim()) {
      toast({
        title: "Validation Error",
        description: "School address is required",
        variant: "destructive",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.school_email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid school email address",
        variant: "destructive",
      });
      return false;
    }

    // If owner details are provided, validate them
    if (formData.owner_email || formData.owner_name) {
      if (!formData.owner_email || !formData.owner_name) {
        toast({
          title: "Validation Error",
          description:
            "Both owner email and name are required if creating an owner account",
          variant: "destructive",
        });
        return false;
      }

      if (!emailRegex.test(formData.owner_email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid owner email address",
          variant: "destructive",
        });
        return false;
      }
    }

    // If principal details are provided, validate them
    if (formData.principal_email || formData.principal_name) {
      if (!formData.principal_email || !formData.principal_name) {
        toast({
          title: "Validation Error",
          description:
            "Both principal email and name are required if creating a principal account",
          variant: "destructive",
        });
        return false;
      }

      if (!emailRegex.test(formData.principal_email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid principal email address",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log(
        "🏫 EnhancedSchoolRegistrationDialog: Submitting school creation",
        formData
      );

      const result = await SchoolCreationService.createSchool(formData);

      if (result.success) {
        toast({
          title: "School Created Successfully",
          description:
            result.message ||
            "The school has been registered and is ready for use.",
        });

        // Reset form
        setFormData({
          school_name: "",
          school_email: "",
          school_phone: "",
          school_address: "",
          school_type: "primary",
          term_structure: "3-term",
          registration_number: "",
          year_established: new Date().getFullYear(),
          logo_url: "",
          website_url: "",
          motto: "",
          slogan: "",
          owner_name: "",
          owner_email: "",
          owner_phone: "",
          owner_information: "",
          principal_name: "",
          principal_email: "",
          principal_contact: "",
          mpesa_paybill_number: "",
          mpesa_consumer_key: "",
          mpesa_consumer_secret: "",
          mpesa_passkey: "",
        });

        onSuccess();
        onClose();
      } else {
        toast({
          title: "Failed to Create School",
          description:
            result.error ||
            "An unexpected error occurred while creating the school",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error(
        "🏫 EnhancedSchoolRegistrationDialog: Error creating school:",
        error
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register school. Please try again.";
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Register New School in EduFam Network
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Basic details about the educational institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school_name">School Name *</Label>
                  <Input
                    id="school_name"
                    value={formData.school_name}
                    onChange={(e) =>
                      handleInputChange("school_name", e.target.value)
                    }
                    placeholder="e.g., Sunshine Primary School"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_email">School Email *</Label>
                  <Input
                    id="school_email"
                    type="email"
                    value={formData.school_email}
                    onChange={(e) =>
                      handleInputChange("school_email", e.target.value)
                    }
                    placeholder="info@school.edu"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school_phone">Phone Number *</Label>
                  <Input
                    id="school_phone"
                    value={formData.school_phone}
                    onChange={(e) =>
                      handleInputChange("school_phone", e.target.value)
                    }
                    placeholder="+254 123 456 789"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_number">
                    Registration Number
                  </Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) =>
                      handleInputChange("registration_number", e.target.value)
                    }
                    placeholder="REG/2024/001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_address">School Address *</Label>
                <Textarea
                  id="school_address"
                  value={formData.school_address}
                  onChange={(e) =>
                    handleInputChange("school_address", e.target.value)
                  }
                  placeholder="Full address of the school"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school_type">School Type</Label>
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
                      <SelectItem value="secondary">
                        Secondary School
                      </SelectItem>
                      <SelectItem value="college">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term_structure">Term Structure</Label>
                  <Select
                    value={formData.term_structure}
                    onValueChange={(value) =>
                      handleInputChange("term_structure", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select term structure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-term">3-Term System</SelectItem>
                      <SelectItem value="2-semester">
                        2-Semester System
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year_established">Year Established</Label>
                  <Input
                    id="year_established"
                    type="number"
                    value={formData.year_established}
                    onChange={(e) =>
                      handleInputChange(
                        "year_established",
                        parseInt(e.target.value)
                      )
                    }
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) =>
                      handleInputChange("website_url", e.target.value)
                    }
                    placeholder="https://www.school.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motto">School Motto</Label>
                  <Input
                    id="motto"
                    value={formData.motto}
                    onChange={(e) => handleInputChange("motto", e.target.value)}
                    placeholder="Excellence in Education"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">School Slogan</Label>
                  <Input
                    id="slogan"
                    value={formData.slogan}
                    onChange={(e) =>
                      handleInputChange("slogan", e.target.value)
                    }
                    placeholder="Nurturing Future Leaders"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Director Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                School Director (Optional)
              </CardTitle>
              <CardDescription>
                Create an owner account for this school. If left blank, you can
                assign an owner later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Full Name</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) =>
                      handleInputChange("owner_name", e.target.value)
                    }
                    placeholder="John Doe"
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
                    placeholder="owner@school.edu"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_phone">Owner Phone</Label>
                <Input
                  id="owner_phone"
                  value={formData.owner_phone}
                  onChange={(e) =>
                    handleInputChange("owner_phone", e.target.value)
                  }
                  placeholder="+254 123 456 789"
                />
              </div>
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                <strong>Note:</strong> If you provide owner details, a school
                owner account will be created with a temporary password
                (TempPassword123!). The owner should change this password on
                first login.
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating School..." : "Create School"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSchoolRegistrationDialog;
