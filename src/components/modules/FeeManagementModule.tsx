
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, Users, FileText, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FeeManagementModule = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('assign');

  const handleFeeAssign = () => {
    toast({
      title: "Fee Assignment",
      description: "Fee assignment functionality will be implemented here",
    });
  };

  const handleFeeStructure = () => {
    toast({
      title: "Fee Structure",
      description: "Fee structure management functionality will be implemented here",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-2">
            Manage school fees, assignments, and payment structures
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Fee Assignment
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Fee Structure
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Collection Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Fee Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Assign by Class</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Assign fees to entire classes or grade levels
                  </p>
                  <Button onClick={handleFeeAssign} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Assign to Class
                  </Button>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Individual Assignment</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Assign specific fees to individual students
                  </p>
                  <Button onClick={handleFeeAssign} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Individual
                  </Button>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Bulk Assignment</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload CSV or Excel for bulk fee assignments
                  </p>
                  <Button onClick={handleFeeAssign} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Bulk Assign
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Fee Structure Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleFeeStructure} className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Fee Structure
                </Button>
                <div className="text-center py-8 text-gray-500">
                  Fee structure management interface will be implemented here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Collection Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Fee collection reports will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Fee Management Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Fee management settings will be available here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagementModule;
