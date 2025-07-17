
import React, { useState } from 'react';
import { useAdminAuthContext } from '@/components/auth/AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAdminAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: '📊', roles: ['super_admin'] },
    { id: 'analytics', label: 'System Analytics', icon: '📈', roles: ['super_admin'] },
    { id: 'schools', label: 'Schools Management', icon: '🏫', roles: ['super_admin'] },
    { id: 'users', label: 'User Management', icon: '👥', roles: ['super_admin'] },
    { id: 'billing', label: 'Billing & Subscriptions', icon: '💰', roles: ['super_admin'] },
    { id: 'company-management', label: 'Company Management', icon: '🏢', roles: ['super_admin'] },
    { id: 'maintenance', label: 'System Health', icon: '🔧', roles: ['super_admin'] },
    { id: 'security', label: 'Security', icon: '🔒', roles: ['super_admin'] },
    { id: 'support', label: 'Support', icon: '🎧', roles: ['super_admin'] },
    { id: 'settings', label: 'System Settings', icon: '⚙️', roles: ['super_admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'elimisha_admin':
        return 'Elimisha Admin';
      default:
        return 'Unauthorized User';
    }
  };

  const handleSectionChange = (section: string) => {
    onSectionChange?.(section);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 gradient-navy rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm md:text-base">🎓</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm md:text-base">EduFam</h2>
            <p className="text-xs md:text-sm text-muted-foreground">{getRoleDisplay(user?.role || '')}</p>
          </div>
        </div>
      </div>

      <nav className="p-3 md:p-4 space-y-1 md:space-y-2 flex-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start text-left h-10 md:h-12 transition-all duration-200 text-sm md:text-base",
              activeSection === item.id 
                ? "gradient-navy text-white shadow-lg" 
                : "hover:bg-accent"
            )}
            onClick={() => handleSectionChange(item.id)}
          >
            <span className="mr-2 md:mr-3 text-base md:text-lg">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-3 md:p-4">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-3 md:p-4 border border-border">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full gradient-navy flex items-center justify-center">
              <span className="text-white text-xs md:text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="fixed top-4 left-4 z-50 bg-white shadow-lg"
            >
              <span className="text-lg">☰</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-border shadow-lg flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
