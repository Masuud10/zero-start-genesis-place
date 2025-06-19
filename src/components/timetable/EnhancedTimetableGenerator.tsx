
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Settings, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EnhancedTimetableGenerator: React.FC = () => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleGenerateTimetable = async () => {
    if (!selectedClass || !selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please select both class and term",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // Simulate timetable generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Timetable Generated",
        description: `Timetable has been generated for ${selectedClass} - ${selectedTerm}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate timetable. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishTimetable = async () => {
    setPublishing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Timetable Published",
        description: "Timetable has been published and is now visible to teachers and students",
      });
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "Failed to publish timetable. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timetable Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade1a">Grade 1A</SelectItem>
                  <SelectItem value="grade1b">Grade 1B</SelectItem>
                  <SelectItem value="grade2a">Grade 2A</SelectItem>
                  <SelectItem value="grade2b">Grade 2B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateTimetable} 
              disabled={generating || !selectedClass || !selectedTerm}
              className="flex-1"
            >
              {generating ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Timetable
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={handlePublishTimetable}
              disabled={publishing}
            >
              {publishing ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Timetables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Grade 1A - Term 1 2024</p>
                <p className="text-sm text-muted-foreground">Generated on March 15, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Published</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Grade 2B - Term 1 2024</p>
                <p className="text-sm text-muted-foreground">Generated on March 10, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Draft</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Timetable Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Timetable Preview - Grade 1A</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-2 text-left">Time</th>
                  <th className="border border-gray-200 p-2 text-left">Monday</th>
                  <th className="border border-gray-200 p-2 text-left">Tuesday</th>
                  <th className="border border-gray-200 p-2 text-left">Wednesday</th>
                  <th className="border border-gray-200 p-2 text-left">Thursday</th>
                  <th className="border border-gray-200 p-2 text-left">Friday</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-2 font-medium">8:00-8:40</td>
                  <td className="border border-gray-200 p-2">Mathematics</td>
                  <td className="border border-gray-200 p-2">English</td>
                  <td className="border border-gray-200 p-2">Science</td>
                  <td className="border border-gray-200 p-2">Mathematics</td>
                  <td className="border border-gray-200 p-2">English</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2 font-medium">8:40-9:20</td>
                  <td className="border border-gray-200 p-2">English</td>
                  <td className="border border-gray-200 p-2">Mathematics</td>
                  <td className="border border-gray-200 p-2">Social Studies</td>
                  <td className="border border-gray-200 p-2">Science</td>
                  <td className="border border-gray-200 p-2">Art</td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="border border-gray-200 p-2 font-medium">9:20-9:40</td>
                  <td className="border border-gray-200 p-2 text-center" colSpan={5}>Break</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2 font-medium">9:40-10:20</td>
                  <td className="border border-gray-200 p-2">Science</td>
                  <td className="border border-gray-200 p-2">Social Studies</td>
                  <td className="border border-gray-200 p-2">Mathematics</td>
                  <td className="border border-gray-200 p-2">English</td>
                  <td className="border border-gray-200 p-2">PE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTimetableGenerator;
