import React, { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { SchoolService, SchoolData } from "@/services/schoolService";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Building2, Shield } from "lucide-react";
import { InputSanitizer } from "@/utils/inputSanitizer";

interface EditSchoolModalProps {
  isOpen: boolean;
  schoolId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface SchoolFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string;
  website_url: string;
  motto: string;
  slogan: string;
  school_type: string;
  registration_number: string;
  year_established: number;
  term_structure: string;
  owner_information: string;
}

const EditSchoolModal: React.FC<EditSchoolModalProps> = ({
  isOpen,
  schoolId,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Check if user has permission to edit schools
  const canEditSchools =
    user?.role === "edufam_admin" || user?.role === "elimisha_admin";

  const [formData, setFormData] = useState<SchoolFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    logo_url: "",
    website_url: "",
    motto: "",
    slogan: "",
    school_type: "",
    registration_number: "",
    year_established: new Date().getFullYear(),
    term_structure: "",
    owner_information: "",
  });

  // Fetch school data when modal opens
  useEffect(() => {
    if (isOpen && schoolId) {
      fetchSchoolData();
    }
  }, [isOpen, schoolId]);

  const fetchSchoolData = async () => {
    if (!schoolId) return;

    setFetching(true);
    try {
      const result = await SchoolService.getSchoolById(schoolId);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        onClose();
        return;
      }

      if (result.data) {
        const school = result.data;
        setFormData({
          name: school.name || "",
          email: school.email || "",
          phone: school.phone || "",
          address: school.address || "",
          logo_url: school.logo_url || "",
          website_url: school.website_url || "",
          motto: school.motto || "",
          slogan: school.slogan || "",
          school_type: school.school_type || "",
          registration_number: school.registration_number || "",
          year_established: school.year_established || new Date().getFullYear(),
          term_structure: school.term_structure || "",
          owner_information: school.owner_information || "",
        });
      }
    } catch (error) {
      console.error("Error fetching school data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch school data",
        variant: "destructive",
      });
      onClose();
    } finally {
      setFetching(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!formData.name.trim()) {
      errors.name = "School name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "School email is required";
    } else {
      try {
        InputSanitizer.sanitizeEmail(formData.email);
      } catch {
        errors.email = "Invalid email format";
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = "School phone is required";
    }

    if (!formData.address.trim()) {
      errors.address = "School address is required";
    }

    // Year validation
    const currentYear = new Date().getFullYear();
    if (
      formData.year_established < 1800 ||
      formData.year_established > currentYear
    ) {
      errors.year_established = `Year must be between 1800 and ${currentYear}`;
    }

    // Website URL validation if provided
    if (formData.website_url && formData.website_url.trim()) {
      try {
        new URL(formData.website_url);
      } catch {
        errors.website_url = "Invalid website URL format";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEditSchools) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit schools",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm() || !schoolId) {
      return;
    }

    setLoading(true);
    try {
      const result = await SchoolService.updateSchool(schoolId, formData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        toast({
          title: "Success",
          description: "School updated successfully",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating school:", error);
      toast({
        title: "Error",
        description: "Failed to update school",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof SchoolFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Edit School Details
            {canEditSchools && <Shield className="h-4 w-4 text-green-600" />}
          </DialogTitle>
          <DialogDescription>
            Update the school information. All changes will be saved
            immediately.
            {!canEditSchools && (
              <span className="block text-red-600 mt-1">
                ⚠️ You don't have permission to edit schools
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading school data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!canEditSchools && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Read-only Mode</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  You don't have permission to edit schools. This form is
                  displayed in read-only mode.
                </p>
              </div>
            )}
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter school name"
                    className={validationErrors.name ? "border-red-500" : ""}
                    disabled={!canEditSchools}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="school@example.com"
                    className={validationErrors.email ? "border-red-500" : ""}
                    disabled={!canEditSchools}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+254 700 000 000"
                    className={validationErrors.phone ? "border-red-500" : ""}
                    disabled={!canEditSchools}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500">
                      {validationErrors.phone}
                    </p>
                  )}
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
                    placeholder="Enter registration number"
                    disabled={!canEditSchools}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete school address"
                  rows={3}
                  className={validationErrors.address ? "border-red-500" : ""}
                  disabled={!canEditSchools}
                />
                {validationErrors.address && (
                  <p className="text-sm text-red-500">
                    {validationErrors.address}
                  </p>
                )}
              </div>
            </div>

            {/* School Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                School Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school_type">School Type</Label>
                  <Select
                    value={formData.school_type}
                    onValueChange={(value) =>
                      handleInputChange("school_type", value)
                    }
                    disabled={!canEditSchools}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
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
                    disabled={!canEditSchools}
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
                    placeholder="2020"
                    className={
                      validationErrors.year_established ? "border-red-500" : ""
                    }
                    disabled={!canEditSchools}
                  />
                  {validationErrors.year_established && (
                    <p className="text-sm text-red-500">
                      {validationErrors.year_established}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Branding</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) =>
                      handleInputChange("logo_url", e.target.value)
                    }
                    placeholder="https://example.com/logo.png"
                    disabled={!canEditSchools}
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
                    placeholder="https://schoolwebsite.com"
                    className={
                      validationErrors.website_url ? "border-red-500" : ""
                    }
                    disabled={!canEditSchools}
                  />
                  {validationErrors.website_url && (
                    <p className="text-sm text-red-500">
                      {validationErrors.website_url}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motto">School Motto</Label>
                  <Input
                    id="motto"
                    value={formData.motto}
                    onChange={(e) => handleInputChange("motto", e.target.value)}
                    placeholder="Enter school motto"
                    disabled={!canEditSchools}
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
                    placeholder="Enter school slogan"
                    disabled={!canEditSchools}
                  />
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Owner Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="owner_information">Owner Details</Label>
                <Textarea
                  id="owner_information"
                  value={formData.owner_information}
                  onChange={(e) =>
                    handleInputChange("owner_information", e.target.value)
                  }
                  placeholder="Enter owner name and contact information"
                  rows={3}
                  disabled={!canEditSchools}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !canEditSchools}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolModal;
