import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTransportVehicles, type TransportVehicle } from '@/hooks/transport/useTransportVehicles';
import { VehicleFormDialog } from './VehicleFormDialog';

export const VehiclesTab: React.FC = () => {
  const { vehicles, loading } = useTransportVehicles();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<TransportVehicle | null>(null);

  const columns = [
    {
      accessorKey: 'vehicle_name' as keyof TransportVehicle,
      header: 'Vehicle Name',
    },
    {
      accessorKey: 'registration_number' as keyof TransportVehicle,
      header: 'Registration',
    },
    {
      accessorKey: 'capacity' as keyof TransportVehicle,
      header: 'Capacity',
      cell: ({ row }: any) => `${row.original.capacity} passengers`,
    },
    {
      accessorKey: 'route_name' as keyof TransportVehicle,
      header: 'Route Assignment',
      cell: ({ row }: any) => (
        row.original.route_name ? (
          <Badge variant="default">{row.original.route_name}</Badge>
        ) : (
          <Badge variant="secondary">Not Assigned</Badge>
        )
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setEditingVehicle(row.original)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleDialogClose = () => {
    setShowCreateDialog(false);
    setEditingVehicle(null);
  };

  const handleSuccess = () => {
    handleDialogClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Transport Vehicles</h3>
          <p className="text-sm text-muted-foreground">
            Manage school transport vehicles and assignments
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>Add New Vehicle</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading vehicles...</div>
          ) : (
            <DataTable columns={columns} data={vehicles} />
          )}
        </CardContent>
      </Card>

      <VehicleFormDialog
        open={showCreateDialog || !!editingVehicle}
        onOpenChange={handleDialogClose}
        vehicle={editingVehicle}
        onSuccess={handleSuccess}
      />
    </div>
  );
};