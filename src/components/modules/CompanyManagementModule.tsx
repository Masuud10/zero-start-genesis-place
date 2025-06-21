
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Building2, 
  Users, 
  TrendingUp, 
  Edit, 
  Save, 
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface CompanyDetails {
  id: string;
  company_name: string;
  company_logo_url?: string;
  company_slogan?: string;
  company_motto?: string;
  company_type?: string;
  website_url?: string;
  support_email?: string;
  contact_phone?: string;
  headquarters_address?: string;
  registration_number?: string;
  incorporation_details?: string;
  year_established?: number;
  management_team?: any[];
  subscription_plans?: any[];
}

interface CompanyMetrics {
  total_schools: number;
  active_schools: number;
  total_users: number;
  active_users: number;
  total_revenue: number;
  monthly_revenue: number;
  system_uptime_percentage: number;
}

const CompanyManagementModule = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<Partial<CompanyDetails>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch company details
  const { data: companyDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['company-details'],
    queryFn: async () => {
      console.log('🏢 Fetching company details');
      const { data, error } = await supabase
        .from('company_details')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching company details:', error);
        throw error;
      }
      console.log('✅ Company details fetched:', data);
      return data as CompanyDetails;
    }
  });

  // Fetch latest company metrics
  const { data: companyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['company-metrics'],
    queryFn: async () => {
      console.log('📊 Fetching company metrics');
      
      // First, update metrics
      await supabase.rpc('update_company_metrics');
      
      // Then fetch the latest metrics
      const { data, error } = await supabase
        .from('company_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching company metrics:', error);
        throw error;
      }
      console.log('✅ Company metrics fetched:', data);
      return data as CompanyMetrics;
    }
  });

  // Update company details mutation
  const updateCompanyDetailsMutation = useMutation({
    mutationFn: async (updates: Partial<CompanyDetails>) => {
      const { data, error } = await supabase
        .from('company_details')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', companyDetails?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-details'] });
      toast({
        title: "Company Details Updated",
        description: "Company information has been successfully updated.",
      });
      setIsEditing(false);
      setEditedDetails({});
    },
    onError: (error: any) => {
      console.error('Error updating company details:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update company details.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (Object.keys(editedDetails).length > 0) {
      updateCompanyDetailsMutation.mutate(editedDetails);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDetails({});
  };

  const handleInputChange = (field: keyof CompanyDetails, value: string | number) => {
    setEditedDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentValue = (field: keyof CompanyDetails) => {
    return editedDetails[field] !== undefined ? editedDetails[field] : companyDetails?.[field];
  };

  if (detailsLoading || metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metricsCards = [
    {
      title: 'Total Schools',
      value: companyMetrics?.total_schools || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Users',
      value: companyMetrics?.total_users || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Revenue',
      value: `$${(companyMetrics?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'System Uptime',
      value: `${companyMetrics?.system_uptime_percentage || 100}%`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Company Management</h2>
          <p className="text-muted-foreground">Manage EduFam company information and view performance metrics</p>
        </div>
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={updateCompanyDetailsMutation.isPending}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </>
          )}
        </Button>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((card) => (
          <Card key={card.title} className={`${card.bgColor} border-none shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-white/50`}>
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Company Information
          </CardTitle>
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              {isEditing ? (
                <Input
                  id="company_name"
                  value={getCurrentValue('company_name') || ''}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                />
              ) : (
                <p className="text-lg font-semibold">{companyDetails?.company_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company_type">Company Type</Label>
              {isEditing ? (
                <Input
                  id="company_type"
                  value={getCurrentValue('company_type') || ''}
                  onChange={(e) => handleInputChange('company_type', e.target.value)}
                />
              ) : (
                <Badge variant="secondary">{companyDetails?.company_type}</Badge>
              )}
            </div>

            <div>
              <Label htmlFor="company_slogan">Company Slogan</Label>
              {isEditing ? (
                <Input
                  id="company_slogan"
                  value={getCurrentValue('company_slogan') || ''}
                  onChange={(e) => handleInputChange('company_slogan', e.target.value)}
                />
              ) : (
                <p className="text-muted-foreground italic">{companyDetails?.company_slogan}</p>
              )}
            </div>

            <div>
              <Label htmlFor="year_established">Year Established</Label>
              {isEditing ? (
                <Input
                  id="year_established"
                  type="number"
                  value={getCurrentValue('year_established') || ''}
                  onChange={(e) => handleInputChange('year_established', parseInt(e.target.value))}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{companyDetails?.year_established}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="website_url">Website URL</Label>
              {isEditing ? (
                <Input
                  id="website_url"
                  value={getCurrentValue('website_url') || ''}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                />
              ) : (
                <a href={companyDetails?.website_url} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline">
                  {companyDetails?.website_url}
                </a>
              )}
            </div>

            <div>
              <Label htmlFor="support_email">Support Email</Label>
              {isEditing ? (
                <Input
                  id="support_email"
                  type="email"
                  value={getCurrentValue('support_email') || ''}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{companyDetails?.support_email}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              {isEditing ? (
                <Input
                  id="contact_phone"
                  value={getCurrentValue('contact_phone') || ''}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{companyDetails?.contact_phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="registration_number">Registration Number</Label>
              {isEditing ? (
                <Input
                  id="registration_number"
                  value={getCurrentValue('registration_number') || ''}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                />
              ) : (
                <span className="font-mono">{companyDetails?.registration_number || 'Not provided'}</span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="headquarters_address">Headquarters Address</Label>
            {isEditing ? (
              <Textarea
                id="headquarters_address"
                value={getCurrentValue('headquarters_address') || ''}
                onChange={(e) => handleInputChange('headquarters_address', e.target.value)}
                rows={3}
              />
            ) : (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>{companyDetails?.headquarters_address || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="company_motto">Company Motto</Label>
            {isEditing ? (
              <Textarea
                id="company_motto"
                value={getCurrentValue('company_motto') || ''}
                onChange={(e) => handleInputChange('company_motto', e.target.value)}
                rows={2}
              />
            ) : (
              <p className="text-muted-foreground italic">{companyDetails?.company_motto || 'Not provided'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="incorporation_details">Incorporation Details</Label>
            {isEditing ? (
              <Textarea
                id="incorporation_details"
                value={getCurrentValue('incorporation_details') || ''}
                onChange={(e) => handleInputChange('incorporation_details', e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {companyDetails?.incorporation_details || 'Not provided'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyManagementModule;
