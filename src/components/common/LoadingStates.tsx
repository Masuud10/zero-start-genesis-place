import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface LoadingCardProps {
  title: string;
  description?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title,
  description,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

interface ErrorStateProps {
  title: string;
  description: string;
  error?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  error,
  onRetry,
}) => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-red-700">{description}</p>
        {error && (
          <div className="p-3 bg-red-100 rounded-md">
            <p className="text-sm text-red-800 font-mono">{error}</p>
          </div>
        )}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
