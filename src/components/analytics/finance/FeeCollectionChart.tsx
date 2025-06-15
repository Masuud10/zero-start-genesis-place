
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

interface FeeCollectionChartProps {
    data: {
        class: string;
        collected: number;
        expected: number;
    }[];
}

const chartConfig = {
    collected: { label: 'Collected', color: '#10b981' },
    expected: { label: 'Expected', color: '#3b82f6' },
};

const FeeCollectionChart: React.FC<FeeCollectionChartProps> = ({ data }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Fee Collection by Class</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                    <BarChart data={data}>
                        <XAxis dataKey="class" />
                        <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="collected" fill="var(--color-collected)" name="Collected (KES)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expected" fill="var(--color-expected)" name="Expected (KES)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default FeeCollectionChart;
