
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  Activity,
  Globe
} from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';

interface SystemActionsPanelProps {
  onModalOpen: (modalType: string) => void;
}

const SystemActionsPanel: React.FC<SystemActionsPanelProps> = () => {
  const { onSectionChange } = useNavigation();

  const systemActions = [
    { id: 'schools', label: 'Manage Schools', icon: Building2, description: 'Add and configure schools' },
    { id: 'users', label: 'User Management', icon: Users, description: 'Manage system users' },
    { id: 'analytics', label: 'System Analytics', icon: BarChart3, description: 'View system performance' },
    { id: 'security', label: 'Security Center', icon: Shield, description: 'Security monitoring' },
    { id: 'settings', label: 'System Settings', icon: Settings, description: 'Configure system' },
    { id: 'health', label: 'System Health', icon: Activity, description: 'Monitor system status' },
  ];

  const handleActionClick = (sectionId: string) => {
    onSectionChange(sectionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          System Management
        </CardTitle>
        <CardDescription>
          Access system-wide administrative features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {systemActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-24 flex-col gap-2 p-4 text-center"
              onClick={() => handleActionClick(action.id)}
            >
              <action.icon className="h-6 w-6 mb-1" />
              <span className="font-medium text-sm leading-tight">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemActionsPanel;
