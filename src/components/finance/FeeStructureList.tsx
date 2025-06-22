
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FeeStructureCard from './FeeStructureCard';

interface FeeStructure {
  id: string;
  name: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  created_at: string;
  fee_structure_items?: {
    id: string;
    name: string;
    amount: number;
    category: string;
  }[];
}

interface FeeStructureListProps {
  refreshTrigger: number;
  onEdit: (feeStructure: FeeStructure) => void;
}

const FeeStructureList: React.FC<FeeStructureListProps> = ({ refreshTrigger, onEdit }) => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.school_id) {
      fetchFeeStructures();
    }
  }, [user?.school_id, refreshTrigger]);

  const fetchFeeStructures = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .select(`
          *,
          fee_structure_items(*)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeeStructures(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch fee structures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFeeStructure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee structure deleted successfully",
      });

      fetchFeeStructures();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleFeeStructureStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('fee_structures')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Fee structure ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchFeeStructures();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading fee structures...</div>;
  }

  if (feeStructures.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No fee structures found. Create your first fee structure to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feeStructures.map((structure) => (
        <FeeStructureCard
          key={structure.id}
          structure={structure}
          onEdit={onEdit}
          onDelete={deleteFeeStructure}
          onToggleStatus={toggleFeeStructureStatus}
        />
      ))}
    </div>
  );
};

export default FeeStructureList;
