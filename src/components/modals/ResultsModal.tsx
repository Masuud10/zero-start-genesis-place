
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Eye, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ResultsModalProps {
  onClose: () => void;
}

interface GradeResult {
  id: string;
  class_name: string;
  subject_name: string;
  exam_type: string;
  term: string;
  status: string;
  students_count: number;
  avg_score: number;
  is_released: boolean;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [examType, setExamType] = useState('');
  const [results, setResults] = useState<GradeResult[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.school_id) return;
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', user.school_id);
      
      if (!error && data) {
        setClasses(data);
      }
    };

    loadClasses();
  }, [user?.school_id]);

  useEffect(() => {
    const loadResults = async () => {
      if (!user?.school_id) return;

      try {
        setLoading(true);

        // Build the query with filters
        let query = supabase
          .from('grades')
          .select(`
            id,
            term,
            exam_type,
            status,
            is_released,
            score,
            max_score,
            student:students(name),
            subject:subjects(name),
            class:classes(name)
          `)
          .eq('status', 'submitted');

        // Apply filters if selected
        if (selectedClass) {
          query = query.eq('class_id', selectedClass);
        }
        if (selectedTerm) {
          query = query.eq('term', selectedTerm);
        }
        if (examType) {
          query = query.eq('exam_type', examType);
        }

        const { data: gradesData, error } = await query;

        if (error) {
          throw error;
        }

        // Group and aggregate the results
        const groupedResults = new Map<string, any>();

        gradesData?.forEach(grade => {
          const key = `${grade.class?.name}-${grade.subject?.name}-${grade.exam_type}-${grade.term}`;
          
          if (!groupedResults.has(key)) {
            groupedResults.set(key, {
              id: key,
              class_name: grade.class?.name || 'Unknown',
              subject_name: grade.subject?.name || 'Unknown',
              exam_type: grade.exam_type,
              term: grade.term,
              status: 'approved', // Assuming submitted grades are approved
              students_count: 0,
              total_score: 0,
              avg_score: 0,
              is_released: grade.is_released
            });
          }

          const result = groupedResults.get(key);
          result.students_count += 1;
          result.total_score += (grade.score / grade.max_score) * 100; // Convert to percentage
        });

        // Calculate averages and convert to array
        const resultsArray: GradeResult[] = Array.from(groupedResults.values()).map(result => ({
          ...result,
          avg_score: result.students_count > 0 ? result.total_score / result.students_count : 0
        }));

        setResults(resultsArray);
      } catch (error) {
        console.error('Error loading results:', error);
        toast({
          title: "Error",
          description: "Failed to load results.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user?.school_id, selectedClass, selectedTerm, examType]);

  const handleReleaseResult = async (resultId: string, release: boolean) => {
    try {
      // Find the result to get details for updating
      const result = results.find(r => r.id === resultId);
      if (!result) return;

      // Update grades based on class, subject, exam type, and term
      const { error } = await supabase
        .from('grades')
        .update({ is_released: release })
        .eq('term', result.term)
        .eq('exam_type', result.exam_type)
        .match({
          'classes.name': result.class_name,
          'subjects.name': result.subject_name
        });

      if (error) {
        throw error;
      }

      setResults(prev => prev.map(result => 
        result.id === resultId ? { ...result, is_released: release } : result
      ));
      
      toast({
        title: release ? "Results Released" : "Results Withdrawn",
        description: release 
          ? "Results have been released to parents and students."
          : "Results have been withdrawn from public view.",
      });
    } catch (error) {
      console.error('Error updating result release status:', error);
      toast({
        title: "Error",
        description: "Failed to update result status.",
        variant: "destructive"
      });
    }
  };

  const handleReleaseAll = async () => {
    try {
      const approvedResults = results.filter(r => r.status === 'approved');
      
      // Update all approved results to released
      for (const result of approvedResults) {
        await handleReleaseResult(result.id, true);
      }
      
      toast({
        title: "All Results Released",
        description: `${approvedResults.length} approved results have been released to parents.`,
      });
    } catch (error) {
      console.error('Error releasing all results:', error);
      toast({
        title: "Error",
        description: "Failed to release all results.",
        variant: "destructive"
      });
    }
  };

  const handlePreviewResult = (result: GradeResult) => {
    toast({
      title: "Preview Generated",
      description: `Generating preview for ${result.class_name} ${result.subject_name} results.`,
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
  const releasedResults = results.filter(r => r.is_released);

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
                      <SelectItem value="">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="term">Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="All terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Terms</SelectItem>
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
                      <SelectItem value="">All Exams</SelectItem>
                      <SelectItem value="opener">Opener</SelectItem>
                      <SelectItem value="mid_term">Mid Term</SelectItem>
                      <SelectItem value="end_term">End Term</SelectItem>
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading results...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No results found for the selected criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{result.class_name} - {result.subject_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.exam_type} • {result.students_count} students • Avg: {result.avg_score.toFixed(1)}%
                          </p>
                        </div>
                        <Badge variant={getStatusColor(result.status) as any}>
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
                              checked={result.is_released}
                              onCheckedChange={(checked) => handleReleaseResult(result.id, checked)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
