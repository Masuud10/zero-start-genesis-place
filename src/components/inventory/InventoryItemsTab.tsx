import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useInventoryItems, useDeleteInventoryItem } from '@/hooks/inventory/useInventoryItems';
import ItemFormDialog from '@/components/inventory/ItemFormDialog';
import ItemDetailsDialog from '@/components/inventory/ItemDetailsDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import type { InventoryItem } from '@/hooks/inventory/useInventoryItems';

const InventoryItemsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const { data: items = [], isLoading } = useInventoryItems();
  const deleteItemMutation = useDeleteInventoryItem();

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemFormOpen(true);
  };

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemDetailsOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: 'name' as keyof InventoryItem,
      header: 'Item Name',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.sku && (
            <div className="text-sm text-muted-foreground">SKU: {row.original.sku}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'category_id' as keyof InventoryItem,
      header: 'Category',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <span className="text-sm">
          Category {row.original.category_id || 'None'}
        </span>
      ),
    },
    {
      accessorKey: 'current_quantity' as keyof InventoryItem,
      header: 'Current Stock',
      cell: ({ row }: { row: { original: InventoryItem } }) => {
        const item = row.original;
        const isLowStock = item.current_quantity <= item.reorder_level;
        return (
          <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-foreground'}`}>
            {item.current_quantity}
          </span>
        );
      },
    },
    {
      accessorKey: 'reorder_level' as keyof InventoryItem,
      header: 'Reorder Level',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <span className="text-sm">{row.original.reorder_level}</span>
      ),
    },
    {
      accessorKey: 'supplier_id' as keyof InventoryItem,
      header: 'Supplier',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <span className="text-sm">
          Supplier {row.original.supplier_id || 'None'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
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
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedItem(null);
            setItemFormOpen(true);
          }}
          className="gradient-navy"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        loading={isLoading}
      />

      <ItemFormDialog
        open={itemFormOpen}
        onClose={() => {
          setItemFormOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />

      <ItemDetailsDialog
        open={itemDetailsOpen}
        onClose={() => {
          setItemDetailsOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default InventoryItemsTab;