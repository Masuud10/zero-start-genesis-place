
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, RefreshCw, AlertTriangle } from 'lucide-react';

interface RecentSchoolsSectionProps {
  schoolsData: any[];
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
  return (
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          Recent Schools
          {schoolsLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
        </CardTitle>
        <CardDescription>
          Latest educational institutions joining the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schoolsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading schools...</span>
          </div>
        ) : schoolsError ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 mb-3">Failed to load schools</p>
            <p className="text-sm text-red-500 mb-3">{schoolsError.message}</p>
            <Button onClick={onRetrySchools} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : Array.isArray(schoolsData) && schoolsData.length > 0 ? (
          <div className="space-y-3">
            {schoolsData.slice(0, 5).map((school: any) => (
              <div key={school.id} className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-blue-50 hover:to-white border hover:border-blue-200 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-105 transition-transform duration-200">
                    <Building2 className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{school.name || 'Unnamed School'}</h4>
                    <p className="text-xs text-gray-600">{school.email || 'No email'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {school.created_at ? new Date(school.created_at).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-3">No schools created yet</p>
            <p className="text-gray-500 text-xs mb-4">Start building your educational network</p>
            <Button onClick={() => onModalOpen('schools')} variant="outline">
              Create School
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSchoolsSection;
