
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Clock, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

const ProjectsAnalytics: React.FC = () => {
  const { data: projects = [], isLoading } = useProjects();

  // Calculate analytics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
  const overdueProjects = projects.filter(p => {
    const today = new Date();
    const endDate = new Date(p.end_date);
    return endDate < today && p.status !== 'completed' && p.status !== 'cancelled';
  }).length;

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.actual_cost, 0);
  const averageProgress = totalProjects > 0 
    ? projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects 
    : 0;

  // Project status distribution
  const statusDistribution = {
    planning: projects.filter(p => p.status === 'planning').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    on_hold: projects.filter(p => p.status === 'on_hold').length,
    completed: projects.filter(p => p.status === 'completed').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
  };

  // Priority distribution
  const priorityDistribution = {
    low: projects.filter(p => p.priority === 'low').length,
    medium: projects.filter(p => p.priority === 'medium').length,
    high: projects.filter(p => p.priority === 'high').length,
    critical: projects.filter(p => p.priority === 'critical').length,
  };

  // Project type distribution
  const typeDistribution = projects.reduce((acc, project) => {
    acc[project.project_type] = (acc[project.project_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Analytics</h3>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <p className="text-sm text-muted-foreground">
          Comprehensive insights into project performance and metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{totalProjects}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
                <p className="text-xs text-muted-foreground">
                  {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% completion rate
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressProjects}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueProjects}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget and Progress */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="font-bold">${totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="font-bold text-red-600">${totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className={`font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalBudget - totalSpent).toLocaleString()}
              </span>
            </div>
            {totalBudget > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Utilization</span>
                  <span>{Math.round((totalSpent / totalBudget) * 100)}%</span>
                </div>
                <Progress value={(totalSpent / totalBudget) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{Math.round(averageProgress)}%</div>
              <p className="text-sm text-muted-foreground">Average completion</p>
            </div>
            <Progress value={averageProgress} className="h-3" />
            <div className="text-sm text-muted-foreground text-center">
              Across all {totalProjects} projects
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status and Priority Distribution */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'completed' ? 'bg-green-500' :
                        status === 'in_progress' ? 'bg-blue-500' :
                        status === 'planning' ? 'bg-yellow-500' :
                        status === 'on_hold' ? 'bg-gray-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${totalProjects > 0 ? (count / totalProjects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(priorityDistribution).map(([priority, count]) => (
              <div key={priority} className="flex justify-between items-center">
                <span className="text-sm capitalize">{priority}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        priority === 'critical' ? 'bg-red-500' :
                        priority === 'high' ? 'bg-orange-500' :
                        priority === 'medium' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${totalProjects > 0 ? (count / totalProjects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(typeDistribution).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${totalProjects > 0 ? (count / totalProjects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {totalProjects === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No analytics available</h3>
          <p className="text-muted-foreground">
            Create some projects to see analytics and insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsAnalytics;
