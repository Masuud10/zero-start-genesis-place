import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Server,
  FileText,
  Users,
  BarChart3,
  Calendar,
  BookOpen,
  Shield,
  Settings,
  Home,
} from "lucide-react";

// Skeleton loaders for different content types
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="space-y-3">
    {/* Header skeleton */}
    <div className="flex items-center space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-24" />
      ))}
    </div>
    {/* Row skeletons */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: cards }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// Loading states with context
export const LoadingState: React.FC<{
  message?: string;
  type?: "spinner" | "dots" | "pulse";
  size?: "sm" | "md" | "lg";
}> = ({ message = "Loading...", type = "spinner", size = "md" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {type === "spinner" && (
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      )}
      {type === "dots" && (
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
      {type === "pulse" && (
        <div
          className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse`}
        />
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

// Error states with different types
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  type?: "network" | "server" | "data" | "permission" | "generic";
  onRetry?: () => void;
  showHomeButton?: boolean;
}> = ({
  title,
  message,
  type = "generic",
  onRetry,
  showHomeButton = false,
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          icon: <WifiOff className="h-12 w-12 text-red-500" />,
          title: title || "Network Error",
          message:
            message ||
            "Unable to connect to the server. Please check your internet connection.",
        };
      case "server":
        return {
          icon: <Server className="h-12 w-12 text-orange-500" />,
          title: title || "Server Error",
          message:
            message ||
            "The server is experiencing issues. Please try again later.",
        };
      case "data":
        return {
          icon: <Database className="h-12 w-12 text-blue-500" />,
          title: title || "Data Error",
          message:
            message || "Unable to load the requested data. Please try again.",
        };
      case "permission":
        return {
          icon: <Shield className="h-12 w-12 text-yellow-500" />,
          title: title || "Access Denied",
          message:
            message || "You don't have permission to access this resource.",
        };
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          title: title || "Something went wrong",
          message: message || "An unexpected error occurred. Please try again.",
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      {config.icon}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{config.title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {config.message}
        </p>
      </div>
      <div className="flex space-x-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        {showHomeButton && (
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};

// Empty states for different content types
export const EmptyState: React.FC<{
  title: string;
  message: string;
  type?:
    | "students"
    | "grades"
    | "attendance"
    | "reports"
    | "analytics"
    | "settings"
    | "generic";
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title, message, type = "generic", action }) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case "students":
        return <Users className="h-12 w-12 text-muted-foreground" />;
      case "grades":
        return <FileText className="h-12 w-12 text-muted-foreground" />;
      case "attendance":
        return <Calendar className="h-12 w-12 text-muted-foreground" />;
      case "reports":
        return <BarChart3 className="h-12 w-12 text-muted-foreground" />;
      case "analytics":
        return <BarChart3 className="h-12 w-12 text-muted-foreground" />;
      case "settings":
        return <Settings className="h-12 w-12 text-muted-foreground" />;
      default:
        return <FileText className="h-12 w-12 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      {getEmptyStateConfig()}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Connection status indicator
export const ConnectionStatus: React.FC<{ isOnline: boolean }> = ({
  isOnline,
}) => {
  if (isOnline) return null;

  return (
    <Alert className="fixed bottom-4 right-4 w-80 z-50">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>Connection Lost</AlertTitle>
      <AlertDescription>
        You're currently offline. Some features may not work properly.
      </AlertDescription>
    </Alert>
  );
};

// Progress indicator for long operations
export const ProgressIndicator: React.FC<{
  current: number;
  total: number;
  message?: string;
  showPercentage?: boolean;
}> = ({ current, total, message, showPercentage = true }) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-muted-foreground text-right">
          {current} of {total} ({percentage}%)
        </p>
      )}
    </div>
  );
};

// Maintenance mode indicator
export const MaintenanceMode: React.FC<{
  message?: string;
  estimatedTime?: string;
}> = ({ message, estimatedTime }) => (
  <Alert className="border-yellow-200 bg-yellow-50">
    <AlertCircle className="h-4 w-4 text-yellow-600" />
    <AlertTitle className="text-yellow-800">Maintenance Mode</AlertTitle>
    <AlertDescription className="text-yellow-700">
      {message || "The system is currently under maintenance."}
      {estimatedTime && (
        <p className="mt-1 text-sm">Estimated completion: {estimatedTime}</p>
      )}
    </AlertDescription>
  </Alert>
);

// Data validation error
export const ValidationError: React.FC<{
  errors: string[];
  onFix?: () => void;
}> = ({ errors, onFix }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Validation Errors</AlertTitle>
    <AlertDescription>
      <ul className="list-disc list-inside space-y-1 mt-2">
        {errors.map((error, index) => (
          <li key={index} className="text-sm">
            {error}
          </li>
        ))}
      </ul>
      {onFix && (
        <Button onClick={onFix} variant="outline" size="sm" className="mt-2">
          Fix Issues
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

export default {
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton,
  FormSkeleton,
  LoadingState,
  ErrorState,
  EmptyState,
  ConnectionStatus,
  ProgressIndicator,
  MaintenanceMode,
  ValidationError,
};
