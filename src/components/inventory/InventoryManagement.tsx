import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { InventoryDashboardTab } from './InventoryDashboardTab';
import { StockMovementsTab } from './StockMovementsTab';
import { ItemsManagementTab } from './ItemsManagementTab';
import { useInventoryStats } from '@/hooks/inventory/useStockTransactions';
import { useLowStockItems } from '@/hooks/inventory/useInventoryItems';

const InventoryManagement: React.FC = () => {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useInventoryStats();
  const { data: lowStockItems, isLoading: lowStockLoading, refetch: refetchLowStock } = useLowStockItems();

  const handleRefresh = () => {
    refetchStats();
    refetchLowStock();
  };

  const totalAvailableStock = (stats?.totalItems || 0) - (lowStockItems?.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage school inventory and supplies</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            disabled={statsLoading || lowStockLoading}
          >
            <RefreshCw className={`h-4 w-4 ${(statsLoading || lowStockLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">Inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lowStockLoading ? '...' : lowStockItems?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(statsLoading || lowStockLoading) ? '...' : totalAvailableStock}
            </div>
            <p className="text-xs text-muted-foreground">In stock items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `KSh ${stats?.monthlyMovement?.toLocaleString() || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="items">Items Management</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <InventoryDashboardTab />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovementsTab />
        </TabsContent>

        <TabsContent value="items">
          <ItemsManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;