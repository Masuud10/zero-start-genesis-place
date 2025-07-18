import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Shield, 
  Bell,
  Menu,
  X,
  Home,
  UserCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  School,
  Calendar,
  Activity,
  Globe,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuthContext } from '@/components/auth/AdminAuthProvider';
import AdminDashboardOverview from '@/components/dashboard/AdminDashboardOverview';
import SchoolManagementPage from '@/components/dashboard/super-admin/SchoolManagementPage';
import AdminUserManagementPage from '@/components/dashboard/super-admin/AdminUserManagementPage';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component?: React.ComponentType<any>;
  children?: SidebarItem[];
}

const EduFamAdminDashboard = () => {
  const { adminUser } = useAdminAuthContext();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: Home,
      component: AdminDashboardOverview
    },
    {
      id: 'schools',
      label: 'School Management',
      icon: Building2,
      children: [
        {
          id: 'all-schools',
          label: 'All Schools',
          icon: School,
          component: SchoolManagementPage
        },
        {
          id: 'onboard-school',
          label: 'Onboard School',
          icon: Building2
        },
        {
          id: 'subscriptions',
          label: 'Subscriptions',
          icon: CreditCard
        }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      children: [
        {
          id: 'admin-users',
          label: 'Admin Users',
          icon: UserCheck,
          component: AdminUserManagementPage
        },
        {
          id: 'school-users',
          label: 'School Users',
          icon: Users
        },
        {
          id: 'permissions',
          label: 'Permissions',
          icon: Shield
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      children: [
        {
          id: 'system-analytics',
          label: 'System Analytics',
          icon: TrendingUp
        },
        {
          id: 'revenue-analytics',
          label: 'Revenue Analytics',
          icon: DollarSign
        },
        {
          id: 'usage-analytics',
          label: 'Usage Analytics',
          icon: Activity
        }
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: DollarSign,
      children: [
        {
          id: 'billing',
          label: 'Billing Management',
          icon: CreditCard
        },
        {
          id: 'revenue',
          label: 'Revenue Reports',
          icon: TrendingUp
        }
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: Settings,
      children: [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell
        },
        {
          id: 'system-settings',
          label: 'System Settings',
          icon: Settings
        },
        {
          id: 'audit-logs',
          label: 'Audit Logs',
          icon: Shield
        }
      ]
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              setActiveSection(item.id);
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
            isActive 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex items-center">
            <item.icon className={`w-4 h-4 mr-3 ${level > 0 ? 'w-3 h-3' : ''}`} />
            {sidebarOpen && (
              <span className={`font-medium ${level > 0 ? 'text-sm' : ''}`}>
                {item.label}
              </span>
            )}
          </div>
          {sidebarOpen && hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {sidebarOpen && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getCurrentComponent = () => {
    const findComponent = (items: SidebarItem[]): React.ComponentType<any> | null => {
      for (const item of items) {
        if (item.id === activeSection && item.component) {
          return item.component;
        }
        if (item.children) {
          const found = findComponent(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const Component = findComponent(sidebarItems);
    return Component ? <Component /> : <AdminDashboardOverview />;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-foreground">EduFam Admin</h1>
                  <p className="text-xs text-muted-foreground">Management Console</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-2">
            {sidebarItems.map(item => renderSidebarItem(item))}
          </nav>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-primary" />
            </div>
            {sidebarOpen && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {adminUser?.name || 'Admin User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {adminUser?.role?.replace('_', ' ') || 'Admin'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {sidebarItems
                  .flatMap(item => [item, ...(item.children || [])])
                  .find(item => item.id === activeSection)?.label || 'Dashboard Overview'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Welcome back, {adminUser?.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {getCurrentComponent()}
        </main>
      </div>
    </div>
  );
};

export default EduFamAdminDashboard;