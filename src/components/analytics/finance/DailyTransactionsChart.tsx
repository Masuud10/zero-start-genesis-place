import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

interface DailyTransactionsChartProps {
    data: {
        date: string;
        amount: number;
    }[];
}

const chartConfig = {
    amount: { label: 'Amount', color: 'hsl(262, 83%, 58%)' },
};

const DailyTransactionsChart: React.FC<DailyTransactionsChartProps> = ({ data }) => {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Daily Transaction Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-60">
              <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--color-amount)" 
                  strokeWidth={2}
                  name="Amount (KES)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
    );
};

export default DailyTransactionsChart;
