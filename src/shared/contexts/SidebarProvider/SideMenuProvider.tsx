import { useLocalStorage } from '@hooks/useLocalStorage';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface SideMenuProviderProps {
  children: React.ReactNode;
}

interface SideMenuContextProps {
  isCollapsed: boolean | null;
  toggleCollapse: () => void;
  // tela estreita com o menu aberto por cima do conteúdo
  isOverlay: boolean;
  closeOverlay: () => void;
}

const SideMenuContext = createContext<SideMenuContextProps>({} as SideMenuContextProps);

export function SideMenuProvider({ children }: SideMenuProviderProps) {
  const { storedValue: storedCollapsed, setValue: setCollapsed } = useLocalStorage<boolean | null>(
    'collapsed-sidemenu',
    false
  );
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'));
  const [isOverlayOpen, setOverlayOpen] = useState(false);

  // ao alargar a janela, o menu volta para a coluna; ao estreitar de novo, começa fechado
  useEffect(() => {
    setOverlayOpen(false);
  }, [isNarrow]);

  // Em tela estreita o menu começa recolhido e, aberto, fica por cima do conteúdo, sem empurrá-lo. A preferência
  // salva vale só para telas largas: quem deixa o menu expandido no computador não abre o celular com ele por cima.
  const isCollapsed = isNarrow ? !isOverlayOpen : storedCollapsed;
  const isOverlay = isNarrow && isOverlayOpen;

  const toggleCollapse = useCallback(() => {
    if (isNarrow) {
      setOverlayOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }, [isNarrow, setCollapsed]);

  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  const value = useMemo(
    () => ({ isCollapsed, toggleCollapse, isOverlay, closeOverlay }),
    [isCollapsed, toggleCollapse, isOverlay, closeOverlay]
  );

  return <SideMenuContext.Provider value={value}>{children}</SideMenuContext.Provider>;
}

export function useSideMenuContext() {
  const context = useContext(SideMenuContext);

  if (!context) {
    throw new Error('useSideMenu must be used within an SideMenuProvider');
  }

  return context;
}
