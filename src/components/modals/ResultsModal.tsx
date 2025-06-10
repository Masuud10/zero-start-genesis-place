
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface ResultsModalProps {
  onClose: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ onClose }) => {
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const mockTerms = ['Term 1 2024', 'Term 2 2024', 'Term 3 2024'];
  const mockClasses = ['Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B'];
  const mockResults = [
    { student: 'John Doe', average: 85, position: 3, status: 'Released' },
    { student: 'Jane Smith', average: 92, position: 1, status: 'Released' },
    { student: 'Mike Johnson', average: 78, position: 8, status: 'Pending' },
  ];

  const handleReleaseResults = () => {
    if (!selectedTerm || !selectedClass) {
      toast({
        title: "Error",
        description: "Please select term and class",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Results released successfully to parents",
    });
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Release Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Term and Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="term">Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTerms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClasses.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedTerm && selectedClass && (
            <Card>
              <CardHeader>
                <CardTitle>Results Preview - {selectedClass} ({selectedTerm})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockResults.map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{result.student}</p>
                        <p className="text-sm text-muted-foreground">Position: {result.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{result.average}%</p>
                        <p className={`text-sm ${result.status === 'Released' ? 'text-green-600' : 'text-orange-600'}`}>
                          {result.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleReleaseResults} className="w-full mt-4">
                  Release Results to Parents
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
