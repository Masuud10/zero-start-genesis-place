import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useInventorySuppliers, useDeleteInventorySupplier } from '@/hooks/inventory/useInventorySuppliers';
import SupplierFormDialog from '@/components/inventory/SupplierFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import type { InventorySupplier } from '@/hooks/inventory/useInventorySuppliers';

const SuppliersTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<InventorySupplier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<InventorySupplier | null>(null);

  const { data: suppliers = [], isLoading } = useInventorySuppliers();
  const deleteSupplierMutation = useDeleteInventorySupplier();

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: InventorySupplier) => {
    setSelectedSupplier(supplier);
    setSupplierFormOpen(true);
  };

  const handleDelete = (supplier: InventorySupplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplierMutation.mutate(supplierToDelete.id);
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: 'name' as keyof InventorySupplier,
      header: 'Supplier Name',
      cell: ({ row }: { row: { original: InventorySupplier } }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'contact_person' as keyof InventorySupplier,
      header: 'Contact Person',
      cell: ({ row }: { row: { original: InventorySupplier } }) => (
        <span className="text-sm">{row.original.contact_person || '-'}</span>
      ),
    },
    {
      accessorKey: 'phone_number' as keyof InventorySupplier,
      header: 'Phone',
      cell: ({ row }: { row: { original: InventorySupplier } }) => (
        <span className="text-sm">{row.original.phone_number || '-'}</span>
      ),
    },
    {
      accessorKey: 'email' as keyof InventorySupplier,
      header: 'Email',
      cell: ({ row }: { row: { original: InventorySupplier } }) => (
        <span className="text-sm">{row.original.email || '-'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: InventorySupplier } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedSupplier(null);
            setSupplierFormOpen(true);
          }}
          className="gradient-navy"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Supplier
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredSuppliers}
        loading={isLoading}
      />

      <SupplierFormDialog
        open={supplierFormOpen}
        onClose={() => {
          setSupplierFormOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${supplierToDelete?.name}"? This action cannot be undone.`}
        isLoading={deleteSupplierMutation.isPending}
      />
    </div>
  );
};

export default SuppliersTab;