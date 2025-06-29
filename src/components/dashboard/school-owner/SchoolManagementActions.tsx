
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, BarChart3, Settings, FileText } from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';

interface SchoolManagementActionsProps {
  onAction?: (action: string) => void; // Keep for backward compatibility
}

const SchoolManagementActions: React.FC<SchoolManagementActionsProps> = ({ onAction }) => {
  const { setActiveSection } = useNavigation();
  const { user } = useAuth();

  const handleActionClick = (action: string) => {
    // Call the callback for backward compatibility
    if (onAction) {
      onAction(action);
    }
    
    // Navigate to the appropriate section
    setActiveSection(action);
  };

  // Define actions based on user role
  const getManagementActions = () => {
    const baseActions = [
      { id: 'students', label: 'Student Management', icon: Users, description: 'Manage enrollments' },
      { id: 'finance', label: 'Financial Overview', icon: DollarSign, description: 'Revenue & expenses' },
      { id: 'analytics', label: 'School Analytics', icon: BarChart3, description: 'Performance metrics' },
      { id: 'reports', label: 'Reports', icon: FileText, description: 'Generate reports' },
      { id: 'settings', label: 'School Settings', icon: Settings, description: 'Configure school' },
    ];

    // Add staff management for school owners only
    if (user?.role === 'school_owner') {
      baseActions.splice(1, 0, { 
        id: 'users', 
        label: 'Staff Management', 
        icon: Users, 
        description: 'Manage teachers & staff' 
      });
    }

    return baseActions;
  };

  const managementActions = getManagementActions();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {managementActions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="h-24 flex-col gap-2 p-4 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          onClick={() => handleActionClick(action.id)}
        >
          <action.icon className="h-6 w-6 text-blue-600" />
          <div className="text-center">
            <div className="font-medium text-sm">{action.label}</div>
            <div className="text-xs text-muted-foreground">{action.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default SchoolManagementActions;
