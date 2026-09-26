import { useLocalStorage } from '@hooks/useLocalStorage';
import React, { createContext, useCallback, useContext, useMemo } from 'react';

interface SideMenuProviderProps {
  children: React.ReactNode;
}

interface SideMenuContextProps {
  isCollapsed: boolean | null;
  toggleCollapse: () => void;
}

const SideMenuContext = createContext<SideMenuContextProps>({} as SideMenuContextProps);

export function SideMenuProvider({ children }: SideMenuProviderProps) {
  const { storedValue: isCollapsed, setValue: setCollapsed } = useLocalStorage<boolean | null>(
    'collapsed-sidemenu',
    false
  );

  const toggleCollapse = useCallback(() => setCollapsed((prev) => !prev), [setCollapsed]);

  const value = useMemo(() => ({ isCollapsed, toggleCollapse }), [isCollapsed, toggleCollapse]);

  return <SideMenuContext.Provider value={value}>{children}</SideMenuContext.Provider>;
}

export function useSideMenuContext() {
  const context = useContext(SideMenuContext);

  if (!context) {
    throw new Error('useSideMenu must be used within an SideMenuProvider');
  }

  return context;
}
