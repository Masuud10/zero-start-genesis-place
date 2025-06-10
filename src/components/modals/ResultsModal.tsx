
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Eye, Send, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultsModalProps {
  onClose: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ onClose }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [examType, setExamType] = useState('');
  const [results, setResults] = useState([
    { 
      id: 1, 
      class: 'Grade 8A', 
      subject: 'Mathematics', 
      examType: 'End Term', 
      status: 'approved', 
      studentsCount: 32,
      avgScore: 78.5,
      isReleased: false
    },
    { 
      id: 2, 
      class: 'Grade 8A', 
      subject: 'English', 
      examType: 'End Term', 
      status: 'approved', 
      studentsCount: 32,
      avgScore: 82.3,
      isReleased: false
    },
    { 
      id: 3, 
      class: 'Grade 8B', 
      subject: 'Mathematics', 
      examType: 'End Term', 
      status: 'pending', 
      studentsCount: 30,
      avgScore: 75.2,
      isReleased: false
    },
  ]);
  const { toast } = useToast();

  const handleReleaseResult = (id: number, release: boolean) => {
    setResults(prev => prev.map(result => 
      result.id === id ? { ...result, isReleased: release } : result
    ));
    
    toast({
      title: release ? "Results Released" : "Results Withdrawn",
      description: release 
        ? "Results have been released to parents and students."
        : "Results have been withdrawn from public view.",
    });
  };

  const handleReleaseAll = () => {
    const approvedResults = results.filter(r => r.status === 'approved');
    setResults(prev => prev.map(result => 
      result.status === 'approved' ? { ...result, isReleased: true } : result
    ));
    
    toast({
      title: "All Results Released",
      description: `${approvedResults.length} approved results have been released to parents.`,
    });
  };

  const handlePreviewResult = (result: any) => {
    toast({
      title: "Preview Generated",
      description: `Generating preview for ${result.class} ${result.subject} results.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const approvedResults = results.filter(r => r.status === 'approved');
  const releasedResults = results.filter(r => r.isReleased);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Release Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Results Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="grade8a">Grade 8A</SelectItem>
                      <SelectItem value="grade8b">Grade 8B</SelectItem>
                      <SelectItem value="grade7a">Grade 7A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="term">Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term1">Term 1</SelectItem>
                      <SelectItem value="term2">Term 2</SelectItem>
                      <SelectItem value="term3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All exams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
                      <SelectItem value="cat1">CAT 1</SelectItem>
                      <SelectItem value="cat2">CAT 2</SelectItem>
                      <SelectItem value="midterm">Mid-term</SelectItem>
                      <SelectItem value="endterm">End-term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Results Summary</span>
                <div className="flex gap-4 text-sm">
                  <span>Approved: {approvedResults.length}</span>
                  <span>Released: {releasedResults.length}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{result.class} - {result.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.examType} • {result.studentsCount} students • Avg: {result.avgScore}%
                        </p>
                      </div>
                      <Badge variant={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewResult(result)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      {result.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Release:</Label>
                          <Switch
                            checked={result.isReleased}
                            onCheckedChange={(checked) => handleReleaseResult(result.id, checked)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button onClick={handleReleaseAll} disabled={approvedResults.length === 0}>
              <Send className="w-4 h-4 mr-2" />
              Release All Approved Results
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
