import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTransportVehicles, TransportVehicle } from '@/hooks/transport/useTransportVehicles';
import { VehicleFormDialog } from './VehicleFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

export const TransportVehiclesTab = () => {
  const { vehicles, loading, deleteVehicle } = useTransportVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<TransportVehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<TransportVehicle | null>(null);

  const handleEdit = (vehicle: TransportVehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDelete = (vehicle: TransportVehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (vehicleToDelete) {
      const success = await deleteVehicle(vehicleToDelete.id);
      if (success) {
        setIsDeleteOpen(false);
        setVehicleToDelete(null);
      }
    }
  };

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
      cell: ({ row }: { row: { getValue: (key: string) => any } }) => `${row.getValue('capacity')} students`,
    },
    {
      accessorKey: 'route_name' as keyof TransportVehicle,
      header: 'Assigned Route',
      cell: ({ row }: { row: { getValue: (key: string) => any } }) => 
        row.getValue('route_name') || 'Not Assigned',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: TransportVehicle } }) => (
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
          <h3 className="text-lg font-semibold">Transport Vehicles</h3>
          <p className="text-sm text-muted-foreground">
            Manage school vehicles and their route assignments
          </p>
        </div>
        <Button onClick={() => {
          setSelectedVehicle(null);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Vehicle
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        loading={loading}
      />

      <VehicleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        vehicle={selectedVehicle}
        onSuccess={() => {
          setIsFormOpen(false);
          setSelectedVehicle(null);
        }}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Vehicle"
        description={`Are you sure you want to delete "${vehicleToDelete?.vehicle_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};