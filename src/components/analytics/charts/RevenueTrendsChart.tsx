
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

interface RevenueTrendsChartProps {
  data: Array<{ month: string; revenue: number; transactions: number }>;
  totalRevenue: number;
}

const RevenueTrendsChart = ({ data, totalRevenue }: RevenueTrendsChartProps) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <DollarSign className="w-5 h-5 text-orange-600" />
          Revenue Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-2xl font-bold text-orange-600">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
            <XAxis dataKey="month" stroke="#c2410c" fontSize={11} />
            <YAxis stroke="#c2410c" fontSize={11} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #fed7aa',
                borderRadius: '8px' 
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Bar 
              dataKey="revenue" 
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueTrendsChart;
