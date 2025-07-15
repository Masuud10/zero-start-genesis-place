import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useInventoryStats, useRecentStockTransactions } from '@/hooks/inventory/useStockTransactions';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { format } from 'date-fns';

const InventoryDashboardTab: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentStockTransactions(5);
  const { data: items, isLoading: itemsLoading } = useInventoryItems();

  const lowStockItems = items?.filter(item => item.current_quantity <= item.reorder_level) || [];

  if (statsLoading || transactionsLoading || itemsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Package,
      description: 'Items in inventory',
      color: 'text-blue-600',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      icon: AlertTriangle,
      description: 'Items below reorder level',
      color: 'text-red-600',
    },
    {
      title: 'Recent Transactions',
      value: stats?.recentTransactions || 0,
      icon: TrendingUp,
      description: 'Last 7 days',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.current_quantity} | Reorder: {item.reorder_level}
                      </p>
                    </div>
                    <div className="text-red-600 font-semibold">
                      {item.current_quantity <= 0 ? 'Out of Stock' : 'Low Stock'}
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{lowStockItems.length - 5} more items with low stock
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                All items are adequately stocked
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.inventory_items?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.transaction_type === 'stock_in' 
                          ? 'text-green-600' 
                          : transaction.transaction_type === 'stock_out'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {transaction.transaction_type === 'stock_in' ? '+' : 
                         transaction.transaction_type === 'stock_out' ? '-' : ''}
                        {Math.abs(transaction.quantity_change)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {transaction.transaction_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent transactions
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryDashboardTab;