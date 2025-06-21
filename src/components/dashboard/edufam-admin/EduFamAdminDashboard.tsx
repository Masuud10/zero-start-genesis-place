
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
  Globe
} from 'lucide-react';
import EduFamDashboardOverview from '../EduFamDashboardOverview';
import EduFamCertificateManagement from '@/components/certificates/EduFamCertificateManagement';
import EduFamReportGeneration from '@/components/reports/EduFamReportGeneration';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import SettingsModule from '@/components/modules/SettingsModule';
import CompanyManagementModule from '@/components/modules/CompanyManagementModule';
import AdministrativeHub from './AdministrativeHub';

interface EduFamAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const EduFamAdminDashboard = ({ onModalOpen }: EduFamAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const navigationTabs = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: BarChart3,
      component: <EduFamDashboardOverview />
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
      component: <AdministrativeHub onModalOpen={onModalOpen} onUserCreated={() => {}} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-none shadow-xl">
        <CardHeader>
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
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-2 bg-gray-50">
              {navigationTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-2 py-3 px-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="hidden sm:block">{tab.label}</span>
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
                  {tab.component}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EduFamAdminDashboard;
