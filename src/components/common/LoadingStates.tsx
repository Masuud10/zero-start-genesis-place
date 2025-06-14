
import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = "Loading...",
  description = "Please wait while we fetch your data",
  className
}) => {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  description = "An error occurred while loading your data",
  error,
  onRetry,
  className
}) => {
  return (
    <Card className={cn("w-full max-w-md mx-auto border-red-200 bg-red-50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-red-700">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-xs text-red-600 mb-4 bg-red-100 p-2 rounded font-mono">
            {error}
          </div>
        )}
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  description = "There's nothing to display yet",
  action,
  className
}) => {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-6 text-center">
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
};
