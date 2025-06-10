
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const FeatureAdoptionCard = () => {
  const featureUsage = [
    { feature: 'Grading Module', usage: 95, schools: 4 },
    { feature: 'Attendance Tracking', usage: 88, schools: 4 },
    { feature: 'Fee Collection', usage: 92, schools: 4 },
    { feature: 'Analytics', usage: 76, schools: 3 },
    { feature: 'Messaging', usage: 83, schools: 4 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Adoption Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featureUsage.map((feature) => (
            <div key={feature.feature} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{feature.feature}</p>
                <p className="text-sm text-muted-foreground">{feature.schools} schools using</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Progress value={feature.usage} className="h-2" />
                </div>
                <Badge variant={feature.usage >= 90 ? 'default' : feature.usage >= 75 ? 'secondary' : 'destructive'}>
                  {feature.usage}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureAdoptionCard;
