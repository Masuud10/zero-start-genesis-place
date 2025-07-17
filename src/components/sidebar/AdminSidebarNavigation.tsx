import React from 'react';
import { useAdminAuthContext } from '@/components/auth/AdminAuthProvider';
import { AdminRole } from '@/types/admin';
import { 
  Users, 
  School, 
  BarChart3, 
  Headphones, 
  Megaphone, 
  DollarSign, 
  Settings, 
  Code, 
  Database,
  FileText,
  Shield,
  Calendar,
  Mail
} from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useLocation, useNavigate } from 'react-router-dom';

interface AdminMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  permission?: string;
  roles?: AdminRole[];
  description?: string;
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    path: '/dashboard',
    description: 'Overview and key metrics'
  },
  {
    id: 'user-management',
    label: 'Admin Users',
    icon: Users,
    path: '/admin-users',
    permission: 'manage_admin_users',
    roles: ['super_admin'],
    description: 'Manage admin user accounts and roles'
  },
  {
    id: 'school-management',
    label: 'Schools',
    icon: School,
    path: '/schools',
    permission: 'view_schools',
    description: 'Manage customer schools'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    permission: 'view_system_analytics',
    description: 'System and business analytics'
  },
  {
    id: 'support-tickets',
    label: 'Support',
    icon: Headphones,
    path: '/support',
    permission: 'view_support_tickets',
    roles: ['super_admin', 'support_hr'],
    description: 'Customer support tickets'
  },
  {
    id: 'hr-management',
    label: 'HR Records',
    icon: Users,
    path: '/hr',
    permission: 'view_hr_records',
    roles: ['super_admin', 'support_hr'],
    description: 'Internal HR management'
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    path: '/marketing',
    permission: 'manage_marketing_campaigns',
    roles: ['super_admin', 'sales_marketing'],
    description: 'Marketing campaigns and events'
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: DollarSign,
    path: '/billing',
    permission: 'view_billing',
    roles: ['super_admin', 'finance'],
    description: 'Billing and financial management'
  },
  {
    id: 'logs',
    label: 'System Logs',
    icon: FileText,
    path: '/logs',
    permission: 'view_logs',
    roles: ['super_admin', 'software_engineer'],
    description: 'Application and system logs'
  },
  {
    id: 'database',
    label: 'Database',
    icon: Database,
    path: '/database',
    permission: 'manage_database',
    roles: ['super_admin', 'software_engineer'],
    description: 'Database management tools'
  },
  {
    id: 'api-usage',
    label: 'API Usage',
    icon: Code,
    path: '/api-usage',
    permission: 'view_api_usage',
    roles: ['super_admin', 'software_engineer'],
    description: 'API usage and performance metrics'
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: Shield,
    path: '/audit-logs',
    permission: 'view_audit_logs',
    roles: ['super_admin'],
    description: 'Security and audit logs'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    permission: 'manage_global_settings',
    roles: ['super_admin'],
    description: 'Global system settings'
  },
];

export const AdminSidebarNavigation: React.FC = () => {
  const { hasPermission, isRole, adminUser } = useAdminAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const isMenuItemVisible = (item: AdminMenuItem): boolean => {
    // If no permission or role specified, item is visible to all
    if (!item.permission && !item.roles) return true;
    
    // Check role-based access
    if (item.roles && !isRole(item.roles)) return false;
    
    // Check permission-based access
    if (item.permission && !hasPermission(item.permission)) return false;
    
    return true;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const visibleItems = ADMIN_MENU_ITEMS.filter(isMenuItemVisible);

  return (
    <div className="space-y-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              onClick={() => handleNavigation(item.path)}
              className={`w-full justify-start ${
                active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
              title={item.description}
            >
              <Icon className="h-4 w-4 mr-3" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
      
      {/* Role indicator at bottom */}
      {adminUser && (
        <div className="mt-8 p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Signed in as:</div>
          <div className="text-sm font-medium">{adminUser.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {adminUser.role.replace('_', ' ')}
          </div>
        </div>
      )}
    </div>
  );
};