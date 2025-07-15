import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useTransportRoutes } from '@/hooks/transport/useTransportRoutes';

export const RoutesTab: React.FC = () => {
  const { routes, loading } = useTransportRoutes();

  const columns = [
    {
      accessorKey: 'route_name',
      header: 'Route Name',
    },
    {
      accessorKey: 'pickup_area',
      header: 'Pickup Area',
    },
    {
      accessorKey: 'monthly_fee',
      header: 'Monthly Fee',
      cell: ({ row }: any) => `KSh ${row.original.monthly_fee?.toLocaleString()}`,
    },
    {
      accessorKey: 'distance_km',
      header: 'Distance (km)',
    },
    {
      accessorKey: 'pickup_time',
      header: 'Pickup Time',
    },
    {
      accessorKey: 'dropoff_time',
      header: 'Drop-off Time',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Transport Routes</h3>
          <p className="text-sm text-muted-foreground">
            Manage school transport routes and schedules
          </p>
        </div>
        <Button>Add New Route</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading routes...</div>
          ) : (
            <DataTable columns={columns} data={routes} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};