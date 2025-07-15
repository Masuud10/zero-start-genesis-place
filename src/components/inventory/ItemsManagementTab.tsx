import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventoryItems, type InventoryItem } from '@/hooks/inventory/useInventoryItems';

export const ItemsManagementTab: React.FC = () => {
  const { data: items = [], isLoading } = useInventoryItems();

  const columns = [
    {
      accessorKey: 'name' as keyof InventoryItem,
      header: 'Item Name',
    },
    {
      accessorKey: 'sku' as keyof InventoryItem,
      header: 'SKU',
    },
    {
      accessorKey: 'current_quantity' as keyof InventoryItem,
      header: 'Current Stock',
      cell: ({ row }: any) => {
        const quantity = row.original.current_quantity;
        const reorderLevel = row.original.reorder_level;
        const isLowStock = quantity <= reorderLevel;
        
        return (
          <div className="flex items-center gap-2">
            <span>{quantity}</span>
            {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: 'reorder_level' as keyof InventoryItem,
      header: 'Reorder Level',
    },
    {
      accessorKey: 'category_id' as keyof InventoryItem,
      header: 'Category',
      cell: ({ row }: any) => row.original.category_id ? `Category ${row.original.category_id}` : '-',
    },
    {
      accessorKey: 'unit_cost' as keyof InventoryItem,
      header: 'Unit Cost',
      cell: ({ row }: any) => row.original.unit_cost ? `KSh ${row.original.unit_cost?.toLocaleString()}` : '-',
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
          <h3 className="text-lg font-medium">Items Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage inventory items and their details
          </p>
        </div>
        <Button>Add New Item</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading items...</div>
          ) : (
            <DataTable columns={columns} data={items} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};