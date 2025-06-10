
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import SchoolOwnerAnalytics from './SchoolOwnerAnalytics';
import PrincipalAnalytics from './PrincipalAnalytics';
import TeacherAnalytics from './TeacherAnalytics';
import ParentAnalytics from './ParentAnalytics';
import FinanceOfficerAnalytics from './FinanceOfficerAnalytics';
import EduFamAdminAnalytics from './EduFamAdminAnalytics';
import ElimshaAdminAnalytics from './ElimshaAdminAnalytics';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    term: 'current',
    class: 'all',
    subject: 'all',
    dateRange: 'month'
  });

  console.log('📊 AnalyticsDashboard: Rendering for user role', user?.role);

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
      case 'elimisha_admin':
        return 'Elimisha Admin Analytics';
      default:
        return 'Analytics Dashboard';
    }
  };

  const renderAnalyticsByRole = () => {
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
      case 'elimisha_admin':
        return <ElimshaAdminAnalytics filters={filters} />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to view analytics.
              </CardDescription>
            </CardHeader>
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
            {user?.role === 'elimisha_admin' 
              ? 'System-wide monitoring and management dashboard'
              : user?.role === 'edufam_admin'
              ? 'Network-wide performance and insights'
              : 'Comprehensive insights and performance metrics'
            }
          </p>
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
