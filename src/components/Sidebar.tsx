
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer'] },
    { id: 'analytics', label: 'Analytics', icon: '📈', roles: ['school_owner', 'principal', 'teacher', 'finance_officer'] },
    { id: 'grades', label: 'Grades', icon: '📝', roles: ['school_owner', 'principal', 'teacher', 'parent'] },
    { id: 'attendance', label: 'Attendance', icon: '📅', roles: ['school_owner', 'principal', 'teacher'] },
    { id: 'students', label: 'Students', icon: '👥', roles: ['school_owner', 'principal', 'teacher'] },
    { id: 'finance', label: 'Finance', icon: '💰', roles: ['school_owner', 'principal', 'finance_officer', 'parent'] },
    { id: 'timetable', label: 'Timetable', icon: '🗓️', roles: ['school_owner', 'principal', 'teacher'] },
    { id: 'announcements', label: 'Announcements', icon: '📢', roles: ['school_owner', 'principal', 'teacher', 'parent'] },
    { id: 'messages', label: 'Messages', icon: '💬', roles: ['school_owner', 'principal', 'teacher', 'parent'] },
    { id: 'reports', label: 'Reports', icon: '📋', roles: ['school_owner', 'principal', 'teacher', 'finance_officer'] },
    { id: 'support', label: 'Support', icon: '🎧', roles: ['school_owner', 'principal'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', roles: ['school_owner', 'principal', 'edufam_admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'school_owner':
        return 'School Owner';
      case 'principal':
        return 'Principal';
      case 'teacher':
        return 'Teacher';
      case 'parent':
        return 'Parent';
      case 'finance_officer':
        return 'Finance Officer';
      case 'edufam_admin':
        return 'EduFam Admin';
      default:
        return role;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-border shadow-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-navy rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">🎓</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">EduFam</h2>
            <p className="text-sm text-muted-foreground">{getRoleDisplay(user?.role || '')}</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start text-left h-12 transition-all duration-200",
              activeSection === item.id 
                ? "gradient-navy text-white shadow-lg" 
                : "hover:bg-accent"
            )}
            onClick={() => onSectionChange?.(item.id)}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full gradient-navy flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
