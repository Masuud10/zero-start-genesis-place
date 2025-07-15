import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTransportRoutes, TransportRoute } from '@/hooks/transport/useTransportRoutes';
import { RouteFormDialog } from './RouteFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

export const TransportRoutesTab = () => {
  const { routes, loading, deleteRoute } = useTransportRoutes();
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<TransportRoute | null>(null);

  const handleEdit = (route: TransportRoute) => {
    setSelectedRoute(route);
    setIsFormOpen(true);
  };

  const handleDelete = (route: TransportRoute) => {
    setRouteToDelete(route);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (routeToDelete) {
      const success = await deleteRoute(routeToDelete.id);
      if (success) {
        setIsDeleteOpen(false);
        setRouteToDelete(null);
      }
    }
  };

  const columns = [
    {
      accessorKey: 'route_name' as keyof TransportRoute,
      header: 'Route Name',
    },
    {
      accessorKey: 'route_description' as keyof TransportRoute,
      header: 'Description',
      cell: ({ row }) => row.getValue('route_description') || '-',
    },
    {
      accessorKey: 'monthly_fee' as keyof TransportRoute,
      header: 'Monthly Fee (KSH)',
      cell: ({ row }) => {
        const fee = row.getValue('monthly_fee') as number;
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
        }).format(fee);
      },
    },
    {
      accessorKey: 'created_at' as keyof TransportRoute,
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Transport Routes</h3>
          <p className="text-sm text-muted-foreground">
            Manage transport routes and their monthly fees
          </p>
        </div>
        <Button onClick={() => {
          setSelectedRoute(null);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Route
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={routes}
        loading={loading}
      />

      <RouteFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        route={selectedRoute}
        onSuccess={() => {
          setIsFormOpen(false);
          setSelectedRoute(null);
        }}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Transport Route"
        description={`Are you sure you want to delete the route "${routeToDelete?.route_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};