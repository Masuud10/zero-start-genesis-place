
import React, { createContext, useContext, useState, useCallback } from 'react';

interface NavigationContextType {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const onSectionChange = useCallback((section: string) => {
    console.log('🧭 NavigationContext: Section change from', activeSection, 'to', section);
    setActiveSection(section);
  }, [activeSection]);

  console.log('🧭 NavigationContext: Current active section:', activeSection);

  return (
    <NavigationContext.Provider value={{ activeSection, onSectionChange }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
