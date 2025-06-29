
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Award, 
  Settings,
  Activity,
  DollarSign,
  Shield,
  Building2,
  Globe,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import EduFamDashboardOverview from '../EduFamDashboardOverview';
import EduFamCertificateManagement from '@/components/certificates/EduFamCertificateManagement';
import EduFamReportGeneration from '@/components/reports/EduFamReportGeneration';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import SettingsModule from '@/components/modules/SettingsModule';
import CompanyManagementModule from '@/components/modules/CompanyManagementModule';
import SchoolAnalyticsList from '@/components/analytics/SchoolAnalyticsList';
import AdministrativeHub from './AdministrativeHub';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface EduFamAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const EduFamAdminDashboard = ({ onModalOpen }: EduFamAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  // Permission check - only edufam_admin should access this dashboard
  if (user?.role !== 'edufam_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Access denied. Only EduFam Administrators can access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Force a page refresh to reload all data
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const navigationTabs = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: BarChart3,
      component: <EduFamDashboardOverview />
    },
    {
      id: 'school-analytics',
      label: 'Schools Analytics',
      icon: TrendingUp,
      component: <SchoolAnalyticsList />
    },
    {
      id: 'company-management',
      label: 'Company Management',
      icon: Globe,
      component: <CompanyManagementModule />
    },
    {
      id: 'certificates',
      label: 'Certificate Management',
      icon: Award,
      component: <EduFamCertificateManagement />
    },
    {
      id: 'reports',
      label: 'Report Generation',
      icon: FileText,
      component: <EduFamReportGeneration />
    },
    {
      id: 'billing',
      label: 'Billing Management',
      icon: DollarSign,
      component: <BillingModule />
    },
    {
      id: 'system-health',
      label: 'System Health',
      icon: Activity,
      component: <SystemHealthModule />
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      component: <SettingsModule />
    },
    {
      id: 'management',
      label: 'System Management',
      icon: Shield,
      component: <AdministrativeHub onModalOpen={onModalOpen} onUserCreated={() => window.location.reload()} />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-none shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">EduFam Admin Dashboard</h1>
                  <p className="text-blue-100 text-base font-normal mt-1">
                    Comprehensive system management and analytics platform
                  </p>
                </div>
              </CardTitle>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Navigation Tabs */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 h-auto p-2 bg-gray-50">
                {navigationTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-2 py-3 px-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="hidden sm:block text-center leading-tight">{tab.label}</span>
                    <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              <div className="p-6">
                {navigationTabs.map((tab) => (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="space-y-6 mt-0"
                  >
                    <div className="min-h-[400px]">
                      {tab.component}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EduFamAdminDashboard;
