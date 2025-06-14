
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import SchoolOwnerAnalytics from './SchoolOwnerAnalytics';
import PrincipalAnalytics from './PrincipalAnalytics';
import TeacherAnalytics from './TeacherAnalytics';
import ParentAnalytics from './ParentAnalytics';
import FinanceOfficerAnalytics from './FinanceOfficerAnalytics';
import EduFamAdminAnalytics from './EduFamAdminAnalytics';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { isSystemAdmin, schoolId, isReady } = useSchoolScopedData();
  const [filters, setFilters] = useState({
    term: 'current',
    class: 'all',
    subject: 'all',
    dateRange: 'month'
  });

  console.log('📊 AnalyticsDashboard: Rendering for user role', user?.role, {
    isSystemAdmin,
    schoolId,
    isReady
  });

  // Wait for data to be ready
  if (!isReady) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
            <div className="h-4 bg-gray-300 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  // Validate user and role
  if (!user || !user.role) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Access Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Unable to determine user permissions for analytics access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'school_owner':
        return 'School Owner Analytics';
      case 'principal':
        return 'Principal Analytics';
      case 'teacher':
        return 'Teacher Analytics';
      case 'parent':
        return 'Parent Analytics';
      case 'finance_officer':
        return 'Finance Analytics';
      case 'edufam_admin':
        return 'EduFam Admin Analytics';
      default:
        return 'Analytics Dashboard';
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'edufam_admin':
        return 'Network-wide performance and insights';
      case 'school_owner':
      case 'principal':
        return 'School performance metrics and insights';
      case 'teacher':
        return 'Class and student performance analytics';
      case 'parent':
        return 'Your children\'s academic progress and insights';
      case 'finance_officer':
        return 'Financial analytics and reporting';
      default:
        return 'Comprehensive insights and performance metrics';
    }
  };

  // Check if user needs school assignment
  const needsSchoolAssignment = ['school_owner', 'principal', 'teacher', 'finance_officer'].includes(user.role);
  
  if (needsSchoolAssignment && !schoolId) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            School Assignment Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Your account needs to be assigned to a school to view analytics. 
              Please contact your administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const renderAnalyticsByRole = () => {
    try {
      switch (user?.role) {
        case 'school_owner':
          return <SchoolOwnerAnalytics filters={filters} />;
        case 'principal':
          return <PrincipalAnalytics filters={filters} />;
        case 'teacher':
          return <TeacherAnalytics filters={filters} />;
        case 'parent':
          return <ParentAnalytics filters={filters} />;
        case 'finance_officer':
          return <FinanceOfficerAnalytics filters={filters} />;
        case 'edufam_admin':
          return <EduFamAdminAnalytics filters={filters} />;
        default:
          return (
            <Card>
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                  You don't have permission to view analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertDescription>
                    Role "{user?.role}" is not authorized for analytics access.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          );
      }
    } catch (error) {
      console.error('📊 AnalyticsDashboard: Error rendering analytics:', error);
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Analytics Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load analytics component. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }
  };

  const showFilters = ['school_owner', 'principal', 'teacher', 'finance_officer'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {getRoleTitle()}
          </h1>
          <p className="text-muted-foreground mt-1">
            {getRoleDescription()}
          </p>
          {schoolId && (
            <p className="text-xs text-gray-500 mt-1">
              School ID: {schoolId.slice(0, 8)}...
            </p>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3">
            <Select value={filters.term} onValueChange={(value) => setFilters(prev => ({ ...prev, term: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Term</SelectItem>
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
                <SelectItem value="term3">Term 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="term">This Term</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              Export Report
            </Button>
          </div>
        )}
      </div>

      {renderAnalyticsByRole()}
    </div>
  );
};

export default AnalyticsDashboard;
