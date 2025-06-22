
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeeCreationForm from './FeeCreationForm';
import FeeAssignmentDialog from './FeeAssignmentDialog';
import FeeStructureList from './FeeStructureList';
import { DollarSign, Users, FileText, Settings } from 'lucide-react';

const ComprehensiveFeeManagement: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<any>(null);

  const handleFeeCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAssignmentComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditFeeStructure = (feeStructure: any) => {
    setSelectedFeeStructure(feeStructure);
    // You can implement edit functionality here
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive fee structure management, assignment, and tracking
          </p>
        </div>
      </div>

      <Tabs defaultValue="structures" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="structures" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Fee Structures
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Fee Assignment
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

        <TabsContent value="structures" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Fee Structures
              </CardTitle>
              <FeeCreationForm onFeeCreated={handleFeeCreated} />
            </CardHeader>
            <CardContent>
              <FeeStructureList 
                refreshTrigger={refreshTrigger} 
                onEdit={handleEditFeeStructure}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Fee Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Assign by Class</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Assign fees to entire classes or grade levels
                  </p>
                  <FeeAssignmentDialog 
                    mode="class" 
                    onAssignmentComplete={handleAssignmentComplete}
                  />
                </Card>
                
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Individual Assignment</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Assign specific fees to individual students
                  </p>
                  <FeeAssignmentDialog 
                    mode="student" 
                    onAssignmentComplete={handleAssignmentComplete}
                  />
                </Card>
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
                Fee collection reports functionality will be implemented in the Reports module.
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
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  Fee management settings and configurations will be available here.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveFeeManagement;
