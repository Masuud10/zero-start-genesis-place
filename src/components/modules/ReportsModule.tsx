
import React from 'react';
import BeautifulReportGeneration from '@/components/dashboard/shared/BeautifulReportGeneration';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, Calendar, Users, GraduationCap, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReportsModule = () => {
  const { user } = useAuth();
  
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

  const getReportTypes = () => {
    const role = getUserRole();
    
    switch (role) {
      case 'principal':
      case 'school_owner':
        return [
          { icon: GraduationCap, title: 'Academic Performance', description: 'Student grades and academic progress', color: 'text-blue-600 bg-blue-50' },
          { icon: Users, title: 'Attendance Reports', description: 'Student attendance trends and patterns', color: 'text-green-600 bg-green-50' },
          { icon: DollarSign, title: 'Financial Reports', description: 'Fee collection and payment analytics', color: 'text-yellow-600 bg-yellow-50' },
          { icon: BarChart3, title: 'Comprehensive Reports', description: 'Complete school performance overview', color: 'text-purple-600 bg-purple-50' }
        ];
      case 'finance_officer':
        return [
          { icon: DollarSign, title: 'Financial Reports', description: 'Fee collection and payment analytics', color: 'text-yellow-600 bg-yellow-50' },
          { icon: Users, title: 'Student Accounts', description: 'Individual student payment records', color: 'text-green-600 bg-green-50' },
          { icon: TrendingUp, title: 'Revenue Analytics', description: 'Income trends and projections', color: 'text-blue-600 bg-blue-50' }
        ];
      case 'teacher':
        return [
          { icon: GraduationCap, title: 'Class Grades', description: 'Your class performance reports', color: 'text-blue-600 bg-blue-50' },
          { icon: Users, title: 'Class Attendance', description: 'Student attendance in your classes', color: 'text-green-600 bg-green-50' }
        ];
      case 'parent':
        return [
          { icon: GraduationCap, title: 'Child Progress', description: 'Your child\'s academic performance', color: 'text-blue-600 bg-blue-50' },
          { icon: Users, title: 'Attendance Record', description: 'Your child\'s attendance history', color: 'text-green-600 bg-green-50' },
          { icon: DollarSign, title: 'Fee Statement', description: 'Payment history and outstanding fees', color: 'text-yellow-600 bg-yellow-50' }
        ];
      default:
        return [
          { icon: BarChart3, title: 'System Reports', description: 'Comprehensive system analytics', color: 'text-purple-600 bg-purple-50' },
          { icon: Users, title: 'User Analytics', description: 'Platform usage and engagement', color: 'text-green-600 bg-green-50' },
          { icon: TrendingUp, title: 'Performance Metrics', description: 'System performance indicators', color: 'text-blue-600 bg-blue-50' }
        ];
    }
  };

  const reportTypes = getReportTypes();

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
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Generate comprehensive reports and analytics for data-driven insights into your school's performance
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Download className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Available Reports</p>
                <p className="text-2xl font-bold text-blue-900">{reportTypes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Current Term</p>
                <p className="text-2xl font-bold text-green-900">Term 1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Data Accuracy</p>
                <p className="text-2xl font-bold text-purple-900">99.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">Last Updated</p>
                <p className="text-2xl font-bold text-orange-900">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types Overview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Available Report Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((reportType, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-lg ${reportType.color} flex items-center justify-center`}>
                    <reportType.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{reportType.title}</h3>
                    <p className="text-gray-600 text-sm">{reportType.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Report Generation Component */}
      <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white text-center">Generate Reports</h2>
          <p className="text-blue-100 text-center mt-2">Select your preferences and generate detailed reports instantly</p>
        </div>
        <div className="p-6">
          <BeautifulReportGeneration userRole={getUserRole()} />
        </div>
      </div>

      {/* Footer Information */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">
          Reports are generated in real-time based on the latest data available
        </p>
        <p className="text-xs text-gray-400">
          For technical support with reports, please contact your system administrator
        </p>
      </div>
    </div>
  );
};

export default ReportsModule;
