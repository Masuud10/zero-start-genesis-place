
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Database, Shield, Bell, Users, Building2 } from 'lucide-react';
import MaintenanceSettings from './MaintenanceSettings';
import DatabaseSettings from './DatabaseSettings';
import SecuritySettingsPanel from './SecuritySettingsPanel';
import NotificationSettings from './NotificationSettings';
import UserManagementSettings from './UserManagementSettings';
import CompanySettings from './CompanySettings';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SystemSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('maintenance');

  // Only allow EduFam admins to access system settings
  if (user?.role !== 'edufam_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <Shield className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Access denied. Only EduFam Administrators can access system settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const settingsTabs = [
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Settings,
      component: <MaintenanceSettings />
    },
    {
      id: 'database',
      label: 'Database',
      icon: Database,
      component: <DatabaseSettings />
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      component: <SecuritySettingsPanel />
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: <NotificationSettings />
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      component: <UserManagementSettings />
    },
    {
      id: 'company',
      label: 'Company',
      icon: Building2,
      component: <CompanySettings />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage system-wide configurations and settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-white shadow-sm rounded-lg p-1">
            {settingsTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 hover:bg-gray-50 transition-all duration-200"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {settingsTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default SystemSettings;
