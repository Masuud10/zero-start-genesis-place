
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';

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

interface FeeStructureCardProps {
  structure: FeeStructure;
  onEdit: (structure: FeeStructure) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

const FeeStructureCard: React.FC<FeeStructureCardProps> = ({
  structure,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const totalAmount = structure.fee_structure_items?.reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <Card className={`${structure.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{structure.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={structure.is_active ? 'default' : 'secondary'}>
              {structure.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(structure.id, structure.is_active)}
            >
              {structure.is_active ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Academic Year: {structure.academic_year}</span>
          <span>Term: {structure.term}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="text-lg font-bold text-green-600">
              KES {totalAmount.toLocaleString()}
            </span>
          </div>

          {structure.fee_structure_items && structure.fee_structure_items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Fee Items:</h4>
              <div className="space-y-1">
                {structure.fee_structure_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} ({item.category})</span>
                    <span className="font-medium">KES {item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created: {format(new Date(structure.created_at), 'MMM dd, yyyy')}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(structure)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(structure.id)}
              className="flex-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeStructureCard;
