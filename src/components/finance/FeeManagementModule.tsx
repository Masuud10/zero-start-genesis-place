
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, PlusCircle, RefreshCw } from 'lucide-react';
import { useFeeManagement } from '@/hooks/useFeeManagement';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FeeManagementModule: React.FC = () => {
  const { feeStructures, classFeesSummary, loading, error, refetch } = useFeeManagement();

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading fee management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertDescription>
          Failed to load fee management data: {error}
          <Button onClick={refetch} variant="outline" size="sm" className="ml-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Fee Management
          </h1>
          <p className="text-muted-foreground">Manage fee structures and class assignments</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fee Structures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Active Fee Structures</h3>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Fee Structure
              </Button>
            </div>
            
            {feeStructures.length > 0 ? (
              <div className="grid gap-4">
                {feeStructures.map((structure) => (
                  <Card key={structure.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{structure.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {structure.academic_year} - {structure.term}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(structure.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${structure.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {structure.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <Button variant="outline" size="sm">
                            Assign to Class
                          </Button>
                        </div>
                      </div>
                      {structure.items && structure.items.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Fee Items:</p>
                          <div className="grid gap-2">
                            {structure.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                <span>{item.name} ({item.category})</span>
                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No fee structures created yet</p>
                <p className="text-sm">Create your first fee structure to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Class Fees Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Class Fee Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {classFeesSummary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Class</th>
                    <th className="text-right p-2">Total Fees</th>
                    <th className="text-right p-2">Collected</th>
                    <th className="text-right p-2">Outstanding</th>
                    <th className="text-right p-2">Students</th>
                    <th className="text-right p-2">Collection Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {classFeesSummary.map((classData, index) => {
                    const collectionRate = classData.total_fees > 0 
                      ? ((classData.collected / classData.total_fees) * 100).toFixed(1)
                      : '0';
                    return (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{classData.class_name}</td>
                        <td className="p-2 text-right">{formatCurrency(classData.total_fees || 0)}</td>
                        <td className="p-2 text-right text-green-600">{formatCurrency(classData.collected || 0)}</td>
                        <td className="p-2 text-right text-red-600">{formatCurrency(classData.outstanding || 0)}</td>
                        <td className="p-2 text-right">{classData.student_count}</td>
                        <td className="p-2 text-right">
                          <span className={`font-medium ${parseFloat(collectionRate) >= 80 ? 'text-green-600' : parseFloat(collectionRate) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {collectionRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No class fee data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeManagementModule;
