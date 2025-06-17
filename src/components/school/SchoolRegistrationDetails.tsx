
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save, Upload } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';

interface SchoolDetails {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
  curriculum_type: string;
}

const SchoolRegistrationDetails = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<SchoolDetails>>({});

  // Get school details
  const { data: school, isLoading } = useQuery({
    queryKey: ['school-details', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
      
      if (error) throw error;
      return data as SchoolDetails;
    },
    enabled: !!schoolId,
    onSuccess: (data) => {
      setFormData(data);
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async (updates: Partial<SchoolDetails>) => {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', schoolId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-details'] });
      toast({
        title: "Success",
        description: "School details updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update school details",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof SchoolDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolMutation.mutate(formData);
  };

  const canEdit = user?.role === 'principal' || user?.role === 'school_owner' || user?.role === 'edufam_admin';

  return (
    <RoleGuard allowedRoles={['principal', 'school_owner', 'edufam_admin']} requireSchoolAssignment={user?.role !== 'edufam_admin'}>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              School Registration Details
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your school's official information and branding details
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">School Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter school name"
                      disabled={!canEdit}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="school@example.com"
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+254 XXX XXXXXX"
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curriculum">Curriculum Type</Label>
                    <select
                      id="curriculum"
                      value={formData.curriculum_type || 'cbc'}
                      onChange={(e) => handleInputChange('curriculum_type', e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cbc">CBC (Competency Based Curriculum)</option>
                      <option value="8-4-4">8-4-4 System</option>
                      <option value="igcse">IGCSE</option>
                      <option value="cambridge">Cambridge</option>
                      <option value="ib">International Baccalaureate</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo_url">School Logo URL</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url || ''}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">School Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter complete school address"
                    disabled={!canEdit}
                    rows={3}
                  />
                </div>

                {canEdit && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateSchoolMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {updateSchoolMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        {school && (
          <Card>
            <CardHeader>
              <CardTitle>School Information Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {school.logo_url && (
                  <img
                    src={school.logo_url}
                    alt={`${school.name} Logo`}
                    className="w-16 h-16 object-contain rounded-lg border"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold">{school.name}</h3>
                  <p className="text-gray-600">{school.address}</p>
                  <p className="text-sm text-gray-500">
                    {school.phone} | {school.email}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {school.curriculum_type?.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
};

export default SchoolRegistrationDetails;
