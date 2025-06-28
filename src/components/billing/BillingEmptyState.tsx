
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, RefreshCw } from 'lucide-react';

interface BillingEmptyStateProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
}

const BillingEmptyState: React.FC<BillingEmptyStateProps> = ({
  title = "No Billing Records Found",
  description = "There are no billing records in the system yet. You can create setup fees or monthly subscriptions to get started.",
  showCreateButton = true,
  onCreateClick,
  onRefreshClick,
  isRefreshing = false
}) => {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {description}
          </p>
          <div className="flex justify-center gap-3">
            {onRefreshClick && (
              <Button 
                variant="outline" 
                onClick={onRefreshClick}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            {showCreateButton && onCreateClick && (
              <Button onClick={onCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
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
