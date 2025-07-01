
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Building2, Users, Calendar, MapPin, Phone, Mail, Globe, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
  school_type?: string;
  curriculum_type?: string;
  website_url?: string;
  registration_number?: string;
  year_established?: number;
  motto?: string;
  slogan?: string;
  logo_url?: string;
  owner_id?: string;
  principal_id?: string;
}

interface RecentSchoolsSectionProps {
  schoolsData: School[];
  schoolsLoading: boolean;
  schoolsError: any;
  onModalOpen: (modalType: string) => void;
  onRetrySchools: () => void;
}

const RecentSchoolsSection: React.FC<RecentSchoolsSectionProps> = ({
  schoolsData,
  schoolsLoading,
  schoolsError,
  onModalOpen,
  onRetrySchools
}) => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SchoolDetailsModal = ({ school }: { school: School }) => (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          {school.logo_url ? (
            <img src={school.logo_url} alt={`${school.name} logo`} className="w-8 h-8 rounded" />
          ) : (
            <Building2 className="h-6 w-6" />
          )}
          {school.name}
        </DialogTitle>
        <DialogDescription>
          Complete school information and details
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* School Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">{school.name}</h3>
              {school.motto && <p className="text-blue-700 italic">"{school.motto}"</p>}
              {school.slogan && <p className="text-blue-600 text-sm">{school.slogan}</p>}
            </div>
            <Badge className={getStatusBadgeColor(school.status)}>
              {school.status?.toUpperCase() || 'ACTIVE'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Est. {school.year_established || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{school.school_type?.replace('_', ' ').toUpperCase() || 'Primary'}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{school.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{school.phone}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{school.address}</p>
                </div>
              </div>
              {school.website_url && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Website</p>
                    <a 
                      href={school.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {school.website_url}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Academic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-muted-foreground">Curriculum</p>
              <p className="font-medium">{school.curriculum_type?.toUpperCase() || 'CBC'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-muted-foreground">Registration No.</p>
              <p className="font-medium">{school.registration_number || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(school.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold mb-3">System Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">School ID</p>
              <p className="font-mono text-xs bg-gray-100 p-1 rounded">{school.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Owner ID</p>
              <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                {school.owner_id || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Principal ID</p>
              <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                {school.principal_id || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Registration Date</p>
              <p className="font-medium">{new Date(school.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  if (schoolsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building2 className="h-6 w-6" />
            Recent Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading schools...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schoolsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building2 className="h-6 w-6" />
            Recent Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Failed to load schools data. {schoolsError.message}
              <Button
                onClick={onRetrySchools}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="h-6 w-6" />
              Registered Schools ({schoolsData.length})
            </CardTitle>
            <CardDescription>Recently registered schools in the platform</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={onRetrySchools} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => onModalOpen('create-school')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {schoolsData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No schools registered yet</p>
            <p className="text-sm mb-4">Start by creating your first school to get started.</p>
            <Button onClick={() => onModalOpen('create-school')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First School
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {schoolsData.slice(0, 10).map((school) => (
              <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {school.logo_url ? (
                      <img src={school.logo_url} alt={`${school.name} logo`} className="w-8 h-8 rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">{school.name}</h4>
                      <p className="text-sm text-muted-foreground">{school.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {school.address.length > 50 ? `${school.address.slice(0, 50)}...` : school.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(school.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusBadgeColor(school.status)}>
                    {school.status?.toUpperCase() || 'ACTIVE'}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSchool(school)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    {selectedSchool && selectedSchool.id === school.id && (
                      <SchoolDetailsModal school={selectedSchool} />
                    )}
                  </Dialog>
                </div>
              </div>
            ))}
            
            {schoolsData.length > 10 && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Showing 10 of {schoolsData.length} schools
                </p>
                <Button variant="outline" size="sm">
                  View All Schools
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSchoolsSection;
