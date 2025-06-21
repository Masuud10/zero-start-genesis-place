
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeeStructure {
  id: string;
  name: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  created_at: string;
  items?: FeeStructureItem[];
}

interface FeeStructureItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  description?: string;
}

interface ClassFeeSummary {
  class_id: string;
  class_name: string;
  total_fees: number;
  collected: number;
  outstanding: number;
  student_count: number;
}

export const useFeeManagement = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [classFeesSummary, setClassFeesSummary] = useState<ClassFeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFeeStructures = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch fee structures
      const { data: structures, error: structuresError } = await supabase
        .from('fee_structures')
        .select(`
          id,
          name,
          academic_year,
          term,
          is_active,
          created_at,
          fee_structure_items (
            id,
            name,
            category,
            amount,
            description
          )
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (structuresError) throw structuresError;

      setFeeStructures(structures?.map(structure => ({
        ...structure,
        items: structure.fee_structure_items || []
      })) || []);

      // Fetch class fees summary by calculating from fees and classes tables
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', user.school_id);

      if (classesError) throw classesError;

      // For each class, calculate fee summary
      const classSummaries: ClassFeeSummary[] = [];
      
      for (const classItem of classesData || []) {
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select('amount, paid_amount, student_id')
          .eq('class_id', classItem.id)
          .eq('school_id', user.school_id);

        if (feesError) {
          console.error('Error fetching fees for class:', classItem.id, feesError);
          continue;
        }

        const totalFees = feesData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const collected = feesData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const outstanding = totalFees - collected;
        const studentCount = new Set(feesData?.map(fee => fee.student_id)).size;

        classSummaries.push({
          class_id: classItem.id,
          class_name: classItem.name,
          total_fees: totalFees,
          collected: collected,
          outstanding: outstanding,
          student_count: studentCount
        });
      }

      setClassFeesSummary(classSummaries);

    } catch (err: any) {
      console.error('Error fetching fee management data:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch fee management data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFeeStructure = async (structureData: {
    name: string;
    academic_year: string;
    term: string;
    items: Omit<FeeStructureItem, 'id'>[];
  }) => {
    if (!user?.school_id) return { error: 'No school associated with user' };

    try {
      // Create fee structure
      const { data: structure, error: structureError } = await supabase
        .from('fee_structures')
        .insert({
          name: structureData.name,
          academic_year: structureData.academic_year,
          term: structureData.term,
          school_id: user.school_id,
          is_active: true
        })
        .select()
        .single();

      if (structureError) throw structureError;

      // Create fee structure items
      if (structureData.items.length > 0) {
        const items = structureData.items.map(item => ({
          ...item,
          fee_structure_id: structure.id
        }));

        const { error: itemsError } = await supabase
          .from('fee_structure_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Fee structure created successfully",
      });

      fetchFeeStructures(); // Refresh data
      return { data: structure, error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to create fee structure: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const assignFeesToClass = async (classId: string, feeStructureId: string) => {
    if (!user?.school_id) return { error: 'No school associated with user' };

    try {
      // Get students in the class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      if (!students?.length) {
        throw new Error('No active students found in this class');
      }

      // Get fee structure items
      const { data: feeItems, error: feeItemsError } = await supabase
        .from('fee_structure_items')
        .select('*')
        .eq('fee_structure_id', feeStructureId);

      if (feeItemsError) throw feeItemsError;

      // Get fee structure details
      const { data: feeStructure, error: feeStructureError } = await supabase
        .from('fee_structures')
        .select('academic_year, term')
        .eq('id', feeStructureId)
        .single();

      if (feeStructureError) throw feeStructureError;

      // Create fee records for all students
      const feeRecords = students.flatMap(student =>
        feeItems?.map(item => ({
          student_id: student.id,
          class_id: classId,
          school_id: user.school_id,
          amount: item.amount,
          paid_amount: 0,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          academic_year: feeStructure.academic_year,
          term: feeStructure.term,
          category: item.category,
        })) || []
      );

      const { error: insertError } = await supabase
        .from('fees')
        .insert(feeRecords);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `Fees assigned to ${students.length} students in the class`,
      });

      fetchFeeStructures(); // Refresh data
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to assign fees to class: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  useEffect(() => {
    if (user?.school_id) {
      fetchFeeStructures();
    }
  }, [user?.school_id]);

  return {
    feeStructures,
    classFeesSummary,
    loading,
    error,
    refetch: fetchFeeStructures,
    createFeeStructure,
    assignFeesToClass,
  };
};
