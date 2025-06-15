
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// This card shows a snapshot of key analytics for the teacher.
// The data is mock/demo; replace with real queries as needed.
const TeacherAnalyticsSummaryCard: React.FC = () => {
  // Demo data for the summary (replace with real data if available)
  const metrics = [
    {
      label: "Average Grade",
      value: "81.7%",
      trend: "+3.2%",
      highlight: "text-green-600",
    },
    {
      label: "Grades Submitted",
      value: "81/84",
      trend: "96%",
      highlight: "text-purple-600",
    },
    {
      label: "Attendance Rate",
      value: "94.2%",
      trend: "Above school avg",
      highlight: "text-orange-600",
    }
  ];

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Class Analytics Overview
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Track student grades and attendance for your classes.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="flex-1">
              <div className={`text-lg font-bold ${m.highlight}`}>{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="text-xs">{m.trend}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherAnalyticsSummaryCard;
