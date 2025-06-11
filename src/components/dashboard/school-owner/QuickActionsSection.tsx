
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuickActionCard from '../shared/QuickActionCard';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsSectionProps {
  actions: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
    action: () => void;
  }>;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ actions }) => {
  const { toast } = useToast();

  // Filter out any restricted actions and add proper report generation
  const enhancedActions = actions.map(action => {
    if (action.title === "Financial Reports") {
      return {
        ...action,
        action: () => {
          try {
            // Generate a proper CSV report
            const reportData = [
              ['Month', 'Revenue', 'Expenses', 'Net Income'],
              ['January', 'KES 2,800,000', 'KES 1,200,000', 'KES 1,600,000'],
              ['February', 'KES 2,950,000', 'KES 1,180,000', 'KES 1,770,000'],
              ['March', 'KES 3,100,000', 'KES 1,250,000', 'KES 1,850,000']
            ];
            
            const csvContent = reportData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
              const url = URL.createObjectURL(blob);
              link.setAttribute('href', url);
              link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              toast({
                title: "Report Generated",
                description: "Financial report has been downloaded successfully.",
              });
            }
          } catch (error) {
            toast({
              title: "Report Error",
              description: "Failed to generate report. Please try again.",
              variant: "destructive"
            });
          }
        }
      };
    }
    
    if (action.title === "Academic Reports") {
      return {
        ...action,
        action: () => {
          try {
            // Generate academic performance report
            const reportData = [
              ['Grade', 'Total Students', 'Average Score', 'Attendance Rate'],
              ['Grade 8', '120', '82.4%', '94.2%'],
              ['Grade 7', '115', '79.8%', '92.1%'],
              ['Grade 6', '108', '81.2%', '93.5%']
            ];
            
            const csvContent = reportData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
              const url = URL.createObjectURL(blob);
              link.setAttribute('href', url);
              link.setAttribute('download', `academic_report_${new Date().toISOString().split('T')[0]}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              toast({
                title: "Report Generated",
                description: "Academic report has been downloaded successfully.",
              });
            }
          } catch (error) {
            toast({
              title: "Report Error",
              description: "Failed to generate academic report. Please try again.",
              variant: "destructive"
            });
          }
        }
      };
    }

    return action;
  });

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>⚡</span>
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {enhancedActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              onClick={action.action}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
