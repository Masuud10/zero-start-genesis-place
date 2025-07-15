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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FormValidator,
  ApiCallWrapper,
  UuidValidator,
} from "@/utils/apiOptimization";
import { AlertTriangle, Loader2, CheckCircle, XCircle } from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: {
    role: string;
    school_id?: string;
  };
  initialRole?: string;
}

interface CreateUserRpcResponse {
  success: boolean;
  user_id?: string;
  school_id?: string;
  message?: string;
  error?: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  initialRole = "parent",
}) => {
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    email: "",
    password: "TempPassword123!",
    name: "",
    role: initialRole,
    schoolId: currentUser.school_id || "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available schools for selection
  const {
    data: schools = [],
    isLoading: schoolsLoading,
    error: schoolsError,
  } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      return ApiCallWrapper.execute(
        async () => {
          const { data, error } = await supabase
            .from("schools")
            .select("id, name")
            .order("name");
          if (error) throw error;
          return data || [];
        },
        { context: "Fetch Schools" }
      );
    },
    enabled: isOpen && currentUser.role === "edufam_admin",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createUserMutation = useMutation({
    mutationFn: async (user: typeof userData) => {
      return ApiCallWrapper.execute(
        async () => {
          // === PHASE 2: FORENSIC LOGGING - BACKEND API CALL ===
          console.log("--- BACKEND API CALL: FORENSIC LOG ---");
          console.log("About to call Supabase auth admin API with data:", {
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
            hasPassword: !!user.password
          });
          // === END FORENSIC LOGGING ===

          // Ensure non-admin users are assigned to a school
          let finalSchoolId = user.schoolId;

          if (user.role !== "edufam_admin") {
            if (!finalSchoolId) {
              // If no school selected and user is edufam_admin, require school selection
              if (currentUser.role === "edufam_admin") {
                throw new Error("Please select a school for this user role");
              }
              // If current user has a school, use that
              finalSchoolId = currentUser.school_id;
            }

            if (!finalSchoolId) {
              throw new Error("School assignment is required for this role");
            }
          }

          // Validate UUID if school ID is provided
          if (finalSchoolId) {
            UuidValidator.validateAndThrow(finalSchoolId, "School ID");
          }

          // **SURGICAL FIX**: Use Supabase auth admin API instead of database function
          try {
            console.log("--- CREATING AUTH USER: FORENSIC LOG ---");
            
            // Create the authentication user first
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: user.email,
              password: user.password,
              email_confirm: true, // Auto-confirm email
              user_metadata: {
                name: user.name,
                role: user.role,
                school_id: finalSchoolId,
                created_by_admin: true
              }
            });

            console.log("--- AUTH USER CREATION RESULT: FORENSIC LOG ---");
            console.log("Auth data:", authData);
            console.log("Auth error:", authError);

            if (authError) {
              console.error("--- AUTH ERROR: FORENSIC LOG ---");
              console.error("Full Auth Error:", authError);
              throw new Error(`Authentication error: ${authError.message}`);
            }

            if (!authData.user) {
              throw new Error("Failed to create authentication user - no user returned");
            }

            // Now create/update the profile with the actual auth user ID
            console.log("--- CREATING PROFILE: FORENSIC LOG ---");
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: authData.user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                school_id: finalSchoolId || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              });

            console.log("--- PROFILE CREATION RESULT: FORENSIC LOG ---");
            console.log("Profile data:", profileData);
            console.log("Profile error:", profileError);

            if (profileError) {
              console.error("--- PROFILE ERROR: FORENSIC LOG ---");
              console.error("Full Profile Error:", profileError);
              
              // If profile creation fails, we should clean up the auth user
              try {
                await supabase.auth.admin.deleteUser(authData.user.id);
              } catch (cleanupError) {
                console.error("Failed to cleanup auth user after profile error:", cleanupError);
              }
              
              throw new Error(`Profile creation error: ${profileError.message}`);
            }

            return {
              success: true,
              user_id: authData.user.id,
              school_id: finalSchoolId,
              message: 'User created successfully with proper school assignment'
            } as CreateUserRpcResponse;

          } catch (createError) {
            console.error("--- USER CREATION FAILED: FORENSIC LOG ---");
            console.error("Full Creation Error:", createError);
            throw createError;
          }
        },
        { context: "Create User" }
      );
    },
    onSuccess: (result) => {
      if (result && result.success) {
        toast({
          title: "Success",
          description: result.message || "User created successfully with proper school assignment",
        });
        handleReset();
        onSuccess();
        onClose();
      } else {
        throw new Error(result?.error || "Failed to create user");
      }
    },
    onError: (error: unknown) => {
      console.error("--- MUTATION ERROR: FORENSIC LOG ---");
      console.error("Full Mutation Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required field validation
    const nameError = FormValidator.validateRequired(
      userData.name,
      "Full Name"
    );
    if (nameError) errors.name = nameError;

    const emailError = FormValidator.validateEmail(userData.email);
    if (emailError) errors.email = emailError;

    const passwordError = FormValidator.validateRequired(
      userData.password,
      "Password"
    );
    if (passwordError) errors.password = passwordError;

    // Role validation
    if (!userData.role) {
      errors.role = "Role is required";
    }

    // School validation for non-admin roles
    if (userData.role !== "edufam_admin" && !userData.schoolId) {
      if (currentUser.role === "edufam_admin") {
        errors.schoolId = "Please select a school for this user role";
      } else if (!currentUser.school_id) {
        errors.schoolId = "School assignment is required for this role";
      }
    }

    // Password strength validation
    if (userData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

    // === PHASE 1: FORENSIC LOGGING - DATA BEING SENT TO BACKEND ===
    console.log("--- CREATE USER: FORENSIC LOG ---");
    console.log("Data being sent to backend:", JSON.stringify(userData, null, 2));
    console.log("Current user context:", JSON.stringify({
      role: currentUser.role,
      school_id: currentUser.school_id
    }, null, 2));
    console.log("Validation errors:", JSON.stringify(validationErrors, null, 2));
    // === END FORENSIC LOGGING ===

    setIsSubmitting(true);
    createUserMutation.mutate(userData);
  };

  const handleReset = () => {
    setUserData({
      email: "",
      password: "TempPassword123!",
      name: "",
      role: initialRole,
      schoolId: currentUser.school_id || "",
    });
    setValidationErrors({});
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof typeof userData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const roleOptions = [
    { value: "elimisha_admin", label: "Elimisha Admin" },
    { value: "edufam_admin", label: "EduFam Admin" },
    { value: "school_owner", label: "School Owner" },
    { value: "principal", label: "Principal" },
    { value: "teacher", label: "Teacher" },
    { value: "parent", label: "Parent" },
    { value: "finance_officer", label: "Finance Officer" },
  ];

  const shouldShowSchoolSelection =
    currentUser.role === "edufam_admin" && userData.role !== "edufam_admin";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        {schoolsError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load schools. Please refresh and try again.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={userData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
              className={validationErrors.name ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500 mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              className={validationErrors.email ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500 mt-1">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              value={userData.role}
              onValueChange={(value) => handleInputChange("role", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={validationErrors.role ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.role && (
              <p className="text-sm text-red-500 mt-1">
                {validationErrors.role}
              </p>
            )}
          </div>

          {/* School selection - only for system admins creating non-admin users */}
          {shouldShowSchoolSelection && (
            <div>
              <Label htmlFor="school">Assign to School *</Label>
              <Select
                value={userData.schoolId}
                onValueChange={(value) => handleInputChange("schoolId", value)}
                disabled={isSubmitting || schoolsLoading}
              >
                <SelectTrigger
                  className={validationErrors.schoolId ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      schoolsLoading ? "Loading schools..." : "Select school"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.schoolId && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.schoolId}
                </p>
              )}
              {schoolsLoading && (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-muted-foreground">
                    Loading schools...
                  </span>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="password">Temporary Password *</Label>
            <Input
              id="password"
              type="password"
              value={userData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter temporary password"
              className={validationErrors.password ? "border-red-500" : ""}
              disabled={isSubmitting}
              minLength={8}
            />
            {validationErrors.password && (
              <p className="text-sm text-red-500 mt-1">
                {validationErrors.password}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              User will be prompted to change this password on first login.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createUserMutation.isPending}
              className="flex-1"
            >
              {isSubmitting || createUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
