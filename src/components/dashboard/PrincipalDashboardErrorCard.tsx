
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  error: string;
  onRetry: () => void;
}

const PrincipalDashboardErrorCard: React.FC<Props> = ({ error, onRetry }) => (
  <Card className="border-red-200 bg-red-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-5 w-5" />
        Principal Dashboard Error
      </CardTitle>
      <CardDescription>
        There was a problem loading your dashboard data.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        className="px-4 py-2 border border-gray-300 rounded hover:bg-red-100"
        onClick={onRetry}
      >
        Try Again
      </button>
    </CardContent>
  </Card>
);

export default PrincipalDashboardErrorCard;
