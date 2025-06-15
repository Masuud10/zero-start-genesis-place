
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useToast } from '@/hooks/use-toast';

interface NavigationContextType {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { checkAccess, user } = useAccessControl();
  const { toast } = useToast();

  const handleSectionChange = (section: string) => {
    if (checkAccess(section)) {
      console.log(`✅ NavigationContext: Access granted, switching to ${section}`);
      setActiveSection(section);
    } else {
      console.log(`❌ NavigationContext: Access denied to ${section}`);
      toast({
        title: "Access Denied",
        description: `You don't have permission to access the "${section}" page.`,
        variant: "destructive"
      });
    }
  };

  const value = useMemo(() => ({
    activeSection,
    onSectionChange: handleSectionChange
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [activeSection, user]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
