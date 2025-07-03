import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Eye, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string;
  room: string;
  class_name: string;
  is_published: boolean;
  created_at: string;
}

interface TimetablePublisherProps {
  schoolId: string;
}

const TimetablePublisher: React.FC<TimetablePublisherProps> = ({ schoolId }) => {
  const { toast } = useToast();
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<TimetableEntry | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState('');

  const loadTimetables = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('timetables')
        .select(`
          *,
          subject:subjects(name),
          teacher:profiles(name),
          class:classes(name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTimetables = data?.map(item => ({
        id: item.id,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        subject_name: (item.subject as any)?.name || 'Unknown Subject',
        teacher_name: (item.teacher as any)?.name || 'Unknown Teacher',
        room: item.room || 'TBA',
        class_name: (item.class as any)?.name || 'Unknown Class',
        is_published: item.is_published || false,
        created_at: item.created_at
      })) || [];

      setTimetables(formattedTimetables);
    } catch (error) {
      console.error('Error loading timetables:', error);
      toast({
        title: "Error",
        description: "Failed to load timetables",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (schoolId) {
      loadTimetables();
    }
  }, [schoolId]);

  const handlePublish = async (timetableId: string) => {
    setIsPublishing(timetableId);
    try {
      // Update timetable to published status
      const { error } = await supabase
        .from('timetables')
        .update({ 
          is_published: true,
          published_at: new Date().toISOString(),
          publish_message: publishMessage || 'Timetable has been published'
        })
        .eq('id', timetableId);

      if (error) throw error;

      // Create announcement for teachers about timetable publication
      const { error: announcementError } = await supabase
        .from('announcements')
        .insert({
          title: 'New Timetable Published',
          content: publishMessage || 'A new timetable has been published for your class',
          target_audience: ['teachers'] as string[],
          priority: 'medium',
          created_by: schoolId // This should be the principal's user id
        });

      if (announcementError) {
        console.warn('Failed to create announcement:', announcementError);
      }

      toast({
        title: "Success",
        description: "Timetable published and teachers notified!",
      });

      // Refresh data
      await loadTimetables();
      setPublishMessage('');
      
    } catch (error) {
      console.error('Error publishing timetable:', error);
      toast({
        title: "Error", 
        description: "Failed to publish timetable",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(null);
    }
  };

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge variant="default" className="bg-green-600">
        <CheckCircle className="w-3 h-3 mr-1" />
        Published
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Draft
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
          <p>Loading timetables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Timetable Publisher</h2>
          <p className="text-muted-foreground">Manage and publish timetables to teachers</p>
        </div>
        <Button onClick={loadTimetables} variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Timetables</CardTitle>
        </CardHeader>
        <CardContent>
          {timetables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No timetables found. Generate some timetables first.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetables.slice(0, 10).map((timetable) => (
                  <TableRow key={timetable.id}>
                    <TableCell className="font-medium">{timetable.class_name}</TableCell>
                    <TableCell>{timetable.subject_name}</TableCell>
                    <TableCell>{timetable.teacher_name}</TableCell>
                    <TableCell className="capitalize">{timetable.day_of_week}</TableCell>
                    <TableCell>{timetable.start_time} - {timetable.end_time}</TableCell>
                    <TableCell>{timetable.room}</TableCell>
                    <TableCell>{getStatusBadge(timetable.is_published)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTimetable(timetable)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!timetable.is_published && (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(timetable.id)}
                            disabled={isPublishing === timetable.id}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            {isPublishing === timetable.id ? 'Publishing...' : 'Publish'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Timetable Details Dialog */}
      <Dialog open={!!selectedTimetable} onOpenChange={() => setSelectedTimetable(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Timetable Details</DialogTitle>
          </DialogHeader>
          {selectedTimetable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Class</Label>
                  <p className="text-sm">{selectedTimetable.class_name}</p>
                </div>
                <div>
                  <Label>Subject</Label>
                  <p className="text-sm">{selectedTimetable.subject_name}</p>
                </div>
                <div>
                  <Label>Teacher</Label>
                  <p className="text-sm">{selectedTimetable.teacher_name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(selectedTimetable.is_published)}
                </div>
              </div>
              
              {!selectedTimetable.is_published && (
                <div className="space-y-2">
                  <Label>Publish Message (Optional)</Label>
                  <Textarea
                    value={publishMessage}
                    onChange={(e) => setPublishMessage(e.target.value)}
                    placeholder="Add a message for teachers about this timetable..."
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={() => handlePublish(selectedTimetable.id)}
                    disabled={isPublishing === selectedTimetable.id}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isPublishing === selectedTimetable.id ? 'Publishing...' : 'Publish to Teachers'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetablePublisher;