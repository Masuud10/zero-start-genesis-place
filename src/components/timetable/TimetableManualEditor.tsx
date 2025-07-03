import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Plus, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
}

interface TimetableManualEditorProps {
  entries: TimetableEntry[];
  onSave: (entries: TimetableEntry[]) => void;
  subjects: any[];
  teachers: any[];
}

const TimetableManualEditor: React.FC<TimetableManualEditorProps> = ({
  entries: initialEntries,
  onSave,
  subjects,
  teachers
}) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimetableEntry[]>(initialEntries);
  const [editingId, setEditingId] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '08:00-08:40', '08:40-09:20', '09:20-10:00', '10:00-10:40',
    '11:00-11:40', '11:40-12:20', '12:20-13:00', '13:00-13:40',
    '14:00-14:40', '14:40-15:20'
  ];

  const addNewEntry = () => {
    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      day: 'Monday',
      startTime: '08:00',
      endTime: '08:40',
      subject: '',
      teacher: '',
      room: ''
    };
    setEntries([...entries, newEntry]);
    setEditingId(newEntry.id);
  };

  const updateEntry = (id: string, field: keyof TimetableEntry, value: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleSave = () => {
    // Validate entries
    const invalidEntries = entries.filter(entry => 
      !entry.subject || !entry.teacher || !entry.day
    );

    if (invalidEntries.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for all entries",
        variant: "destructive"
      });
      return;
    }

    onSave(entries);
    setEditingId(null);
    toast({
      title: "Saved",
      description: "Timetable changes saved successfully",
    });
  };

  const getEntriesForDay = (day: string) => {
    return entries
      .filter(entry => entry.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Timetable Editor</h3>
          <p className="text-sm text-muted-foreground">
            Manually edit timetable entries. Click on any entry to modify it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addNewEntry} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
          <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map(day => (
          <Card key={day} className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-center">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getEntriesForDay(day).map(entry => (
                <div
                  key={entry.id}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    editingId === entry.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setEditingId(entry.id)}
                >
                  {editingId === entry.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={entry.startTime}
                          onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                          placeholder="08:00"
                          className="h-7 text-xs"
                        />
                        <Input
                          value={entry.endTime}
                          onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                          placeholder="08:40"
                          className="h-7 text-xs"
                        />
                      </div>
                      
                      <Select
                        value={entry.subject}
                        onValueChange={(value) => updateEntry(entry.id, 'subject', value)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={entry.teacher}
                        onValueChange={(value) => updateEntry(entry.id, 'teacher', value)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map(teacher => (
                            <SelectItem key={teacher.id} value={teacher.name}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        value={entry.room}
                        onChange={(e) => updateEntry(entry.id, 'room', e.target.value)}
                        placeholder="Room number"
                        className="h-7 text-xs"
                      />

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => setEditingId(null)}
                          className="h-6 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteEntry(entry.id)}
                          className="h-6 text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {entry.startTime}-{entry.endTime}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{entry.subject || 'No subject'}</p>
                      <p className="text-xs text-muted-foreground">{entry.teacher || 'No teacher'}</p>
                      {entry.room && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {entry.room}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {getEntriesForDay(day).length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No entries for {day}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <strong>Total Entries:</strong> {entries.length} | 
            <strong> Editing:</strong> {editingId ? 'Yes' : 'None'} | 
            <strong> Click any entry to edit</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableManualEditor;