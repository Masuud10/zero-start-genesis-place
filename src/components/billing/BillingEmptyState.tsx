
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, RefreshCw } from 'lucide-react';

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
      <CardHeader>
        <CardTitle>Billing Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {description}
          </p>
          
          <div className="flex gap-3 justify-center">
            {showCreateButton && onCreateClick && (
              <Button onClick={onCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Create Billing Records
              </Button>
            )}
            
            {onRefreshClick && (
              <Button variant="outline" onClick={onRefreshClick} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingEmptyState;
