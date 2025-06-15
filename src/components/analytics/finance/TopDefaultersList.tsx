
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TopDefaultersListProps {
  data: {
    student: string;
    class: string;
    amount: number;
  }[];
}

const TopDefaultersList: React.FC<TopDefaultersListProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Fee Defaulters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? data.map((defaulter) => (
            <div key={defaulter.student} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{defaulter.student}</p>
                <p className="text-sm text-muted-foreground">{defaulter.class}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-red-600">KES {defaulter.amount.toLocaleString()}</div>
              </div>
              <Badge variant="destructive">
                Action Required
              </Badge>
            </div>
          )) : <p className="text-center text-muted-foreground p-4">No significant defaulters found.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopDefaultersList;
