
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UpcomingEvent {
  event: string;
  date: string;
  time: string;
  child: string;
}

interface UpcomingEventsSectionProps {
  events: UpcomingEvent[];
}

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({ events }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📅</span>
          <span>Upcoming Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
              <div>
                <p className="font-medium text-sm">{event.event}</p>
                <p className="text-xs text-muted-foreground">For: {event.child}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{event.date}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsSection;
