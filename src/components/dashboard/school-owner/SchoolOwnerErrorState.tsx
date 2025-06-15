
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SchoolOwnerErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

const SchoolOwnerErrorState: React.FC<SchoolOwnerErrorStateProps> = ({ error, onRetry }) => (
  <Card className="border-red-200 bg-red-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-5 w-5" />
        Dashboard Error
      </CardTitle>
      <CardDescription>
        There was a problem loading your dashboard data.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </CardContent>
  </Card>
);

export default SchoolOwnerErrorState;
