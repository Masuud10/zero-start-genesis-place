
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { CheckCircle, XCircle, Send, Edit, Download, Filter, Eye, Users, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface GradeRecord {
  id: string;
  student_name: string;
  subject_name: string;
  class_name: string;
  teacher_name: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  status: string;
  approved_by_principal: boolean;
  released_to_parents: boolean;
  principal_notes: string;
  overridden_grade: number | null;
  submitted_at: string;
  term: string;
  exam_type: string;
}

const PrincipalGradingModule = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { classList, subjectList, teacherList } = usePrincipalEntityLists(0);
  
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  
  // Modal states
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeRecord | null>(null);
  const [overrideScore, setOverrideScore] = useState<string>('');
  const [principalNotes, setPrincipalNotes] = useState<string>('');

  useEffect(() => {
    if (schoolId) {
      fetchGrades();
    }
  }, [schoolId, selectedClass, selectedSubject, selectedStatus, selectedTerm]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('grades')
        .select(`
          id,
          score,
          max_score,
          percentage,
          letter_grade,
          status,
          approved_by_principal,
          released_to_parents,
          principal_notes,
          overridden_grade,
          submitted_at,
          term,
          exam_type,
          students (name),
          subjects (name),
          classes (name),
          profiles (name)
        `)
        .eq('school_id', schoolId)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

      if (selectedClass) {
        query = query.eq('class_id', selectedClass);
      }
      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      if (selectedTerm) {
        query = query.eq('term', selectedTerm);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedGrades: GradeRecord[] = data?.map((grade: any) => ({
        id: grade.id,
        student_name: grade.students?.name || 'Unknown Student',
        subject_name: grade.subjects?.name || 'Unknown Subject',
        class_name: grade.classes?.name || 'Unknown Class',
        teacher_name: grade.profiles?.name || 'Unknown Teacher',
        score: grade.score || 0,
        max_score: grade.max_score || 100,
        percentage: grade.percentage || 0,
        letter_grade: grade.letter_grade || '',
        status: grade.status || 'draft',
        approved_by_principal: grade.approved_by_principal || false,
        released_to_parents: grade.released_to_parents || false,
        principal_notes: grade.principal_notes || '',
        overridden_grade: grade.overridden_grade,
        submitted_at: grade.submitted_at,
        term: grade.term,
        exam_type: grade.exam_type
      })) || [];

      setGrades(formattedGrades);
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      toast({
        title: "Error",
        description: "Failed to load grades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gradeIds: string[]) => {
    try {
      const { error } = await supabase
        .from('grades')
        .update({ 
          approved_by_principal: true,
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .in('id', gradeIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${gradeIds.length} grade(s) approved successfully`,
      });

      fetchGrades();
    } catch (error: any) {
      console.error('Error approving grades:', error);
      toast({
        title: "Error",
        description: "Failed to approve grades",
        variant: "destructive"
      });
    }
  };

  const handleRelease = async (gradeIds: string[]) => {
    try {
      const { error } = await supabase
        .from('grades')
        .update({ 
          released_to_parents: true,
          status: 'released',
          released_by: user?.id,
          released_at: new Date().toISOString()
        })
        .in('id', gradeIds)
        .eq('approved_by_principal', true);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${gradeIds.length} result(s) released to parents successfully`,
      });

      fetchGrades();
    } catch (error: any) {
      console.error('Error releasing grades:', error);
      toast({
        title: "Error",
        description: "Failed to release results",
        variant: "destructive"
      });
    }
  };

  const handleOverride = async () => {
    if (!selectedGrade || !overrideScore) return;

    try {
      const overrideValue = parseFloat(overrideScore);
      if (isNaN(overrideValue) || overrideValue < 0 || overrideValue > selectedGrade.max_score) {
        toast({
          title: "Error",
          description: `Override score must be between 0 and ${selectedGrade.max_score}`,
          variant: "destructive"
        });
        return;
      }

      const newPercentage = (overrideValue / selectedGrade.max_score) * 100;
      
      const { error } = await supabase
        .from('grades')
        .update({ 
          overridden_grade: overrideValue,
          principal_notes: principalNotes,
          percentage: newPercentage,
          approved_by_principal: true,
          status: 'approved'
        })
        .eq('id', selectedGrade.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade overridden successfully",
      });

      setOverrideModalOpen(false);
      setSelectedGrade(null);
      setOverrideScore('');
      setPrincipalNotes('');
      fetchGrades();
    } catch (error: any) {
      console.error('Error overriding grade:', error);
      toast({
        title: "Error",
        description: "Failed to override grade",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, approved: boolean, released: boolean) => {
    if (released) {
      return <Badge className="bg-purple-100 text-purple-700">Released</Badge>;
    }
    if (approved) {
      return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
    }
    switch (status) {
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    if (grades.length === 0) {
      toast({
        title: "Error",
        description: "No grades to export",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Student', 'Subject', 'Class', 'Teacher', 'Score', 'Max Score', 'Percentage', 'Grade', 'Status', 'Term', 'Exam Type'],
      ...grades.map(grade => [
        grade.student_name,
        grade.subject_name,
        grade.class_name,
        grade.teacher_name,
        grade.overridden_grade || grade.score,
        grade.max_score,
        grade.percentage,
        grade.letter_grade,
        grade.status,
        grade.term,
        grade.exam_type
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <FileText className="h-7 w-7" />
            Principal Grading Management
          </CardTitle>
          <p className="text-indigo-100">
            Review, approve, override, and release student grades
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classList.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjectList.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="released">Released</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="All Terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Terms</SelectItem>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>

            <Button onClick={fetchGrades} variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Grade Records
            </div>
            <Badge variant="secondary">{grades.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading grades...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.student_name}</TableCell>
                      <TableCell>{grade.subject_name}</TableCell>
                      <TableCell>{grade.class_name}</TableCell>
                      <TableCell>{grade.teacher_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={grade.overridden_grade ? "line-through text-gray-400" : ""}>
                            {grade.score}/{grade.max_score}
                          </span>
                          {grade.overridden_grade && (
                            <span className="text-orange-600 font-medium">
                              {grade.overridden_grade}/{grade.max_score} (Override)
                            </span>
                          )}
                          <span className="text-sm text-gray-500">{grade.percentage.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{grade.letter_grade}</TableCell>
                      <TableCell>{getStatusBadge(grade.status, grade.approved_by_principal, grade.released_to_parents)}</TableCell>
                      <TableCell>{grade.term}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!grade.approved_by_principal && grade.status === 'submitted' && (
                            <Button size="sm" onClick={() => handleApprove([grade.id])} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          {grade.approved_by_principal && !grade.released_to_parents && (
                            <Button size="sm" onClick={() => handleRelease([grade.id])} className="bg-purple-600 hover:bg-purple-700">
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedGrade(grade);
                              setOverrideScore(grade.overridden_grade?.toString() || grade.score.toString());
                              setPrincipalNotes(grade.principal_notes);
                              setOverrideModalOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Override Modal */}
      <Dialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Override Grade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedGrade && (
              <>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>Student:</strong> {selectedGrade.student_name}</p>
                  <p><strong>Subject:</strong> {selectedGrade.subject_name}</p>
                  <p><strong>Current Score:</strong> {selectedGrade.score}/{selectedGrade.max_score}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Override Score</label>
                  <Input
                    type="number"
                    value={overrideScore}
                    onChange={(e) => setOverrideScore(e.target.value)}
                    max={selectedGrade.max_score}
                    min={0}
                    placeholder={`Enter score (0-${selectedGrade.max_score})`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Principal Notes</label>
                  <Textarea
                    value={principalNotes}
                    onChange={(e) => setPrincipalNotes(e.target.value)}
                    placeholder="Add a note explaining the override..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleOverride} className="flex-1">
                    Override Grade
                  </Button>
                  <Button variant="outline" onClick={() => setOverrideModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrincipalGradingModule;
