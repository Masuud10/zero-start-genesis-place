import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransportRoutesTab } from '@/components/transport/TransportRoutesTab';
import { TransportVehiclesTab } from '@/components/transport/TransportVehiclesTab';
import { StudentAssignmentsTab } from '@/components/transport/StudentAssignmentsTab';
import { Bus, Users, Route } from 'lucide-react';

const TransportManagementPage = () => {
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Bus className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport Management</h1>
          <p className="text-muted-foreground">
            Manage school transport routes, vehicles, and student assignments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transport System</CardTitle>
          <CardDescription>
            Comprehensive management of your school's transportation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="routes" className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Routes
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="flex items-center gap-2">
                <Bus className="h-4 w-4" />
                Vehicles
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Student Assignments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="routes" className="mt-6">
              <TransportRoutesTab />
            </TabsContent>

            <TabsContent value="vehicles" className="mt-6">
              <TransportVehiclesTab />
            </TabsContent>

            <TabsContent value="assignments" className="mt-6">
              <StudentAssignmentsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransportManagementPage;