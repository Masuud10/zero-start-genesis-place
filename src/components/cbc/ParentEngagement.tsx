
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Home, Eye } from 'lucide-react';

interface EngagementRecord {
  id: string;
  engagement_type: string;
  description: string;
  competencies_addressed: string[];
  date_recorded: string;
  parent_id: string;
}

interface ParentEngagementProps {
  studentId: string;
  isParent?: boolean;
}

const engagementTypes = [
  { value: 'home_project', label: 'Home Project', icon: '🏠' },
  { value: 'observation', label: 'Home Observation', icon: '👀' },
  { value: 'feedback', label: 'Progress Feedback', icon: '💬' },
  { value: 'support_activity', label: 'Support Activity', icon: '🤝' }
];

const ParentEngagement: React.FC<ParentEngagementProps> = ({ studentId, isParent = false }) => {
  const [engagements, setEngagements] = useState<EngagementRecord[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [newEngagement, setNewEngagement] = useState({
    engagement_type: '',
    description: '',
    competencies_addressed: [] as string[]
  });

  useEffect(() => {
    fetchEngagements();
    fetchCompetencies();
  }, [studentId]);

  const fetchEngagements = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_engagements')
        .select('*')
        .eq('student_id', studentId)
        .order('date_recorded', { ascending: false });

      if (error) throw error;
      setEngagements(data || []);
    } catch (error) {
      console.error('Error fetching engagements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parent engagements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencies = async () => {
    try {
      const { data, error } = await supabase
        .from('competencies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompetencies(data || []);
    } catch (error) {
      console.error('Error fetching competencies:', error);
    }
  };

  const handleAddEngagement = async () => {
    if (!newEngagement.engagement_type || !newEngagement.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in engagement type and description",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('parent_engagements')
        .insert({
          student_id: studentId,
          parent_id: user.user?.id,
          engagement_type: newEngagement.engagement_type,
          description: newEngagement.description,
          competencies_addressed: newEngagement.competencies_addressed
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Parent engagement recorded successfully",
      });

      setNewEngagement({
        engagement_type: '',
        description: '',
        competencies_addressed: []
      });
      setShowAddDialog(false);
      fetchEngagements();
    } catch (error) {
      console.error('Error adding engagement:', error);
      toast({
        title: "Error",
        description: "Failed to record engagement",
        variant: "destructive",
      });
    }
  };

  const getEngagementTypeInfo = (type: string) => {
    return engagementTypes.find(et => et.value === type);
  };

  const getCompetencyNames = (competencyIds: string[]) => {
    return competencyIds.map(id => {
      const comp = competencies.find(c => c.id === id);
      return comp ? comp.name : '';
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading parent engagements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Parent Engagement
          </CardTitle>
          {isParent && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Engagement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Parent Engagement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Engagement Type</Label>
                    <Select 
                      value={newEngagement.engagement_type} 
                      onValueChange={(value) => setNewEngagement(prev => ({ ...prev, engagement_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select engagement type" />
                      </SelectTrigger>
                      <SelectContent>
                        {engagementTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newEngagement.description}
                      onChange={(e) => setNewEngagement(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the engagement activity and your child's participation..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Competencies Addressed (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
                      {competencies.map((comp) => (
                        <label key={comp.id} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newEngagement.competencies_addressed.includes(comp.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewEngagement(prev => ({
                                  ...prev,
                                  competencies_addressed: [...prev.competencies_addressed, comp.id]
                                }));
                              } else {
                                setNewEngagement(prev => ({
                                  ...prev,
                                  competencies_addressed: prev.competencies_addressed.filter(id => id !== comp.id)
                                }));
                              }
                            }}
                          />
                          <span>{comp.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEngagement}>
                      Record Engagement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {engagements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No parent engagements recorded yet</p>
            {isParent && <p className="text-sm">Record your first engagement activity to get started</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {engagements.map((engagement) => {
              const typeInfo = getEngagementTypeInfo(engagement.engagement_type);
              const competencyNames = getCompetencyNames(engagement.competencies_addressed);
              
              return (
                <Card key={engagement.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeInfo?.icon}</span>
                          <h3 className="font-medium">{typeInfo?.label}</h3>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(engagement.date_recorded).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm">{engagement.description}</p>
                      
                      {competencyNames.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Competencies Addressed:</p>
                          <div className="flex flex-wrap gap-1">
                            {competencyNames.map((name, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParentEngagement;
