
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Eye, Download, School, Users, TrendingUp } from 'lucide-react';
import EduFamCertificatesList from './EduFamCertificatesList';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const EduFamCertificateManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  // Permission check
  if (user?.role !== 'edufam_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Only EduFam Administrators can access certificate management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Award className="h-6 w-6" />
          EduFam Certificate Management
        </h2>
        <p className="text-muted-foreground">
          Manage and oversee all certificates generated across the EduFam network
        </p>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start p-2 bg-gray-50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                All Certificates
              </TabsTrigger>
              <TabsTrigger value="schools" className="flex items-center gap-2">
                <School className="h-4 w-4" />
                By Schools
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Across all schools
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
                      <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Generating certificates
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        New certificates
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="certificates" className="mt-0">
                <EduFamCertificatesList />
              </TabsContent>

              <TabsContent value="schools" className="mt-0">
                <div className="text-center py-12">
                  <School className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">School Certificate Analytics</h3>
                  <p className="text-gray-600">Certificate generation statistics by school coming soon.</p>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Certificate Analytics</h3>
                  <p className="text-gray-600">Detailed analytics and insights coming soon.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EduFamCertificateManagement;
