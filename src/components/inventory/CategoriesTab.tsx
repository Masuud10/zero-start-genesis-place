import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useInventoryCategories, useDeleteInventoryCategory } from '@/hooks/inventory/useInventoryCategories';
import CategoryFormDialog from '@/components/inventory/CategoryFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import type { InventoryCategory } from '@/hooks/inventory/useInventoryCategories';

const CategoriesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<InventoryCategory | null>(null);

  const { data: categories = [], isLoading } = useInventoryCategories();
  const deleteCategoryMutation = useDeleteInventoryCategory();

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category: InventoryCategory) => {
    setSelectedCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDelete = (category: InventoryCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: 'name' as keyof InventoryCategory,
      header: 'Category Name',
      cell: ({ row }: { row: { original: InventoryCategory } }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'description' as keyof InventoryCategory,
      header: 'Description',
      cell: ({ row }: { row: { original: InventoryCategory } }) => (
        <span className="text-sm">{row.original.description || '-'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: InventoryCategory } }) => (
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
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setCategoryFormOpen(true);
          }}
          className="gradient-navy"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredCategories}
        loading={isLoading}
      />

      <CategoryFormDialog
        open={categoryFormOpen}
        onClose={() => {
          setCategoryFormOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
};

export default CategoriesTab;