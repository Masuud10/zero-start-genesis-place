
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, BookOpen, Sparkles, Send, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const TimetableModule = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [generatedTimetable, setGeneratedTimetable] = useState(null);

  const mockClasses = ['Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B', 'Grade 3A', 'Grade 3B'];
  const mockTerms = ['Term 1 2024', 'Term 2 2024', 'Term 3 2024'];
  
  const mockTimetableData = [
    { day: 'Monday', periods: [
      { time: '8:00-8:40', subject: 'Mathematics', teacher: 'Ms. Johnson' },
      { time: '8:40-9:20', subject: 'English', teacher: 'Mr. Smith' },
      { time: '9:20-10:00', subject: 'Science', teacher: 'Dr. Brown' },
      { time: '10:20-11:00', subject: 'Social Studies', teacher: 'Ms. Wilson' },
      { time: '11:00-11:40', subject: 'Physical Education', teacher: 'Mr. Davis' }
    ]},
    { day: 'Tuesday', periods: [
      { time: '8:00-8:40', subject: 'English', teacher: 'Mr. Smith' },
      { time: '8:40-9:20', subject: 'Mathematics', teacher: 'Ms. Johnson' },
      { time: '9:20-10:00', subject: 'Art', teacher: 'Ms. Garcia' },
      { time: '10:20-11:00', subject: 'Science', teacher: 'Dr. Brown' },
      { time: '11:00-11:40', subject: 'Music', teacher: 'Mr. Anderson' }
    ]}
  ];

  const handleGenerateAITimetable = async () => {
    if (!selectedClass || !selectedTerm) {
      toast({
        title: "Error",
        description: "Please select both class and term",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedTimetable(mockTimetableData);
      setIsGenerating(false);
      toast({
        title: "Success",
        description: "AI-powered timetable generated successfully!",
      });
    }, 3000);
  };

  const handleSendToTeachers = () => {
    toast({
      title: "Success",
      description: "Timetable sent to all teachers' dashboards",
    });
  };

  const handleDownloadTimetable = () => {
    toast({
      title: "Success",
      description: "Timetable downloaded as PDF",
    });
  };

  const isPrincipalOrOwner = user?.role === 'principal' || user?.role === 'school_owner';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          Timetable Generator
        </h1>
        <p className="text-muted-foreground">Create and manage class schedules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Timetables</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Slots</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teachers</p>
                <p className="text-2xl font-bold">25</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p className="text-2xl font-bold">15</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isPrincipalOrOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Powered Timetable Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose class" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClasses.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="term">Select Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose term" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTerms.map(term => (
                      <SelectItem key={term} value={term}>{term}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleGenerateAITimetable} 
              disabled={isGenerating}
              className="w-full flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating AI Timetable...' : 'Generate AI Timetable'}
            </Button>
          </CardContent>
        </Card>
      )}

      {generatedTimetable && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Timetable - {selectedClass}</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleSendToTeachers} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send to Teachers
              </Button>
              <Button onClick={handleDownloadTimetable} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedTimetable.map((dayData, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">{dayData.day}</h3>
                  <div className="grid gap-2">
                    {dayData.periods.map((period, periodIndex) => (
                      <div key={periodIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{period.time}</span>
                        <span>{period.subject}</span>
                        <span className="text-sm text-muted-foreground">{period.teacher}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timetable Management Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered timetable generation with conflict resolution
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Flexible Periods</h3>
              <p className="text-sm text-muted-foreground">
                Configure custom time slots and break periods
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Multi-Format Export</h3>
              <p className="text-sm text-muted-foreground">
                Export timetables in PDF, Excel, and print formats
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableModule;
