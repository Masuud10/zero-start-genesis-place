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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  User,
  Settings,
  CreditCard,
  Upload,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (schoolData: any) => void;
}

interface SchoolFormData {
  // Basic Information
  school_name: string;
  school_motto: string;
  school_slogan: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  school_logo_url: string;

  // School Details
  school_type: string;
  term_structure: string;

  // Director Details
  director_name: string;
  director_contact: string;

  // MPESA Configuration
  mpesa_paybill: string;
  mpesa_consumer_key: string;
  mpesa_consumer_secret: string;

  // Owner Details
  owner_full_name: string;
  owner_email: string;
  owner_phone: string;
}

const CreateSchoolDialog: React.FC<CreateSchoolDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState<SchoolFormData>({
    school_name: "",
    school_motto: "",
    school_slogan: "",
    school_email: "",
    school_phone: "",
    school_address: "",
    school_logo_url: "",
    school_type: "Primary",
    term_structure: "Two Semesters",
    director_name: "",
    director_contact: "",
    mpesa_paybill: "",
    mpesa_consumer_key: "",
    mpesa_consumer_secret: "",
    owner_full_name: "",
    owner_email: "",
    owner_phone: "",
  });

  const handleInputChange = (field: keyof SchoolFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = [
        "school_name",
        "school_email",
        "school_phone",
        "school_address",
        "owner_full_name",
        "owner_email",
      ];

      for (const field of requiredFields) {
        if (!formData[field as keyof SchoolFormData]) {
          throw new Error(`${field.replace("_", " ")} is required`);
        }
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke("create-school", {
        body: formData,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        setSuccess(true);
        onSuccess?.(data);
        // Reset form
        setFormData({
          school_name: "",
          school_motto: "",
          school_slogan: "",
          school_email: "",
          school_phone: "",
          school_address: "",
          school_logo_url: "",
          school_type: "Primary",
          term_structure: "Two Semesters",
          director_name: "",
          director_contact: "",
          mpesa_paybill: "",
          mpesa_consumer_key: "",
          mpesa_consumer_secret: "",
          owner_full_name: "",
          owner_email: "",
          owner_phone: "",
        });

        // Close dialog after a short delay
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        throw new Error("Failed to create school");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Create New School</span>
          </DialogTitle>
          <DialogDescription>
            Create a new school and automatically set up the school owner
            account.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>School created successfully!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Essential school details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school_name">School Name *</Label>
                  <Input
                    id="school_name"
                    value={formData.school_name}
                    onChange={(e) =>
                      handleInputChange("school_name", e.target.value)
                    }
                    placeholder="Enter school name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="school_email">Email *</Label>
                  <Input
                    id="school_email"
                    type="email"
                    value={formData.school_email}
                    onChange={(e) =>
                      handleInputChange("school_email", e.target.value)
                    }
                    placeholder="school@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school_phone">Phone *</Label>
                  <Input
                    id="school_phone"
                    value={formData.school_phone}
                    onChange={(e) =>
                      handleInputChange("school_phone", e.target.value)
                    }
                    placeholder="+254 700 000 000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="school_logo_url">Logo URL</Label>
                  <Input
                    id="school_logo_url"
                    value={formData.school_logo_url}
                    onChange={(e) =>
                      handleInputChange("school_logo_url", e.target.value)
                    }
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="school_address">Physical Address *</Label>
                <Textarea
                  id="school_address"
                  value={formData.school_address}
                  onChange={(e) =>
                    handleInputChange("school_address", e.target.value)
                  }
                  placeholder="Enter complete physical address"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school_motto">Motto</Label>
                  <Input
                    id="school_motto"
                    value={formData.school_motto}
                    onChange={(e) =>
                      handleInputChange("school_motto", e.target.value)
                    }
                    placeholder="School motto"
                  />
                </div>
                <div>
                  <Label htmlFor="school_slogan">Slogan</Label>
                  <Input
                    id="school_slogan"
                    value={formData.school_slogan}
                    onChange={(e) =>
                      handleInputChange("school_slogan", e.target.value)
                    }
                    placeholder="School slogan"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>School Details</span>
              </CardTitle>
              <CardDescription>
                Academic structure and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school_type">School Type</Label>
                  <Select
                    value={formData.school_type}
                    onValueChange={(value) =>
                      handleInputChange("school_type", value)
                    }
                  >
                    <SelectTrigger id="school_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primary">Primary</SelectItem>
                      <SelectItem value="Secondary">Secondary</SelectItem>
                      <SelectItem value="Tertiary">Tertiary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="term_structure">Term Structure</Label>
                  <Select
                    value={formData.term_structure}
                    onValueChange={(value) =>
                      handleInputChange("term_structure", value)
                    }
                  >
                    <SelectTrigger id="term_structure">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Two Semesters">
                        Two Semesters
                      </SelectItem>
                      <SelectItem value="Three Semesters">
                        Three Semesters
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Director Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Director Details (Optional)</span>
              </CardTitle>
              <CardDescription>
                Information about the school director
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="director_name">Director Name</Label>
                  <Input
                    id="director_name"
                    value={formData.director_name}
                    onChange={(e) =>
                      handleInputChange("director_name", e.target.value)
                    }
                    placeholder="Director's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="director_contact">Director Contact</Label>
                  <Input
                    id="director_contact"
                    value={formData.director_contact}
                    onChange={(e) =>
                      handleInputChange("director_contact", e.target.value)
                    }
                    placeholder="Director's contact information"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MPESA Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>MPESA Configuration (Optional)</span>
              </CardTitle>
              <CardDescription>
                Payment gateway configuration for fee collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="mpesa_paybill">Paybill Number</Label>
                  <Input
                    id="mpesa_paybill"
                    value={formData.mpesa_paybill}
                    onChange={(e) =>
                      handleInputChange("mpesa_paybill", e.target.value)
                    }
                    placeholder="123456"
                  />
                </div>
                <div>
                  <Label htmlFor="mpesa_consumer_key">Consumer Key</Label>
                  <Input
                    id="mpesa_consumer_key"
                    value={formData.mpesa_consumer_key}
                    onChange={(e) =>
                      handleInputChange("mpesa_consumer_key", e.target.value)
                    }
                    placeholder="Consumer key"
                  />
                </div>
                <div>
                  <Label htmlFor="mpesa_consumer_secret">Consumer Secret</Label>
                  <Input
                    id="mpesa_consumer_secret"
                    type="password"
                    value={formData.mpesa_consumer_secret}
                    onChange={(e) =>
                      handleInputChange("mpesa_consumer_secret", e.target.value)
                    }
                    placeholder="Consumer secret"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Owner Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>School Owner Details</span>
              </CardTitle>
              <CardDescription>
                Information for the school owner account that will be created
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner_full_name">Full Name *</Label>
                  <Input
                    id="owner_full_name"
                    value={formData.owner_full_name}
                    onChange={(e) =>
                      handleInputChange("owner_full_name", e.target.value)
                    }
                    placeholder="Owner's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="owner_email">Email *</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) =>
                      handleInputChange("owner_email", e.target.value)
                    }
                    placeholder="owner@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="owner_phone">Phone</Label>
                <Input
                  id="owner_phone"
                  value={formData.owner_phone}
                  onChange={(e) =>
                    handleInputChange("owner_phone", e.target.value)
                  }
                  placeholder="+254 700 000 000"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating School...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create School
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;
