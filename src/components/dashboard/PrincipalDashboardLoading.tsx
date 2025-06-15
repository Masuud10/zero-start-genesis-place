
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const PrincipalDashboardLoading: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Principal Dashboard</h2>
      <p className="text-gray-600">Loading your school data...</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-16 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default PrincipalDashboardLoading;
