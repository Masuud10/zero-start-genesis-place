import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import TimetableFilter from '@/components/dashboard/teacher/TimetableFilter';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen,
  Loader2,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: {
    name: string;
    code?: string;
  };
  class: {
    name: string;
  };
  room?: string;
}

const TeacherTimetableView: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [filterActive, setFilterActive] = useState(false);
  const [filters, setFilters] = useState<{ day?: string; subject?: string; class?: string }>({});
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');

  const { data: timetable, isLoading, error } = useQuery({
    queryKey: ['teacher-full-timetable', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return [];

      console.log('Fetching complete teacher timetable for:', user.id);

      const { data, error: timetableError } = await supabase
        .from('timetables')
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          room,
          subjects!inner(name, code),
          classes!inner(name)
        `)
        .eq('teacher_id', user.id)
        .eq('school_id', schoolId)
        .eq('is_published', true)
        .order('day_of_week')
        .order('start_time');

      if (timetableError) {
        console.error('Error fetching timetable:', timetableError);
        throw timetableError;
      }

      return data?.map(entry => ({
        id: entry.id,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        room: entry.room,
        subject: entry.subjects,
        class: entry.classes
      })) || [];
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  const formatTime = (timeString: string) => {
    try {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  // Get unique subjects and classes for filter
  const uniqueSubjects = React.useMemo(() => {
    if (!timetable) return [];
    const subjects = timetable.map(entry => ({ id: entry.subject.name, name: entry.subject.name }));
    return subjects.filter((subject, index, self) => 
      index === self.findIndex(s => s.id === subject.id)
    );
  }, [timetable]);

  const uniqueClasses = React.useMemo(() => {
    if (!timetable) return [];
    const classes = timetable.map(entry => ({ id: entry.class.name, name: entry.class.name }));
    return classes.filter((cls, index, self) => 
      index === self.findIndex(c => c.id === cls.id)
    );
  }, [timetable]);

  // Apply filters to timetable
  const filteredTimetable = React.useMemo(() => {
    if (!timetable) return [];
    return timetable.filter(entry => {
      const matchesDay = !filters.day || entry.day_of_week.toLowerCase() === filters.day.toLowerCase();
      const matchesSubject = !filters.subject || entry.subject.name === filters.subject;
      const matchesClass = !filters.class || entry.class.name === filters.class;
      return matchesDay && matchesSubject && matchesClass;
    });
  }, [timetable, filters]);

  const todaySchedule = filteredTimetable?.filter(entry => 
    entry.day_of_week.toLowerCase() === getCurrentDay()
  ) || [];

  const handleFilterChange = (newFilters: { day?: string; subject?: string; class?: string }) => {
    setFilters(newFilters);
  };

  const handleExportTimetable = () => {
    // Implement export functionality
    console.log('Exporting timetable...');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Teaching Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading your teaching schedule...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error('Timetable error:', error);
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Teaching Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12 text-red-600">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium">Unable to load your timetable</p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs mt-2 text-gray-500">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!timetable || timetable.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Teaching Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-6 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Teaching Schedule Available</h3>
              <p className="text-sm mb-4">Your teaching timetable hasn't been published yet.</p>
              <p className="text-sm text-blue-600">Contact your administrator for timetable setup.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            My Teaching Timetable
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your complete teaching schedule
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'daily' ? 'weekly' : 'daily')}
          >
            {viewMode === 'daily' ? 'Weekly View' : 'Daily View'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterActive(!filterActive)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {filterActive ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTimetable}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-blue-600">{filteredTimetable.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                <p className="text-2xl font-bold text-green-600">{todaySchedule.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-purple-600">{uniqueSubjects.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Different Classes</p>
                <p className="text-2xl font-bold text-orange-600">{uniqueClasses.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Filter */}
      <TimetableFilter
        onFilterChange={handleFilterChange}
        subjects={uniqueSubjects}
        classes={uniqueClasses}
        isActive={filterActive}
      />

      {/* Today's Schedule Highlight */}
      {viewMode === 'weekly' && todaySchedule.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="h-5 w-5" />
              Today's Schedule
              <Badge variant="default" className="bg-blue-600 ml-auto">
                {todaySchedule.length} {todaySchedule.length === 1 ? 'Class' : 'Classes'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-blue-600 font-mono font-medium">
                      {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{entry.subject.name}</span>
                      <span className="text-gray-500 ml-2">• {entry.class.name}</span>
                    </div>
                  </div>
                  {entry.room && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {entry.room}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly/Daily View */}
      {viewMode === 'weekly' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Weekly Schedule
              <Badge variant="outline" className="ml-auto">
                {filteredTimetable.length} Total Classes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                const daySchedule = filteredTimetable.filter(entry => 
                  entry.day_of_week.toLowerCase() === day
                );
                
                if (daySchedule.length === 0) return null;

                return (
                  <div key={day} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 capitalize">{day}</h3>
                        <Badge variant="secondary">
                          {daySchedule.length} {daySchedule.length === 1 ? 'Class' : 'Classes'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid gap-3">
                        {daySchedule.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="text-gray-600 font-mono text-sm">
                                {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">{entry.subject.name}</span>
                                {entry.subject.code && (
                                  <span className="text-gray-500 text-sm ml-1">({entry.subject.code})</span>
                                )}
                                <div className="text-sm text-gray-600">{entry.class.name}</div>
                              </div>
                            </div>
                            {entry.room && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {entry.room}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Daily View
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Detailed Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No classes scheduled for today</p>
                <p className="text-sm mt-1">Enjoy your day off!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySchedule.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Duration: {Math.round((new Date(`1970-01-01T${entry.end_time}`).getTime() - new Date(`1970-01-01T${entry.start_time}`).getTime()) / (1000 * 60))} minutes
                          </div>
                        </div>
                      </div>
                      {entry.room && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entry.room}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Subject</p>
                        <p className="text-gray-900">{entry.subject.name}</p>
                        {entry.subject.code && (
                          <p className="text-xs text-gray-500">Code: {entry.subject.code}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Class</p>
                        <p className="text-gray-900">{entry.class.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherTimetableView;