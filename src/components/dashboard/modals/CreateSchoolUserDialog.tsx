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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserPlus,
  User,
  Building2,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateSchoolUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userData: {
    success: boolean;
    user_id: string;
    message: string;
  }) => void;
}

interface School {
  id: string;
  name: string;
  status: string;
}

interface SchoolUserFormData {
  full_name: string;
  email: string;
  temporary_password: string;
  role: string;
  school_id: string;
}

const CreateSchoolUserDialog: React.FC<CreateSchoolUserDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  const [formData, setFormData] = useState<SchoolUserFormData>({
    full_name: "",
    email: "",
    temporary_password: "",
    role: "",
    school_id: "",
  });

  const schoolRoles = [
    { value: "principal", label: "Principal" },
    { value: "teacher", label: "Teacher" },
    { value: "admin", label: "School Admin" },
    { value: "accountant", label: "Accountant" },
    { value: "librarian", label: "Librarian" },
    { value: "parent", label: "Parent" },
    { value: "student", label: "Student" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchSchools();
    }
  }, [isOpen]);

  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);

      const { data, error } = await supabase
        .from("schools")
        .select("id, name, status")
        .eq("status", "active")
        .order("name");

      if (error) {
        throw error;
      }

      setSchools(data || []);
    } catch (err) {
      console.error("Error fetching schools:", err);
      setError("Failed to load schools");
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleInputChange = (
    field: keyof SchoolUserFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateTemporaryPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = [
        "full_name",
        "email",
        "temporary_password",
        "role",
        "school_id",
      ];

      for (const field of requiredFields) {
        if (!formData[field as keyof SchoolUserFormData]) {
          throw new Error(`${field.replace("_", " ")} is required`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke(
        "create-school-user",
        {
          body: formData,
        }
      );

      if (error) {
        throw error;
      }

      if (data?.success) {
        setSuccess(true);
        onSuccess?.(data);
        // Reset form
        setFormData({
          full_name: "",
          email: "",
          temporary_password: "",
          role: "",
          school_id: "",
        });

        // Close dialog after a short delay
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        throw new Error("Failed to create user");
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Create School User</span>
          </DialogTitle>
          <DialogDescription>
            Create a new user account for a school. The user will receive login
            credentials.
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
            <AlertDescription>User created successfully!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Information</span>
              </CardTitle>
              <CardDescription>
                Basic user details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      handleInputChange("full_name", e.target.value)
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School and Role */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>School Assignment</span>
              </CardTitle>
              <CardDescription>
                Assign the user to a school and role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school_id">School *</Label>
                  <Select
                    value={formData.school_id}
                    onValueChange={(value) =>
                      handleInputChange("school_id", value)
                    }
                  >
                    <SelectTrigger id="school_id">
                      <SelectValue placeholder="Select a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSchools ? (
                        <SelectItem value="" disabled>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading schools...
                        </SelectItem>
                      ) : (
                        schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Login Credentials</span>
              </CardTitle>
              <CardDescription>
                Set up the user's initial password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="temporary_password">Temporary Password *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="temporary_password"
                    type="text"
                    value={formData.temporary_password}
                    onChange={(e) =>
                      handleInputChange("temporary_password", e.target.value)
                    }
                    placeholder="Enter temporary password"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleInputChange(
                        "temporary_password",
                        generateTemporaryPassword()
                      )
                    }
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  The user will be prompted to change this password on first
                  login.
                </p>
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
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolUserDialog;
