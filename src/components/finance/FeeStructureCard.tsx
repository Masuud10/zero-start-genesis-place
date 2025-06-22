
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  return (
    <Card>
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
            onClick={() => onDelete(structure.id)}
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
            onClick={() => onToggleStatus(structure.id, structure.is_active)}
          >
            {structure.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeStructureCard;
