
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  School, 
  UserPlus, 
  Building2, 
  GraduationCap, 
  BookOpen,
  Settings,
  Shield,
  Activity,
  TrendingUp
} from 'lucide-react';

interface AdministrativeHubProps {
  onModalOpen: (modalType: string) => void;
  onUserCreated: () => void;
}

const AdministrativeHub = ({ onModalOpen, onUserCreated }: AdministrativeHubProps) => {
  
  const managementActions = [
    {
      title: 'User Management',
      description: 'Create and manage system users across all schools',
      icon: Users,
      color: 'blue',
      actions: [
        { label: 'Create Admin User', action: 'create-admin', icon: UserPlus },
        { label: 'Create School Owner', action: 'create-owner', icon: Building2 },
        { label: 'Create Principal', action: 'create-principal', icon: GraduationCap },
        { label: 'Create Teacher', action: 'create-teacher', icon: BookOpen },
      ]
    },
    {
      title: 'School Management',
      description: 'Onboard new schools and manage existing ones',
      icon: School,
      color: 'green',
      actions: [
        { label: 'Create New School', action: 'create-school', icon: Building2 },
        { label: 'Assign School Owner', action: 'assign-owner', icon: Users },
        { label: 'School Settings', action: 'school-settings', icon: Settings },
        { label: 'School Analytics', action: 'school-analytics', icon: TrendingUp },
      ]
    },
    {
      title: 'System Operations',
      description: 'Monitor and manage system-wide operations',
      icon: Activity,
      color: 'purple',
      actions: [
        { label: 'System Health', action: 'system-health', icon: Activity },
        { label: 'Security Audit', action: 'security-audit', icon: Shield },
        { label: 'Performance Metrics', action: 'performance-metrics', icon: TrendingUp },
        { label: 'System Settings', action: 'system-settings', icon: Settings },
      ]
    }
  ];

  const handleActionClick = (action: string) => {
    console.log('🎯 AdministrativeHub: Action clicked:', action);
    onModalOpen(action);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Management Center</h2>
        <p className="text-muted-foreground">
          Comprehensive administrative tools for managing the EduFam platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {managementActions.map((section) => (
          <Card key={section.title} className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${section.color}-100`}>
                  <section.icon className={`h-6 w-6 text-${section.color}-600`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {section.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {section.actions.map((action) => (
                  <Button
                    key={action.action}
                    variant="outline"
                    className="justify-start h-auto p-3 hover:bg-gray-50"
                    onClick={() => handleActionClick(action.action)}
                  >
                    <action.icon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Quick System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">Real-time</div>
              <div className="text-sm text-gray-600">Data Sync</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Secure</div>
              <div className="text-sm text-gray-600">Encryption</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdministrativeHub;
