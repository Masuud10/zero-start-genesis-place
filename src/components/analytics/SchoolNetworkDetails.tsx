
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SchoolNetworkDetails = () => {
  const networkStats = [
    { school: 'Greenwood Primary', students: 450, teachers: 18, performance: 85, uptime: 99.8 },
    { school: 'Riverside Academy', students: 320, teachers: 14, performance: 78, uptime: 99.5 },
    { school: 'Sunshine School', students: 380, teachers: 16, performance: 82, uptime: 99.9 },
    { school: 'Oak Tree Primary', students: 290, teachers: 12, performance: 79, uptime: 99.2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Network Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {networkStats.map((school) => (
            <div key={school.school} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{school.school}</p>
                <p className="text-sm text-muted-foreground">
                  {school.students} students • {school.teachers} teachers
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">{school.performance}%</div>
                  <div className="text-muted-foreground">Performance</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">{school.uptime}%</div>
                  <div className="text-muted-foreground">Uptime</div>
                </div>
                <Badge variant={school.performance >= 80 ? 'default' : 'secondary'}>
                  {school.performance >= 80 ? 'Healthy' : 'Needs Attention'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolNetworkDetails;
