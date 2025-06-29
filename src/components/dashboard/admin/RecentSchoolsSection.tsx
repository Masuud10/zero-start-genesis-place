import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Plus, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import SchoolDetailsModal from '@/components/modals/SchoolDetailsModal';

interface School {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  owner_id?: string;
  curriculum_type?: string;
  registration_number?: string;
  year_established?: number;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  principal_name?: string;
  owner_information?: string;
}

interface RecentSchoolsSectionProps {
  schoolsData: School[];
  schoolsLoading: boolean;
  schoolsError: Error | null;
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const recentSchools = React.useMemo(() => {
    if (!Array.isArray(schoolsData)) return [];
    return schoolsData
      .filter(school => school && school.id && school.name)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [schoolsData]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const handleViewSchool = (school: School) => {
    setSelectedSchool(school);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSchool(null);
  };

  if (schoolsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Recent Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Schools</h3>
              <p className="text-gray-600 mb-4">
                {schoolsError.message || 'Unable to fetch schools data'}
              </p>
              <Button onClick={onRetrySchools} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Recent Schools
              {schoolsLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
            <Button 
              onClick={() => onModalOpen('manage-schools')} 
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentSchools.length === 0 ? (
            <div className="text-center py-8">
              <School className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Yet</h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first school to the system.
              </p>
              <Button onClick={() => onModalOpen('manage-schools')}>
                <Plus className="h-4 w-4 mr-2" />
                Add First School
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSchools.map((school) => (
                <div key={school.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {school.name}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {school.email && (
                        <p className="truncate">📧 {school.email}</p>
                      )}
                      {school.phone && (
                        <p>📞 {school.phone}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Added {formatDate(school.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewSchool(school)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {recentSchools.length > 0 && (
                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onModalOpen('manage-schools')}
                  >
                    View All Schools ({schoolsData.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SchoolDetailsModal
        school={selectedSchool}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default RecentSchoolsSection;
