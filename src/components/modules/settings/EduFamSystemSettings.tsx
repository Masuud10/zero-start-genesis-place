
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Database, FileText, Cog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MaintenanceModeSection from './MaintenanceModeSection';
import DataBackupSection from './DataBackupSection';
import AuditLogsSection from './AuditLogsSection';
import SystemConfigSection from './SystemConfigSection';

const EduFamSystemSettings = () => {
  const { user } = useAuth();

  // Only show to EduFam admins
  if (user?.role !== 'edufam_admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Access denied. This section is only available to EduFam administrators.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">EduFam System Settings</h2>
        <p className="text-muted-foreground">
          Manage system-wide settings and configurations
        </p>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Maintenance Mode
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Backup
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Cog className="w-4 h-4" />
            System Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceModeSection />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <DataBackupSection />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditLogsSection />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <SystemConfigSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EduFamSystemSettings;
