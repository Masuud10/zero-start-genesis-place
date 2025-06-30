
import React, { useState } from 'react';
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
  TrendingUp,
  Plus,
  BarChart3,
  Database,
  Headphones
} from 'lucide-react';
import CreateSchoolDialog from '@/components/school/CreateSchoolDialog';
import { useNavigation } from '@/contexts/NavigationContext';

interface AdministrativeHubProps {
  onModalOpen: (modalType: string) => void;
  onUserCreated: () => void;
}

const AdministrativeHub = ({ onModalOpen, onUserCreated }: AdministrativeHubProps) => {
  const { onSectionChange } = useNavigation();

  const handleActionClick = (action: string) => {
    console.log('🎯 AdministrativeHub: Action clicked:', action);
    
    // Handle navigation to sections
    const sectionMappings: { [key: string]: string } = {
      'system-health': 'system-health',
      'security-audit': 'security',
      'performance-metrics': 'analytics',
      'system-settings': 'settings',
      'school-analytics': 'analytics',
      'school-settings': 'schools'
    };

    if (sectionMappings[action]) {
      onSectionChange(sectionMappings[action]);
    } else {
      // Handle modal actions
      onModalOpen(action);
    }
  };

  const managementActions = [
    {
      title: 'User Management',
      description: 'Create and manage system users across all schools',
      icon: Users,
      color: 'blue',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
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
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      actions: [
        { label: 'Create New School', action: 'create-school', icon: Building2, isSpecial: true },
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
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      actions: [
        { label: 'System Health', action: 'system-health', icon: Activity },
        { label: 'Security Audit', action: 'security-audit', icon: Shield },
        { label: 'Performance Metrics', action: 'performance-metrics', icon: BarChart3 },
        { label: 'System Settings', action: 'system-settings', icon: Settings },
      ]
    }
  ];

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
          <Card 
            key={section.title} 
            className={`shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${section.bgGradient} ${section.borderColor}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-${section.color}-500 to-${section.color}-600 shadow-lg`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold text-${section.color}-900`}>{section.title}</h3>
                  <p className="text-sm text-gray-600 font-normal mt-1">
                    {section.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {section.actions.map((action) => (
                  action.isSpecial ? (
                    <CreateSchoolDialog key={action.action} onSchoolCreated={onUserCreated}>
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4 hover:bg-white/80 hover:shadow-md transition-all duration-200 border-white/50 bg-white/30"
                      >
                        <action.icon className="h-5 w-5 mr-3 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{action.label}</div>
                        </div>
                      </Button>
                    </CreateSchoolDialog>
                  ) : (
                    <Button
                      key={action.action}
                      variant="outline"
                      className="justify-start h-auto p-4 hover:bg-white/80 hover:shadow-md transition-all duration-200 border-white/50 bg-white/30"
                      onClick={() => handleActionClick(action.action)}
                    >
                      <action.icon className="h-5 w-5 mr-3 text-gray-700" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{action.label}</div>
                      </div>
                    </Button>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <Card className="shadow-lg bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Quick System Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => onSectionChange('analytics')}
              variant="outline" 
              size="sm"
              className="hover:bg-blue-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button 
              onClick={() => onSectionChange('users')}
              variant="outline" 
              size="sm"
              className="hover:bg-green-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button 
              onClick={() => onSectionChange('schools')}
              variant="outline" 
              size="sm"
              className="hover:bg-purple-50"
            >
              <School className="h-4 w-4 mr-2" />
              View Schools
            </Button>
            <Button 
              onClick={() => onSectionChange('settings')}
              variant="outline" 
              size="sm"
              className="hover:bg-orange-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button 
              onClick={() => onSectionChange('support')}
              variant="outline" 
              size="sm"
              className="hover:bg-cyan-50"
            >
              <Headphones className="h-4 w-4 mr-2" />
              Support Center
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                 onClick={() => onSectionChange('system-health')}>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                 onClick={() => onSectionChange('system-health')}>
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                 onClick={() => onSectionChange('analytics')}>
              <div className="text-2xl font-bold text-purple-600">Real-time</div>
              <div className="text-sm text-gray-600">Data Sync</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                 onClick={() => onSectionChange('security')}>
              <div className="text-2xl font-bold text-orange-600">Secure</div>
              <div className="text-sm text-gray-600">Encryption</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdministrativeHub;
