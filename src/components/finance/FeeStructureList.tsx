
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Trash2 } from 'lucide-react';

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
        <Card key={structure.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">{structure.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={structure.is_active ? 'default' : 'secondary'}>
                {structure.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(structure)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteFeeStructure(structure.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="font-medium">{structure.academic_year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Term</p>
                <p className="font-medium">{structure.term}</p>
              </div>
            </div>

            {structure.fee_structure_items && structure.fee_structure_items.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fee Items</p>
                <div className="space-y-2">
                  {structure.fee_structure_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <span className="font-medium">KES {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                variant={structure.is_active ? 'outline' : 'default'}
                size="sm"
                onClick={() => toggleFeeStructureStatus(structure.id, structure.is_active)}
              >
                {structure.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeeStructureList;
