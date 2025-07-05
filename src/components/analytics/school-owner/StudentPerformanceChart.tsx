import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { GraduationCap } from "lucide-react";

interface StudentPerformanceChartProps {
  performanceData: Array<{
    subject: string;
    average: number;
    students: number;
  }>;
  chartConfig: any;
}

const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({
  performanceData,
  chartConfig,
}) => {
  return (
    <Card className="shadow-md border-0 rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5" />
          Student Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Average scores by subject
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={{ stroke: "#e5e7eb" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={{ stroke: "#e5e7eb" }}
                domain={[0, 100]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`${value}%`, "Average Score"]}
              />
              <Bar
                dataKey="average"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StudentPerformanceChart;
