
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Database, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MaintenanceModeSection from './MaintenanceModeSection';
import DataBackupSection from './DataBackupSection';
import AuditLogsSection from './AuditLogsSection';

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

      <Tabs defaultValue="maintenance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="maintenance" className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Backup & Restore</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Audit Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="mt-6">
          <MaintenanceModeSection />
        </TabsContent>

        <TabsContent value="backup" className="mt-6">
          <DataBackupSection />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EduFamSystemSettings;
