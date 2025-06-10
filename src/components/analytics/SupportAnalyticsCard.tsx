
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupportAnalyticsCard = () => {
  const supportTickets = [
    { category: 'Technical', open: 12, resolved: 45, avgTime: 4.2 },
    { category: 'Feature Request', open: 8, resolved: 23, avgTime: 12.5 },
    { category: 'Billing', open: 3, resolved: 18, avgTime: 2.1 },
    { category: 'Training', open: 5, resolved: 31, avgTime: 6.8 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Ticket Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportTickets.map((ticket) => (
            <div key={ticket.category} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{ticket.category}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Open:</span>
                  <span className="font-medium text-red-600">{ticket.open}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Resolved:</span>
                  <span className="font-medium text-green-600">{ticket.resolved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Time:</span>
                  <span className="font-medium">{ticket.avgTime}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportAnalyticsCard;
