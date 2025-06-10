
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

const TransactionVolumeChart = () => {
  const transactionVolume = [
    { month: 'Jan', volume: 2500000, schools: 4, transactions: 1250 },
    { month: 'Feb', volume: 2800000, schools: 4, transactions: 1380 },
    { month: 'Mar', volume: 3200000, schools: 4, transactions: 1450 },
    { month: 'Apr', volume: 2900000, schools: 4, transactions: 1320 },
    { month: 'May', volume: 3100000, schools: 4, transactions: 1420 },
  ];

  const chartConfig = {
    volume: { label: 'Transaction Volume', color: '#10b981' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MPESA Transaction Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <LineChart data={transactionVolume}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke="var(--color-volume)" 
              strokeWidth={2}
              name="Volume (KES)"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TransactionVolumeChart;
