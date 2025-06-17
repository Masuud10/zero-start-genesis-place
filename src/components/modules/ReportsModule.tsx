
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportGenerationForm from '@/components/reports/ReportGenerationForm';
import ReportsList from '@/components/reports/ReportsList';
import { useReports } from '@/hooks/useReports';

const ReportsModule = () => {
  const { user } = useAuth();
  const { canGenerateReports, canViewReports, availableReportTypes } = useReports();
  
  const getUserRole = () => {
    switch (user?.role) {
      case 'principal':
        return 'principal';
      case 'school_owner':
        return 'school_owner';
      case 'finance_officer':
        return 'finance_officer';
      case 'teacher':
        return 'teacher';
      case 'parent':
        return 'parent';
      case 'edufam_admin':
        return 'edufam_admin';
      default:
        return 'teacher';
    }
  };

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'principal':
        return 'Generate comprehensive reports for academic performance, attendance, and financial analytics.';
      case 'school_owner':
        return 'View all reports generated for your school including academic and financial summaries.';
      case 'finance_officer':
        return 'Generate and manage financial reports, fee collection analytics, and payment tracking.';
      case 'parent':
        return 'Access your child\'s academic progress reports and fee payment history.';
      case 'edufam_admin':
        return 'Generate and view reports across all schools in the EduFam system.';
      default:
        return 'Access reports based on your assigned permissions.';
    }
  };

  const getQuickStats = () => {
    const stats = [
      { 
        title: 'Available Report Types', 
        value: availableReportTypes.length, 
        icon: FileText,
        color: 'text-blue-600 bg-blue-50'
      },
      { 
        title: 'Generation Access', 
        value: canGenerateReports ? 'Enabled' : 'View Only', 
        icon: TrendingUp,
        color: canGenerateReports ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
      }
    ];

    // Add role-specific stats
    if (user?.role === 'finance_officer') {
      stats.push({
        title: 'Financial Reports',
        value: 'Full Access',
        icon: DollarSign,
        color: 'text-yellow-600 bg-yellow-50'
      });
    } else if (user?.role === 'principal' || user?.role === 'edufam_admin') {
      stats.push({
        title: 'All Report Types',
        value: 'Available',
        icon: Users,
        color: 'text-purple-600 bg-purple-50'
      });
    }

    return stats;
  };

  if (!canViewReports) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">
              You don't have permission to access the reports module. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reports Center
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {getWelcomeMessage()}
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getQuickStats().map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Reports Interface */}
      <div className="space-y-6">
        <Tabs defaultValue={canGenerateReports ? "generate" : "view"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            {canGenerateReports && (
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Reports
              </TabsTrigger>
            )}
            <TabsTrigger value="view" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              View Reports
            </TabsTrigger>
          </TabsList>

          {canGenerateReports && (
            <TabsContent value="generate" className="space-y-6">
              <ReportGenerationForm />
            </TabsContent>
          )}

          <TabsContent value="view" className="space-y-6">
            <ReportsList />
          </TabsContent>
        </Tabs>
      </div>

      {/* EduFam Branding */}
      <div className="text-center pt-8 border-t">
        <p className="text-sm text-gray-500">
          Professional reports generated by{' '}
          <span className="font-semibold text-blue-600">EduFam Systems</span>
        </p>
      </div>
    </div>
  );
};

export default ReportsModule;
