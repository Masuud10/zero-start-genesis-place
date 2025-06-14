import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { DataService } from '@/services/dataService';
import { StudentData } from '@/services/dataService';
import { GradeData } from '@/services/dataService';
import { BulkGradeSubmission } from '@/types/grading';

interface GradesModalProps {
  onClose: () => void;
  userRole: string;
}

const GradesModal = ({ onClose, userRole }: GradesModalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [mockStudents, setMockStudents] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Mock students data for the selected class
    const mockStudentsData = [
      { id: '1', name: 'John Doe', admissionNumber: 'ADM001', rollNumber: 'R001', grades: [] },
      { id: '2', name: 'Jane Smith', admissionNumber: 'ADM002', rollNumber: 'R002', grades: [] },
      { id: '3', name: 'Mike Johnson', admissionNumber: 'ADM003', rollNumber: 'R003', grades: [] },
    ];
    setMockStudents(mockStudentsData);
  }, []);

  const mockClasses = [
    { id: '8a', name: 'Grade 8A' },
    { id: '8b', name: 'Grade 8B' },
    { id: '7a', name: 'Grade 7A' },
    { id: '7b', name: 'Grade 7B' },
  ];

  const mockSubjects = [
    { id: 'math', name: 'Mathematics' },
    { id: 'eng', name: 'English' },
    { id: 'sci', name: 'Science' },
  ];

  const mockTerms = [
    { id: 'term1', name: 'Term 1' },
    { id: 'term2', name: 'Term 2' },
    { id: 'term3', name: 'Term 3' },
  ];

  const mockExamTypes = [
    { id: 'opener', name: 'Opener' },
    { id: 'mid_term', name: 'Mid Term' },
    { id: 'end_term', name: 'End Term' },
  ];

  const mockBulkSubmission: BulkGradeSubmission = {
    id: 'bulk-001',
    classId: selectedClass,
    subjectId: selectedSubject,
    term: selectedTerm,
    examType: selectedExamType,
    totalStudents: mockStudents.length,
    gradesEntered: mockStudents.filter(s => s.grades.length > 0).length,
    submittedBy: 'teacher-001',
    submittedAt: new Date().toISOString(),
    status: 'draft',
    principalNotes: '',
    releasedAt: undefined
  };

  const handleSubmit = async () => {
    try {
      // Validate form inputs
      if (!selectedClass || !selectedSubject || !selectedTerm || !selectedExamType) {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
        return;
      }

      // Prepare grade data for submission
      const gradeData: GradeData = {
        student_id: 'student-001',
        subject_id: selectedSubject,
        class_id: selectedClass,
        score: 85,
        max_score: 100,
        percentage: 85,
        term: selectedTerm,
        exam_type: selectedExamType,
        submitted_by: 'teacher-001',
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        is_released: false,
        is_immutable: false
      };

      // Call DataService to create the grade
      const { data, error } = await DataService.createGrade(gradeData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit grade.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Grade submitted successfully.",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error submitting grade:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Modal open={true} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <Label>Enter Grades</Label>
        </ModalHeader>
        <ModalBody>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="class" className="text-right">
                Class
              </Label>
              <Select onValueChange={setSelectedClass}>
                <SelectTrigger id="class" className="col-span-3">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {mockClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Select onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject" className="col-span-3">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {mockSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">
                Term
              </Label>
              <Select onValueChange={setSelectedTerm}>
                <SelectTrigger id="term" className="col-span-3">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  {mockTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="examType" className="text-right">
                Exam Type
              </Label>
              <Select onValueChange={setSelectedExamType}>
                <SelectTrigger id="examType" className="col-span-3">
                  <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  {mockExamTypes.map((examType) => (
                    <SelectItem key={examType.id} value={examType.id}>
                      {examType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right">
                Score
              </Label>
              <Input type="number" id="score" className="col-span-3" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GradesModal;
