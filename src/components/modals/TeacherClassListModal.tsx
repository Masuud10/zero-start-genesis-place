import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, AlertCircle, Users, Mail, Phone, User, Eye } from 'lucide-react';

interface TeacherClassListModalProps {
  open: boolean;
  onClose: () => void;
  classId?: string;
  className?: string;
}

const TeacherClassListModal: React.FC<TeacherClassListModalProps> = ({
  open,
  onClose,
  classId,
  className
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const { data: classData, isLoading, error } = useQuery({
    queryKey: ['teacher-class-list', user?.id, schoolId, classId],
    queryFn: async () => {
      if (!user?.id || !schoolId || !classId) return { students: [], totalStudents: 0 };

      // Get students in the class with parent information
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          admission_number,
          roll_number,
          date_of_birth,
          gender,
          is_active,
          created_at
        `)
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .order('name');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      // Get parent information for students
      const studentIds = students?.map(s => s.id) || [];
      let parentsData: any[] = [];
      
      if (studentIds.length > 0) {
        const { data: parents, error: parentsError } = await supabase
          .from('parent_students')
          .select(`
            student_id,
            profiles!parent_students_parent_id_fkey(id, name, email, phone)
          `)
          .in('student_id', studentIds);

        if (!parentsError && parents) {
          parentsData = parents;
        }
      }

      // Combine student and parent data
      const studentsWithParents = students?.map(student => {
        const studentParents = parentsData
          .filter(p => p.student_id === student.id)
          .map(p => p.profiles)
          .filter(Boolean);

        return {
          ...student,
          parents: studentParents
        };
      }) || [];

      return {
        students: studentsWithParents,
        totalStudents: studentsWithParents.length
      };
    },
    enabled: open && !!user?.id && !!schoolId && !!classId,
  });

  const getStudentInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getGenderBadge = (gender: string) => {
    const variant = gender?.toLowerCase() === 'male' ? 'default' : 
                   gender?.toLowerCase() === 'female' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{gender || 'N/A'}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'destructive'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {className} - Student List
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading student list...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load student list</p>
            </div>
          </div>
        )}

        {!isLoading && !error && classData && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium text-green-900">{classData.totalStudents}</span>
                  <span className="text-green-700 ml-1">Total Students</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-green-900">
                    {classData.students.filter(s => s.is_active).length}
                  </span>
                  <span className="text-green-700 ml-1">Active</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-green-900">
                    {classData.students.filter(s => s.gender?.toLowerCase() === 'male').length}
                  </span>
                  <span className="text-green-700 ml-1">Male</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-green-900">
                    {classData.students.filter(s => s.gender?.toLowerCase() === 'female').length}
                  </span>
                  <span className="text-green-700 ml-1">Female</span>
                </div>
              </div>
            </div>

            {classData.students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No students in this class</p>
                <p className="text-sm mt-1">Students will appear here once they are enrolled in this class.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-48">Student</TableHead>
                      <TableHead className="w-32">Admission No.</TableHead>
                      <TableHead className="w-24">Gender</TableHead>
                      <TableHead className="w-32">Date of Birth</TableHead>
                      <TableHead className="w-48">Contact</TableHead>
                      <TableHead className="w-48">Parent(s)</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classData.students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="text-gray-500 text-sm">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getStudentInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              {student.roll_number && (
                                <div className="text-xs text-gray-500">Roll: {student.roll_number}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.admission_number}
                        </TableCell>
                        <TableCell>
                          {getGenderBadge(student.gender)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {student.date_of_birth ? formatDate(student.date_of_birth) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="h-3 w-3" />
                              <span>Contact via parent</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.parents && student.parents.length > 0 ? (
                              student.parents.map((parent: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1 text-xs">
                                  <User className="h-3 w-3 text-gray-500" />
                                  <span className="truncate">{parent.name}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">No parent info</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(student.is_active)}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeacherClassListModal;