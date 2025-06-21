
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users, DollarSign, Calendar } from 'lucide-react';
import { useFeeStructures } from '@/hooks/useFeeStructures';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeeStructureForm {
  name: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  items: FeeItem[];
}

interface FeeItem {
  name: string;
  description: string;
  amount: number;
  category: string;
}

const FeeStructureManager: React.FC = () => {
  const { user } = useAuth();
  const { data: feeStructures, refetch } = useFeeStructures();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingStructure, setEditingStructure] = useState<any>(null);
  const [formData, setFormData] = useState<FeeStructureForm>({
    name: '',
    academic_year: new Date().getFullYear().toString(),
    term: 'Term 1',
    is_active: false,
    items: []
  });

  const feeCategories = [
    'tuition',
    'transport',
    'meals',
    'activities',
    'uniform',
    'books',
    'examination',
    'development',
    'other'
  ];

  const handleCreateFeeStructure = async () => {
    if (!user?.school_id) return;

    try {
      // Create fee structure
      const { data: structure, error: structureError } = await supabase
        .from('fee_structures')
        .insert({
          school_id: user.school_id,
          name: formData.name,
          academic_year: formData.academic_year,
          term: formData.term,
          is_active: formData.is_active
        })
        .select()
        .single();

      if (structureError) throw structureError;

      // Create fee structure items
      if (formData.items.length > 0) {
        const items = formData.items.map(item => ({
          fee_structure_id: structure.id,
          name: item.name,
          description: item.description,
          amount: item.amount,
          category: item.category
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

      setIsCreating(false);
      setFormData({
        name: '',
        academic_year: new Date().getFullYear().toString(),
        term: 'Term 1',
        is_active: false,
        items: []
      });
      refetch();

    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create fee structure: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const addFeeItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', amount: 0, category: 'tuition' }]
    }));
  };

  const removeFeeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateFeeItem = (index: number, field: keyof FeeItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Fee Structure Management
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Fee Structure</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Structure Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Standard Fee Structure"
                    />
                  </div>
                  <div>
                    <Label htmlFor="academic_year">Academic Year</Label>
                    <Input
                      id="academic_year"
                      value={formData.academic_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="term">Term</Label>
                    <Select value={formData.term} onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">Term 1</SelectItem>
                        <SelectItem value="Term 2">Term 2</SelectItem>
                        <SelectItem value="Term 3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_active" 
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Set as Active Structure</Label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Fee Items</h3>
                    <Button type="button" variant="outline" onClick={addFeeItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Fee Item #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <Label>Fee Name</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => updateFeeItem(index, 'name', e.target.value)}
                              placeholder="e.g., Tuition Fee"
                            />
                          </div>
                          <div>
                            <Label>Amount (KES)</Label>
                            <Input
                              type="number"
                              value={item.amount}
                              onChange={(e) => updateFeeItem(index, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Select 
                              value={item.category} 
                              onValueChange={(value) => updateFeeItem(index, 'category', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {feeCategories.map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateFeeItem(index, 'description', e.target.value)}
                              placeholder="Optional description"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFeeStructure}>
                    Create Fee Structure
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feeStructures && feeStructures.length > 0 ? (
            feeStructures.map((structure) => (
              <div key={structure.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{structure.name}</h3>
                    {structure.is_active && (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {structure.academic_year} - {structure.term}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Applied to classes
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No fee structures created yet</p>
              <p className="text-sm">Create your first fee structure to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeStructureManager;
