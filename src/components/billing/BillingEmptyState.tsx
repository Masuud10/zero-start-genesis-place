
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX, Plus, RefreshCw } from 'lucide-react';

interface BillingEmptyStateProps {
  title: string;
  description: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
}

const BillingEmptyState: React.FC<BillingEmptyStateProps> = ({
  title,
  description,
  showCreateButton = false,
  onCreateClick,
  onRefreshClick,
  isRefreshing = false
}) => {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <FileX className="h-8 w-8 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-500 max-w-md mx-auto">{description}</p>
          </div>
          
          <div className="flex justify-center gap-4">
            {onRefreshClick && (
              <Button 
                variant="outline" 
                onClick={onRefreshClick}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            )}
            
            {showCreateButton && onCreateClick && (
              <Button 
                onClick={onCreateClick}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Billing Records
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingEmptyState;
