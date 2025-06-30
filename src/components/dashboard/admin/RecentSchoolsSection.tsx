
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, Eye, Users, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface School {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  owner_id: string | null;
  principal_id: string | null;
}

interface RecentSchoolsSectionProps {
  schoolsData: School[];
  schoolsLoading: boolean;
  schoolsError: any;
  onModalOpen: (modalType: string, schoolId?: string) => void;
  onRetrySchools: () => void;
}

const RecentSchoolsSection: React.FC<RecentSchoolsSectionProps> = ({
  schoolsData,
  schoolsLoading,
  schoolsError,
  onModalOpen,
  onRetrySchools
}) => {
  const handleViewSchool = (schoolId: string) => {
    console.log('👁️ RecentSchoolsSection: View school details:', schoolId);
    onModalOpen('view-school-details', schoolId);
  };

  const handleManageSchool = (schoolId: string) => {
    console.log('⚙️ RecentSchoolsSection: Manage school:', schoolId);
    onModalOpen('manage-school', schoolId);
  };

  const handleViewAllSchools = () => {
    console.log('📋 RecentSchoolsSection: View all schools');
    onModalOpen('view-all-schools');
  };

  if (schoolsLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-blue-600" />
            Recent Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading schools...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schoolsError) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-blue-600" />
              Recent Schools
            </CardTitle>
            <Button onClick={onRetrySchools} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Failed to load schools data. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Get the 5 most recent schools
  const recentSchools = schoolsData.slice(0, 5);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-blue-600" />
            Recent Schools
          </CardTitle>
          <Button 
            onClick={handleViewAllSchools}
            variant="outline" 
            size="sm"
            className="hover:bg-blue-50"
          >
            <Eye className="h-4 w-4 mr-1" />
            View All ({schoolsData.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentSchools.length === 0 ? (
          <div className="text-center py-8">
            <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first school to the system.</p>
            <Button onClick={() => onModalOpen('create-school')} className="bg-blue-600 hover:bg-blue-700">
              Add First School
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSchools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <School className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{school.name}</h4>
                    {school.address && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {school.address}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={school.owner_id ? "default" : "secondary"}>
                        {school.owner_id ? "Has Owner" : "No Owner"}
                      </Badge>
                      <Badge variant={school.principal_id ? "default" : "secondary"}>
                        {school.principal_id ? "Has Principal" : "No Principal"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleViewSchool(school.id)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleManageSchool(school.id)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSchoolsSection;
