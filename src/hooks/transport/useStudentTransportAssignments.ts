import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StudentTransportAssignment {
  id: number;
  student_id: string;
  route_id: number;
  is_active: boolean;
  assignment_date: string;
  created_at: string;
  updated_at: string;
  // Joined data
  student_name?: string;
  student_admission_number?: string;
  route_name?: string;
  monthly_fee?: number;
}

export interface CreateAssignmentData {
  student_id: string;
  route_id: number;
}

export const useStudentTransportAssignments = () => {
  const [assignments, setAssignments] = useState<StudentTransportAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch assignments for a specific route
  const fetchAssignmentsByRoute = async (routeId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_transport_assignments')
        .select(`
          *,
          students!student_id (
            name,
            admission_number
          ),
          transport_routes!route_id (
            route_name,
            monthly_fee
          )
        `)
        .eq('route_id', routeId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData = data?.map((assignment: any) => ({
        ...assignment,
        student_name: assignment.students?.name || 'Unknown Student',
        student_admission_number: assignment.students?.admission_number,
        route_name: assignment.transport_routes?.route_name,
        monthly_fee: assignment.transport_routes?.monthly_fee
      })) || [];
      
      setAssignments(mappedData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all assignments for the current school
  const fetchAllAssignments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_transport_assignments')
        .select(`
          *,
          students!student_id (
            name,
            admission_number
          ),
          transport_routes!route_id (
            route_name,
            monthly_fee
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData = data?.map((assignment: any) => ({
        ...assignment,
        student_name: assignment.students?.name || 'Unknown Student',
        student_admission_number: assignment.students?.admission_number,
        route_name: assignment.transport_routes?.route_name,
        monthly_fee: assignment.transport_routes?.monthly_fee
      })) || [];
      
      setAssignments(mappedData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new assignment
  const createAssignment = async (assignmentData: CreateAssignmentData): Promise<boolean> => {
    try {
      // First check if student is already assigned to any active route
      const { data: existingAssignment, error: checkError } = await supabase
        .from('student_transport_assignments')
        .select('id, route_id')
        .eq('student_id', assignmentData.student_id)
        .eq('is_active', true)
        .limit(1);

      if (checkError) throw checkError;

      if (existingAssignment && existingAssignment.length > 0) {
        toast({
          title: "Error",
          description: "Student is already assigned to a transport route",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('student_transport_assignments')
        .insert([assignmentData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student assigned to transport route successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign student to transport route",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove/deactivate an assignment
  const removeAssignment = async (assignmentId: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('student_transport_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student removed from transport route successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove student from transport route",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get unassigned students for assignment
  const fetchUnassignedStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .not('id', 'in', `(
          SELECT student_id 
          FROM student_transport_assignments 
          WHERE is_active = true
        )`)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unassigned students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch unassigned students",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    assignments,
    loading,
    createAssignment,
    removeAssignment,
    fetchAssignmentsByRoute,
    fetchAllAssignments,
    fetchUnassignedStudents,
    refreshAssignments: fetchAllAssignments,
  };
};