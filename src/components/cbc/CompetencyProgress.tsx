
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Target, BookOpen, Award } from 'lucide-react';

interface CompetencyProgressData {
  id: string;
  competency: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  current_level: string;
  progress_percentage: number;
  last_assessed_date: string;
  milestones_achieved: string[];
  recommended_activities: string[];
}

interface CompetencyProgressProps {
  studentId: string;
  editable?: boolean;
}

const performanceLevels = {
  'EMERGING': { color: 'bg-red-100 text-red-800', value: 25 },
  'APPROACHING': { color: 'bg-yellow-100 text-yellow-800', value: 50 },
  'PROFICIENT': { color: 'bg-blue-100 text-blue-800', value: 75 },
  'EXCEEDING': { color: 'bg-green-100 text-green-800', value: 100 }
};

const CompetencyProgress: React.FC<CompetencyProgressProps> = ({ studentId, editable = false }) => {
  const [progressData, setProgressData] = useState<CompetencyProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetencyProgress();
  }, [studentId]);

  const fetchCompetencyProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('competency_progress')
        .select(`
          *,
          competency:competencies(*)
        `)
        .eq('student_id', studentId);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        competency: item.competency,
        current_level: item.current_level,
        progress_percentage: item.progress_percentage,
        last_assessed_date: item.last_assessed_date,
        milestones_achieved: Array.isArray(item.milestones_achieved) 
          ? item.milestones_achieved 
          : typeof item.milestones_achieved === 'string' 
          ? JSON.parse(item.milestones_achieved) 
          : [],
        recommended_activities: item.recommended_activities || []
      }));
      
      setProgressData(transformedData);
    } catch (error) {
      console.error('Error fetching competency progress:', error);
      toast({
        title: "Error",
        description: "Failed to fetch competency progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRecommendedActivity = async (competencyProgressId: string) => {
    if (!newActivity.trim()) return;

    try {
      const currentProgress = progressData.find(p => p.id === competencyProgressId);
      const updatedActivities = [...(currentProgress?.recommended_activities || []), newActivity];

      const { error } = await supabase
        .from('competency_progress')
        .update({ 
          recommended_activities: updatedActivities,
          updated_at: new Date().toISOString()
        })
        .eq('id', competencyProgressId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recommended activity added",
      });

      setNewActivity('');
      setSelectedCompetency(null);
      fetchCompetencyProgress();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to add recommended activity",
        variant: "destructive",
      });
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'EMERGING': return 'bg-red-500';
      case 'APPROACHING': return 'bg-yellow-500';
      case 'PROFICIENT': return 'bg-blue-500';
      case 'EXCEEDING': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading competency progress...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Competency Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressData.map((progress) => (
              <Card key={progress.id} className="border-l-4" style={{ borderLeftColor: getProgressColor(progress.current_level) }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-sm">{progress.competency.name}</h3>
                      <Badge className={performanceLevels[progress.current_level]?.color}>
                        {progress.current_level}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{progress.progress_percentage}%</div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={progress.progress_percentage} 
                    className="mb-3"
                  />
                  
                  <div className="space-y-2">
                    {progress.milestones_achieved.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Award className="w-3 h-3" />
                          Milestones Achieved
                        </div>
                        <div className="text-xs">
                          {progress.milestones_achieved.length} milestone(s) completed
                        </div>
                      </div>
                    )}
                    
                    {progress.recommended_activities.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Target className="w-3 h-3" />
                          Recommended Activities
                        </div>
                        <div className="space-y-1">
                          {progress.recommended_activities.slice(0, 2).map((activity, index) => (
                            <div key={index} className="text-xs bg-muted p-2 rounded">
                              {activity}
                            </div>
                          ))}
                          {progress.recommended_activities.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{progress.recommended_activities.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {editable && (
                      <div className="pt-2">
                        {selectedCompetency === progress.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add recommended learning activity..."
                              value={newActivity}
                              onChange={(e) => setNewActivity(e.target.value)}
                              className="text-xs"
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => addRecommendedActivity(progress.id)}
                                disabled={!newActivity.trim()}
                              >
                                Add
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedCompetency(null);
                                  setNewActivity('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedCompetency(progress.id)}
                            className="w-full text-xs"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            Add Activity
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetencyProgress;
