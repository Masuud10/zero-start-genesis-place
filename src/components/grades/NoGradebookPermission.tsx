
import React from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface NoGradebookPermissionProps {
  role: string | undefined;
  hasPermission: boolean;
}

const NoGradebookPermission: React.FC<NoGradebookPermissionProps> = ({ role, hasPermission }) => (
  <Card>
    <CardHeader>
      <CardTitle>Access Denied</CardTitle>
      <CardDescription>
        You don't have permission to view grades.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        Please contact your administrator if you believe you should have access to this feature.
      </p>
      <div className="text-xs text-gray-400 mt-2">
        Role: {role} | Permission: {hasPermission ? "Allowed" : "Denied"}
      </div>
    </CardContent>
  </Card>
);
export default NoGradebookPermission;
