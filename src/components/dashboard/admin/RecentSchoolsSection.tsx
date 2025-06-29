
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
  principal_contact?: string;
  principal_email?: string;
  owner_information?: string;
  school_type?: string;
  status?: string;
  subscription_plan?: string;
  max_students?: number;
  timezone?: string;
  term_structure?: string;
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
    console.log('🏫 RecentSchoolsSection: Processing schools data:', {
      isArray: Array.isArray(schoolsData),
      length: schoolsData?.length || 0,
      firstSchool: schoolsData?.[0]
    });
    
    if (!Array.isArray(schoolsData)) {
      console.warn('🏫 RecentSchoolsSection: schoolsData is not an array:', typeof schoolsData);
      return [];
    }
    
    const validSchools = schoolsData.filter(school => {
      if (!school) {
        console.warn('🏫 RecentSchoolsSection: Found null/undefined school');
        return false;
      }
      if (!school.id) {
        console.warn('🏫 RecentSchoolsSection: Found school without ID:', school);
        return false;
      }
      if (!school.name) {
        console.warn('🏫 RecentSchoolsSection: Found school without name:', school);
        return false;
      }
      return true;
    });

    console.log('🏫 RecentSchoolsSection: Valid schools:', validSchools.length);
    
    return validSchools
      .sort((a, b) => {
        try {
          const dateA = new Date(a.created_at || '').getTime();
          const dateB = new Date(b.created_at || '').getTime();
          return dateB - dateA;
        } catch (error) {
          console.error('🏫 RecentSchoolsSection: Date sorting error:', error);
          return 0;
        }
      })
      .slice(0, 5);
  }, [schoolsData]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        console.warn('🏫 RecentSchoolsSection: Empty date string provided');
        return 'Unknown date';
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('🏫 RecentSchoolsSection: Invalid date string:', dateString);
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('🏫 RecentSchoolsSection: Date formatting error:', error);
      return 'Unknown date';
    }
  };

  const handleViewSchool = (school: School) => {
    console.log('🏫 RecentSchoolsSection: Opening school details for:', {
      id: school.id,
      name: school.name,
      hasEmail: !!school.email,
      hasPhone: !!school.phone
    });
    
    if (!school || !school.id) {
      console.error('🏫 RecentSchoolsSection: Invalid school data for modal:', school);
      return;
    }
    
    setSelectedSchool(school);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('🏫 RecentSchoolsSection: Closing school details modal');
    setIsDetailsModalOpen(false);
    setSelectedSchool(null);
  };

  if (schoolsError) {
    console.error('🏫 RecentSchoolsSection: Schools error:', schoolsError);
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
              onClick={() => {
                console.log('🏫 RecentSchoolsSection: Add School button clicked');
                onModalOpen('manage-schools');
              }} 
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewSchool(school);
                      }}
                      className="hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {recentSchools.length > 0 && schoolsData && Array.isArray(schoolsData) && (
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

      {selectedSchool && (
        <SchoolDetailsModal
          school={selectedSchool}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default RecentSchoolsSection;
