
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PrincipalModalsProps {
  activeModal: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PrincipalModals: React.FC<PrincipalModalsProps> = ({ activeModal, onClose, onSuccess }) => {
  const { toast } = useToast();

  const handleSubmit = (type: string) => {
    toast({
      title: `${type} Successful`,
      description: `${type} has been processed successfully.`,
    });
    onSuccess();
    onClose();
  };

  return (
    <>
      {/* Student Admission Modal */}
      <Dialog open={activeModal === 'student-admission'} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student Admission</DialogTitle>
            <DialogDescription>
              Add a new student to the school
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentName">Student Name</Label>
              <Input id="studentName" placeholder="Enter student name" />
            </div>
            <div>
              <Label htmlFor="studentClass">Class</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
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
              <Label htmlFor="parentContact">Parent Contact</Label>
              <Input id="parentContact" placeholder="Enter parent phone number" />
            </div>
            <Button onClick={() => handleSubmit('Student Admission')} className="w-full">
              Admit Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Teacher Registration Modal */}
      <Dialog open={activeModal === 'teacher-admission'} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Teacher Registration</DialogTitle>
            <DialogDescription>
              Register a new teacher
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teacherName">Teacher Name</Label>
              <Input id="teacherName" placeholder="Enter teacher name" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="social">Social Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teacherEmail">Email</Label>
              <Input id="teacherEmail" type="email" placeholder="Enter teacher email" />
            </div>
            <Button onClick={() => handleSubmit('Teacher Registration')} className="w-full">
              Register Teacher
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Parent Registration Modal */}
      <Dialog open={activeModal === 'parent-admission'} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Parent Registration</DialogTitle>
            <DialogDescription>
              Register a new parent account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="parentName">Parent Name</Label>
              <Input id="parentName" placeholder="Enter parent name" />
            </div>
            <div>
              <Label htmlFor="parentEmail">Email</Label>
              <Input id="parentEmail" type="email" placeholder="Enter parent email" />
            </div>
            <div>
              <Label htmlFor="childName">Child Name</Label>
              <Input id="childName" placeholder="Enter child name" />
            </div>
            <Button onClick={() => handleSubmit('Parent Registration')} className="w-full">
              Register Parent
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Principal Reports Modal */}
      <Dialog open={activeModal === 'principal-reports'} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Reports</DialogTitle>
            <DialogDescription>
              Create comprehensive school reports
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic Performance</SelectItem>
                  <SelectItem value="attendance">Attendance Summary</SelectItem>
                  <SelectItem value="teacher">Teacher Performance</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="term">This Term</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleSubmit('Report Generation')} className="w-full">
              Generate Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrincipalModals;
