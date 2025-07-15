import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTransportVehicles } from '@/hooks/transport/useTransportVehicles';

export const VehiclesTab: React.FC = () => {
  const { vehicles, loading } = useTransportVehicles();

  const columns = [
    {
      accessorKey: 'vehicle_number',
      header: 'Vehicle Number',
    },
    {
      accessorKey: 'vehicle_type',
      header: 'Type',
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }: any) => `${row.original.capacity} seats`,
    },
    {
      accessorKey: 'route_name',
      header: 'Assigned Route',
      cell: ({ row }: any) => (
        row.original.route_name ? (
          <Badge variant="default">{row.original.route_name}</Badge>
        ) : (
          <Badge variant="secondary">Not Assigned</Badge>
        )
      ),
    },
    {
      accessorKey: 'driver_name',
      header: 'Driver',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Button variant="outline" size="sm">
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Transport Vehicles</h3>
          <p className="text-sm text-muted-foreground">
            Manage school transport vehicles and assignments
          </p>
        </div>
        <Button>Add New Vehicle</Button>
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
    </div>
  );
};