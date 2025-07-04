import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthUser } from "@/types/auth";
import {
  Building2,
  Loader2,
  Shield,
  User,
  GraduationCap,
  Smartphone,
  ChevronDown,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { InputSanitizer } from "@/utils/inputSanitizer";

interface SchoolRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

interface SchoolFormData {
  // Basic Information
  school_name: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  registration_number: string;

  // School Details
  school_type: "primary" | "secondary" | "tertiary";
  term_structure: "3-term" | "2-term" | "trimester";
  year_established: number;
  max_students: number;
  timezone: string;

  // Branding
  logo_url: string;
  website_url: string;
  motto: string;
  slogan: string;

  // Owner Information
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_information: string;

  // MPESA Configuration
  mpesa_enabled: boolean;
  mpesa_paybill_number: string;
  mpesa_business_name: string;
  mpesa_callback_url: string;
  mpesa_shortcode: string;
  mpesa_confirmation_key: string;
}

interface SchoolCreationResult {
  success?: boolean;
  school_id?: string;
  owner_id?: string;
  message?: string;
  error?: string;
}

const SchoolRegistrationModal: React.FC<SchoolRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SchoolFormData>({
    // Basic Information
    school_name: "",
    school_email: "",
    school_phone: "",
    school_address: "",
    registration_number: "",

    // School Details
    school_type: "primary",
    term_structure: "3-term",
    year_established: new Date().getFullYear(),
    max_students: 1000,
    timezone: "Africa/Nairobi",

    // Branding
    logo_url: "",
    website_url: "",
    motto: "",
    slogan: "",

    // Owner Information
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    owner_information: "",

    // MPESA Configuration
    mpesa_enabled: false,
    mpesa_paybill_number: "",
    mpesa_business_name: "",
    mpesa_callback_url: "",
    mpesa_shortcode: "",
    mpesa_confirmation_key: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [mpesaSectionOpen, setMpesaSectionOpen] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!formData.school_name.trim()) {
      errors.school_name = "School name is required";
    }

    if (!formData.school_email.trim()) {
      errors.school_email = "School email is required";
    } else {
      try {
        InputSanitizer.sanitizeEmail(formData.school_email);
      } catch {
        errors.school_email = "Invalid email format";
      }
    }

    if (!formData.school_phone.trim()) {
      errors.school_phone = "School phone is required";
    }

    if (!formData.school_address.trim()) {
      errors.school_address = "School address is required";
    }

    // Optional email validations
    if (formData.owner_email && formData.owner_email.trim()) {
      try {
        InputSanitizer.sanitizeEmail(formData.owner_email);
      } catch {
        errors.owner_email = "Invalid owner email format";
      }
    }

    // Year validation
    const currentYear = new Date().getFullYear();
    if (
      formData.year_established < 1800 ||
      formData.year_established > currentYear
    ) {
      errors.year_established = `Year must be between 1800 and ${currentYear}`;
    }

    // Max students validation
    if (formData.max_students < 1 || formData.max_students > 10000) {
      errors.max_students = "Maximum students must be between 1 and 10,000";
    }

    // MPESA validation if enabled
    if (formData.mpesa_enabled) {
      if (!formData.mpesa_paybill_number.trim()) {
        errors.mpesa_paybill_number =
          "Paybill number is required when MPESA is enabled";
      }
      if (!formData.mpesa_business_name.trim()) {
        errors.mpesa_business_name =
          "Business name is required when MPESA is enabled";
      }
      if (!formData.mpesa_shortcode.trim()) {
        errors.mpesa_shortcode = "Shortcode is required when MPESA is enabled";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createSchool = useMutation({
    mutationFn: async (data: SchoolFormData) => {
      console.log("🏫 Creating school with updated data:", data);

      const { data: result, error } = await supabase.rpc(
        "create_enhanced_school",
        {
          // Basic Information
          school_name: InputSanitizer.sanitizeAlphanumeric(
            data.school_name.trim()
          ),
          school_email: InputSanitizer.sanitizeEmail(data.school_email.trim()),
          school_phone: InputSanitizer.sanitizePhoneNumber(
            data.school_phone.trim()
          ),
          school_address: InputSanitizer.sanitizeAlphanumeric(
            data.school_address.trim()
          ),
          registration_number: data.registration_number.trim() || null,

          // School Details
          school_type: data.school_type,
          term_structure: data.term_structure,
          year_established: data.year_established,
          max_students: data.max_students,
          timezone: data.timezone,

          // Branding
          logo_url: data.logo_url.trim() || null,
          website_url: data.website_url.trim() || null,
          motto: data.motto.trim() || null,
          slogan: data.slogan.trim() || null,

          // Owner Information
          owner_name: data.owner_name.trim() || null,
          owner_email: data.owner_email.trim() || null,
          owner_phone: data.owner_phone.trim() || null,
          owner_information: data.owner_information.trim() || null,

          // MPESA Configuration
          mpesa_enabled: data.mpesa_enabled,
          mpesa_paybill_number: data.mpesa_enabled
            ? data.mpesa_paybill_number.trim()
            : null,
          mpesa_business_name: data.mpesa_enabled
            ? data.mpesa_business_name.trim()
            : null,
          mpesa_callback_url: data.mpesa_enabled
            ? data.mpesa_callback_url.trim()
            : null,
          mpesa_shortcode: data.mpesa_enabled
            ? data.mpesa_shortcode.trim()
            : null,
          mpesa_confirmation_key: data.mpesa_enabled
            ? data.mpesa_confirmation_key.trim()
            : null,
        }
      );

      if (error) {
        console.error("🏫 Database function error:", error);
        throw error;
      }

      console.log("🏫 Database function result:", result);
      return result as SchoolCreationResult;
    },
    onSuccess: (result) => {
      console.log("🏫 School creation result:", result);

      if (result?.success) {
        toast({
          title: "Success",
          description:
            result.message ||
            "School registered successfully with complete setup",
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["schools"] });
        queryClient.invalidateQueries({ queryKey: ["admin-schools"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

        onSuccess();
        onClose();

        // Reset form
        setFormData({
          school_name: "",
          school_email: "",
          school_phone: "",
          school_address: "",
          registration_number: "",
          school_type: "primary",
          term_structure: "3-term",
          year_established: new Date().getFullYear(),
          max_students: 1000,
          timezone: "Africa/Nairobi",
          logo_url: "",
          website_url: "",
          motto: "",
          slogan: "",
          owner_name: "",
          owner_email: "",
          owner_phone: "",
          owner_information: "",
          mpesa_enabled: false,
          mpesa_paybill_number: "",
          mpesa_business_name: "",
          mpesa_callback_url: "",
          mpesa_shortcode: "",
          mpesa_confirmation_key: "",
        });
        setValidationErrors({});
        setMpesaSectionOpen(false);
      } else {
        toast({
          title: "Registration Failed",
          description:
            result?.error || "Failed to register school. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: unknown) => {
      console.error("🏫 School creation error:", error);
      toast({
        title: "Registration Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during school registration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before submitting",
        variant: "destructive",
      });
      return;
    }

    createSchool.mutate(formData);
  };

  const handleInputChange = (
    field: keyof SchoolFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Register New School
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive school profile with administrative setup and
            payment configuration
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="school_name">School Name *</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) =>
                    handleInputChange("school_name", e.target.value)
                  }
                  placeholder="ABC Primary School"
                  className={
                    validationErrors.school_name ? "border-red-500" : ""
                  }
                />
                {validationErrors.school_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.school_name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) =>
                    handleInputChange("registration_number", e.target.value)
                  }
                  placeholder="REG/2024/001"
                />
              </div>

              <div>
                <Label htmlFor="school_email">School Email *</Label>
                <Input
                  id="school_email"
                  type="email"
                  value={formData.school_email}
                  onChange={(e) =>
                    handleInputChange("school_email", e.target.value)
                  }
                  placeholder="info@abcschool.com"
                  className={
                    validationErrors.school_email ? "border-red-500" : ""
                  }
                />
                {validationErrors.school_email && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.school_email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="school_phone">Phone Number *</Label>
                <Input
                  id="school_phone"
                  value={formData.school_phone}
                  onChange={(e) =>
                    handleInputChange("school_phone", e.target.value)
                  }
                  placeholder="+254 700 000 000"
                  className={
                    validationErrors.school_phone ? "border-red-500" : ""
                  }
                />
                {validationErrors.school_phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.school_phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="school_address">School Address *</Label>
              <Textarea
                id="school_address"
                value={formData.school_address}
                onChange={(e) =>
                  handleInputChange("school_address", e.target.value)
                }
                placeholder="Complete address of the school including city and postal code"
                className={
                  validationErrors.school_address ? "border-red-500" : ""
                }
                rows={3}
              />
              {validationErrors.school_address && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.school_address}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* School Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <h3 className="text-lg font-semibold">School Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="school_type">Type of School</Label>
                <Select
                  value={formData.school_type}
                  onValueChange={(
                    value: "primary" | "secondary" | "tertiary"
                  ) => handleInputChange("school_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="tertiary">Tertiary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="term_structure">Term Structure</Label>
                <Select
                  value={formData.term_structure}
                  onValueChange={(value: "3-term" | "2-term" | "trimester") =>
                    handleInputChange("term_structure", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-term">3-term</SelectItem>
                    <SelectItem value="2-term">2-term</SelectItem>
                    <SelectItem value="trimester">Trimester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
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
                  min="1800"
                  max={new Date().getFullYear()}
                  className={
                    validationErrors.year_established ? "border-red-500" : ""
                  }
                />
                {validationErrors.year_established && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.year_established}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_students">Maximum Number of Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  value={formData.max_students}
                  onChange={(e) =>
                    handleInputChange("max_students", parseInt(e.target.value))
                  }
                  min="1"
                  max="10000"
                  className={
                    validationErrors.max_students ? "border-red-500" : ""
                  }
                />
                {validationErrors.max_students && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.max_students}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value: string) =>
                    handleInputChange("timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Nairobi">
                      Africa/Nairobi
                    </SelectItem>
                    <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                    <SelectItem value="Africa/Cairo">Africa/Cairo</SelectItem>
                    <SelectItem value="Africa/Johannesburg">
                      Africa/Johannesburg
                    </SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Branding Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <h3 className="text-lg font-semibold">School Branding</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website_url">Website URL (Optional)</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) =>
                    handleInputChange("website_url", e.target.value)
                  }
                  placeholder="https://www.abcschool.com"
                />
              </div>

              <div>
                <Label htmlFor="logo_url">School Logo URL (Optional)</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    handleInputChange("logo_url", e.target.value)
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="motto">School Motto</Label>
                <Input
                  id="motto"
                  value={formData.motto}
                  onChange={(e) => handleInputChange("motto", e.target.value)}
                  placeholder="Excellence in Education"
                />
              </div>

              <div>
                <Label htmlFor="slogan">School Slogan</Label>
                <Input
                  id="slogan"
                  value={formData.slogan}
                  onChange={(e) => handleInputChange("slogan", e.target.value)}
                  placeholder="Nurturing Future Leaders"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Owner Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <h3 className="text-lg font-semibold">
                School Owner Information (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) =>
                    handleInputChange("owner_name", e.target.value)
                  }
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="owner_email">Owner Email</Label>
                <Input
                  id="owner_email"
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) =>
                    handleInputChange("owner_email", e.target.value)
                  }
                  placeholder="owner@example.com"
                  className={
                    validationErrors.owner_email ? "border-red-500" : ""
                  }
                />
                {validationErrors.owner_email && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.owner_email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="owner_phone">Owner Phone</Label>
                <Input
                  id="owner_phone"
                  value={formData.owner_phone}
                  onChange={(e) =>
                    handleInputChange("owner_phone", e.target.value)
                  }
                  placeholder="+254 700 000 000"
                />
              </div>

              <div>
                <Label htmlFor="owner_information">
                  Additional Owner Information
                </Label>
                <Textarea
                  id="owner_information"
                  value={formData.owner_information}
                  onChange={(e) =>
                    handleInputChange("owner_information", e.target.value)
                  }
                  placeholder="Additional details about the school owner"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* MPESA Configuration Section */}
          <div className="space-y-4">
            <Collapsible
              open={mpesaSectionOpen}
              onOpenChange={setMpesaSectionOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <h3 className="text-lg font-semibold">
                      MPESA Configuration (Optional)
                    </h3>
                  </div>
                  {mpesaSectionOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mpesa_enabled"
                    checked={formData.mpesa_enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("mpesa_enabled", checked)
                    }
                  />
                  <Label htmlFor="mpesa_enabled">
                    Enable MPESA Payment Integration
                  </Label>
                </div>

                {formData.mpesa_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mpesa_paybill_number">
                        Paybill Number *
                      </Label>
                      <Input
                        id="mpesa_paybill_number"
                        value={formData.mpesa_paybill_number}
                        onChange={(e) =>
                          handleInputChange(
                            "mpesa_paybill_number",
                            e.target.value
                          )
                        }
                        placeholder="123456"
                        className={
                          validationErrors.mpesa_paybill_number
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationErrors.mpesa_paybill_number && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.mpesa_paybill_number}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="mpesa_business_name">
                        Business Name *
                      </Label>
                      <Input
                        id="mpesa_business_name"
                        value={formData.mpesa_business_name}
                        onChange={(e) =>
                          handleInputChange(
                            "mpesa_business_name",
                            e.target.value
                          )
                        }
                        placeholder="ABC School"
                        className={
                          validationErrors.mpesa_business_name
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationErrors.mpesa_business_name && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.mpesa_business_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="mpesa_shortcode">Shortcode *</Label>
                      <Input
                        id="mpesa_shortcode"
                        value={formData.mpesa_shortcode}
                        onChange={(e) =>
                          handleInputChange("mpesa_shortcode", e.target.value)
                        }
                        placeholder="123456"
                        className={
                          validationErrors.mpesa_shortcode
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationErrors.mpesa_shortcode && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.mpesa_shortcode}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="mpesa_confirmation_key">
                        Confirmation Key/Token
                      </Label>
                      <Input
                        id="mpesa_confirmation_key"
                        value={formData.mpesa_confirmation_key}
                        onChange={(e) =>
                          handleInputChange(
                            "mpesa_confirmation_key",
                            e.target.value
                          )
                        }
                        placeholder="Your confirmation key"
                        type="password"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="mpesa_callback_url">
                        MPESA Callback URL
                      </Label>
                      <Input
                        id="mpesa_callback_url"
                        value={formData.mpesa_callback_url}
                        onChange={(e) =>
                          handleInputChange(
                            "mpesa_callback_url",
                            e.target.value
                          )
                        }
                        placeholder="https://yourdomain.com/api/mpesa/callback"
                      />
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSchool.isPending}
              className="flex-1"
            >
              {createSchool.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering School...
                </>
              ) : (
                "Register School"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolRegistrationModal;
