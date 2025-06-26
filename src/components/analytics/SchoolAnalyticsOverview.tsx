
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolAnalytics } from '@/hooks/useSchoolAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, School, Users, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import EduFamSystemAnalytics from './EduFamSystemAnalytics';
import SchoolAnalyticsDetail from './SchoolAnalyticsDetail';

const SchoolAnalyticsOverview = () => {
  const { user } = useAuth();
  const { data: schoolAnalytics, isLoading, error } = useSchoolAnalytics();

  // Permission check
  if (!user || user.role !== 'edufam_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can access school analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading school analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Analytics Error</AlertTitle>
          <AlertDescription className="text-red-700">
            Failed to load school analytics data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!schoolAnalytics || schoolAnalytics.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Found</h3>
        <p className="text-gray-500">No schools are registered in the system yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System-wide Analytics Stats Icons */}
      <EduFamSystemAnalytics />

      {/* Individual School Analytics */}
      <SchoolAnalyticsDetail />
    </div>
  );
};

export default SchoolAnalyticsOverview;
