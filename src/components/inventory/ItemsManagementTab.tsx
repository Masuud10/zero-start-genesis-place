import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';

export const ItemsManagementTab: React.FC = () => {
  const { data: items = [], isLoading } = useInventoryItems();

  const columns = [
    {
      accessorKey: 'name',
      header: 'Item Name',
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'current_quantity',
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
      accessorKey: 'reorder_level',
      header: 'Reorder Level',
    },
    {
      accessorKey: 'unit_of_measurement',
      header: 'Unit',
    },
    {
      accessorKey: 'unit_cost',
      header: 'Unit Cost',
      cell: ({ row }: any) => `KSh ${row.original.unit_cost?.toLocaleString()}`,
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