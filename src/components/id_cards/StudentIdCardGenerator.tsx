import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Printer, Search, CreditCard } from "lucide-react";
import StudentIdCardTemplate from "./StudentIdCardTemplate";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Student {
  id: string;
  name: string;
  admission_number: string;
  date_of_birth: string;
  class_id: string;
  photo_url?: string | null;
  classes?: {
    name: string;
  };
}

interface School {
  id: string;
  name: string;
  logo_url?: string;
}

const StudentIdCardGenerator: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchoolAndStudents();
  }, []);

  const fetchSchoolAndStudents = async () => {
    try {
      setLoading(true);
      
      // Get current user's school
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to access this feature",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single();

      if (!profile?.school_id) {
        toast({
          title: "Error",
          description: "No school associated with your account",
          variant: "destructive",
        });
        return;
      }

      // Fetch school details
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, logo_url')
        .eq('id', profile.school_id)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      // Fetch students with class names
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          admission_number,
          date_of_birth,
          class_id,
          classes!inner (name)
        `)
        .eq('school_id', profile.school_id)
        .order('name');

      if (studentsError) throw studentsError;
      setStudents((studentsData || []) as unknown as Student[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load students and school data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student || null);
  };

  const generatePDF = async () => {
    if (!idCardRef.current || !selectedStudent) return;

    try {
      setProcessing(true);
      
      // Create canvas from the ID card element
      const canvas = await html2canvas(idCardRef.current, {
        scale: 3, // Higher scale for better quality
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98] // Standard credit card size in mm
      });

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);

      // Save the PDF
      pdf.save(`${selectedStudent.name}_ID_Card.pdf`);

      toast({
        title: "Success",
        description: "ID card has been downloaded as PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = async () => {
    if (!idCardRef.current || !selectedStudent) return;

    try {
      setProcessing(true);
      
      // Create canvas from the ID card element
      const canvas = await html2canvas(idCardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
      });

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      const imgData = canvas.toDataURL('image/png');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Student ID Card - ${selectedStudent.name}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media print {
                body { padding: 0; }
                img { width: 324px; height: 204px; }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Student ID Card" />
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait a moment for the image to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);

      toast({
        title: "Success",
        description: "Print dialog opened",
      });
    } catch (error) {
      console.error('Error printing:', error);
      toast({
        title: "Error",
        description: "Failed to open print dialog",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Student ID Card Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading students...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Student ID Card Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Search Student</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or admission number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="student-select">Select Student</Label>
                <Select onValueChange={handleStudentSelect}>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Choose a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.admission_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ID Card Preview */}
          {selectedStudent && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ID Card Preview</h3>
              
              <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                <div ref={idCardRef}>
                  <StudentIdCardTemplate
                    student={{
                      id: selectedStudent.id,
                      name: selectedStudent.name,
                      admission_number: selectedStudent.admission_number,
                      class_name: selectedStudent.classes?.name || 'N/A',
                      date_of_birth: selectedStudent.date_of_birth,
                      photo_url: selectedStudent.photo_url || undefined,
                    }}
                    school={school || undefined}
                    issueDate={new Date().toISOString()}
                    expiryDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handlePrint}
                  disabled={processing}
                  variant="outline"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Print ID Card'}
                </Button>
                
                <Button
                  onClick={generatePDF}
                  disabled={processing}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Download as PDF'}
                </Button>
              </div>
            </div>
          )}

          {!selectedStudent && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a student to preview their ID card</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentIdCardGenerator;