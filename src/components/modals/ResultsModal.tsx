
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface ResultsModalProps {
  onClose: () => void;
}

const ResultsModal = ({ onClose }: ResultsModalProps) => {
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [releaseToParents, setReleaseToParents] = useState(false);

  const mockResults = [
    { 
      class: 'Grade 1A', 
      totalStudents: 25, 
      gradesSubmitted: 23, 
      averageScore: 78.5,
      status: 'pending'
    },
    { 
      class: 'Grade 1B', 
      totalStudents: 28, 
      gradesSubmitted: 28, 
      averageScore: 82.1,
      status: 'ready'
    },
    { 
      class: 'Grade 2A', 
      totalStudents: 22, 
      gradesSubmitted: 22, 
      averageScore: 75.8,
      status: 'ready'
    },
    { 
      class: 'Grade 3A', 
      totalStudents: 26, 
      gradesSubmitted: 20, 
      averageScore: 80.3,
      status: 'pending'
    },
  ];

  const handleClassSelection = (classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses([...selectedClasses, classId]);
    } else {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    }
  };

  const handleReleaseResults = () => {
    console.log('Releasing results for:', selectedTerm, selectedClasses, 'to parents:', releaseToParents);
    onClose();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready to Release</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Grades</Badge>;
      case 'released':
        return <Badge className="bg-blue-100 text-blue-800">Released</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Release Results</DialogTitle>
          <DialogDescription>
            Release examination results to parents and generate report cards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Term Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term-1">Term 1 - 2024</SelectItem>
                  <SelectItem value="term-2">Term 2 - 2024</SelectItem>
                  <SelectItem value="term-3">Term 3 - 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Overview */}
          {selectedTerm && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Results Overview - {selectedTerm}</h3>
              <div className="grid gap-4">
                {mockResults.map((result, index) => (
                  <Card key={index} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id={`class-${index}`}
                            checked={selectedClasses.includes(result.class)}
                            onCheckedChange={(checked) => 
                              handleClassSelection(result.class, !!checked)
                            }
                            disabled={result.status === 'pending'}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{result.class}</h4>
                            <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                              <span>Students: {result.totalStudents}</span>
                              <span>•</span>
                              <span>Grades Submitted: {result.gradesSubmitted}/{result.totalStudents}</span>
                              <span>•</span>
                              <span>Average: {result.averageScore}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(result.status)}
                          {result.status === 'pending' && (
                            <p className="text-xs text-red-600">
                              {result.totalStudents - result.gradesSubmitted} grades missing
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Release Options */}
          {selectedClasses.length > 0 && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Release Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="release-to-parents"
                    checked={releaseToParents}
                    onCheckedChange={(checked) => setReleaseToParents(!!checked)}
                  />
                  <label 
                    htmlFor="release-to-parents" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Release results to parents via mobile app
                  </label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Selected Classes: {selectedClasses.join(', ')}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleReleaseResults}
              disabled={selectedClasses.length === 0 || !selectedTerm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Release Results ({selectedClasses.length} classes)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
