import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Save, Camera } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  school_id: string;
  avatar_url: string;
  phone: string;
  national_id: string;
  date_of_birth: string;
  gender: string;
  address: string;
  profile_photo_url: string;
  updated_at?: string;
}

const UserProfileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Get user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  // Update form data when profile data changes
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) {
        throw new Error("No user ID available");
      }

      // Validate required fields
      if (!updates.name?.trim()) {
        throw new Error("Full name is required");
      }

      if (!updates.email?.trim()) {
        throw new Error("Email address is required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Prepare update data with proper sanitization
      const updateData = {
        name: updates.name?.trim(),
        email: updates.email?.trim(),
        phone: updates.phone?.trim() || null,
        national_id: updates.national_id?.trim() || null,
        date_of_birth: updates.date_of_birth || null,
        gender: updates.gender || null,
        address: updates.address?.trim() || null,
        profile_photo_url: updates.profile_photo_url?.trim() || null,
        avatar_url:
          updates.profile_photo_url?.trim() || updates.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      // Update profile in database
      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Update auth user metadata for immediate access and persistence
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: updateData.name,
          email: updateData.email,
          phone: updateData.phone,
          national_id: updateData.national_id,
          date_of_birth: updateData.date_of_birth,
          gender: updateData.gender,
          address: updateData.address,
          profile_photo_url: updateData.profile_photo_url,
          avatar_url: updateData.avatar_url,
          updated_at: updateData.updated_at,
        },
      });

      if (authError) {
        console.warn("Failed to update auth metadata:", authError);
        // Don't throw here as the main database update succeeded
        // The auth metadata will be updated on next login
      }

      return data;
    },
    onSuccess: (updatedProfile) => {
      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });

      // Update the local form data with the returned data
      setFormData(updatedProfile);

      toast({
        title: "Profile Updated Successfully",
        description: "Your profile changes have been saved permanently.",
      });
    },
    onError: (error: unknown) => {
      console.error("Profile update error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";
      toast({
        title: "Error Updating Profile",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email?.trim()) {
      toast({
        title: "Validation Error",
        description: "Email address is required",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            My Profile
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your personal information and account settings. All changes are
          saved permanently.
        </p>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {formData.profile_photo_url || formData.avatar_url ? (
                    <img
                      src={formData.profile_photo_url || formData.avatar_url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <Label htmlFor="profile_photo_url">Profile Picture URL</Label>
                  <Input
                    id="profile_photo_url"
                    value={
                      formData.profile_photo_url || formData.avatar_url || ""
                    }
                    onChange={(e) =>
                      handleInputChange("profile_photo_url", e.target.value)
                    }
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+254 XXX XXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="national_id">National ID</Label>
                  <Input
                    id="national_id"
                    value={formData.national_id || ""}
                    onChange={(e) =>
                      handleInputChange("national_id", e.target.value)
                    }
                    placeholder="National ID number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth || ""}
                    onChange={(e) =>
                      handleInputChange("date_of_birth", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender || ""}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role || ""}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">
                    Role cannot be changed by users
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Your physical address"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                User ID:
              </span>
              <span className="text-sm text-gray-900 font-mono">
                {profile?.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Role:</span>
              <span className="text-sm text-gray-900 capitalize">
                {profile?.role}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                School Assignment:
              </span>
              <span className="text-sm text-gray-900">
                {profile?.school_id ? "Assigned" : "Not Assigned"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Last Updated:
              </span>
              <span className="text-sm text-gray-900">
                {profile?.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileManagement;
