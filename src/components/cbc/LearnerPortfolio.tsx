
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
import { FileText, Plus, Eye, MessageSquare } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  competency: {
    name: string;
    category: string;
  } | null;
  subject: {
    name: string;
  } | null;
  file_urls: string[];
  reflection_notes: string;
  teacher_feedback: string;
  created_at: string;
  created_by: string;
}

interface LearnerPortfolioProps {
  studentId: string;
  canEdit?: boolean;
  canAddFeedback?: boolean;
}

const LearnerPortfolio: React.FC<LearnerPortfolioProps> = ({ 
  studentId, 
  canEdit = false, 
  canAddFeedback = false 
}) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    competency_id: '',
    subject_id: '',
    reflection_notes: ''
  });

  useEffect(() => {
    fetchPortfolioItems();
    fetchCompetencies();
    fetchSubjects();
  }, [studentId]);

  const fetchPortfolioItems = async () => {
    try {
      const { data, error } = await supabase
        .from('learner_portfolios')
        .select(`
          *,
          competency:competencies(name, category),
          subject:subjects(name)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolio items",
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

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleAddPortfolioItem = async () => {
    if (!newItem.title.trim() || !newItem.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and description",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('learner_portfolios')
        .insert({
          student_id: studentId,
          title: newItem.title,
          description: newItem.description,
          competency_id: newItem.competency_id || null,
          subject_id: newItem.subject_id || null,
          reflection_notes: newItem.reflection_notes,
          created_by: user.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Portfolio item added successfully",
      });

      setNewItem({
        title: '',
        description: '',
        competency_id: '',
        subject_id: '',
        reflection_notes: ''
      });
      setShowAddDialog(false);
      fetchPortfolioItems();
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to add portfolio item",
        variant: "destructive",
      });
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedItem || !feedbackText.trim()) return;

    try {
      const { error } = await supabase
        .from('learner_portfolios')
        .update({ teacher_feedback: feedbackText })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback added successfully",
      });

      setFeedbackText('');
      setSelectedItem(null);
      fetchPortfolioItems();
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast({
        title: "Error",
        description: "Failed to add feedback",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading portfolio...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Learner Portfolio
            </CardTitle>
            {canEdit && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Portfolio Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newItem.title}
                        onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Portfolio item title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the work or achievement"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Related Competency (Optional)</Label>
                        <Select 
                          value={newItem.competency_id} 
                          onValueChange={(value) => setNewItem(prev => ({ ...prev, competency_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select competency" />
                          </SelectTrigger>
                          <SelectContent>
                            {competencies.map((comp) => (
                              <SelectItem key={comp.id} value={comp.id}>
                                {comp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Related Subject (Optional)</Label>
                        <Select 
                          value={newItem.subject_id} 
                          onValueChange={(value) => setNewItem(prev => ({ ...prev, subject_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Reflection Notes</Label>
                      <Textarea
                        value={newItem.reflection_notes}
                        onChange={(e) => setNewItem(prev => ({ ...prev, reflection_notes: e.target.value }))}
                        placeholder="What did you learn? How did you grow?"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPortfolioItem}>
                        Add Item
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {portfolioItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No portfolio items yet</p>
              {canEdit && <p className="text-sm">Add your first portfolio item to get started</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioItems.map((item) => (
                <Card key={item.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.competency && (
                          <Badge variant="outline" className="text-xs">
                            {item.competency.name}
                          </Badge>
                        )}
                        {item.subject && (
                          <Badge variant="secondary" className="text-xs">
                            {item.subject.name}
                          </Badge>
                        )}
                      </div>
                      
                      {item.reflection_notes && (
                        <div className="bg-muted p-3 rounded text-sm">
                          <p className="font-medium text-xs mb-1">Student Reflection:</p>
                          <p>{item.reflection_notes}</p>
                        </div>
                      )}
                      
                      {item.teacher_feedback && (
                        <div className="bg-blue-50 p-3 rounded text-sm">
                          <p className="font-medium text-xs mb-1">Teacher Feedback:</p>
                          <p>{item.teacher_feedback}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                        {canAddFeedback && !item.teacher_feedback && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedItem(item)}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Add Feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Teacher Feedback</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Feedback for: {item.title}</Label>
                                  <Textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Provide constructive feedback on this portfolio item..."
                                    className="min-h-[100px]"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleAddFeedback}>
                                    Add Feedback
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnerPortfolio;
