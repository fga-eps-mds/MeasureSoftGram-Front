import React, { ReactNode } from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { useMediaQuery } from '@mui/material';

import { SideMenuProvider, useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false),
}));

interface Props {
  children: ReactNode;
}

const Provider = ({ children }: Props) => <SideMenuProvider>{children}</SideMenuProvider>;

describe('SideMenuProvider', () => {
  it('should render the SideMenuProvider component with children', () => {
    const { container } = render(<div>children</div>, { wrapper: Provider });

    expect(container).toMatchSnapshot();
  });
});

describe('useSideMenuContext', () => {
  beforeEach(() => {
    localStorage.clear();
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  it('should return the SideMenuContext correct', () => {
    const { result } = renderHook(() => useSideMenuContext(), { wrapper: Provider });

    expect(result.current).toEqual({
      isCollapsed: false,
      toggleCollapse: expect.any(Function),
      isOverlay: false,
      closeOverlay: expect.any(Function),
    });
  });

  it('should return the SideMenuContext correct when isCollapsed is true', () => {
    const { result } = renderHook(() => useSideMenuContext(), { wrapper: Provider });

    act(() => {
      result.current.toggleCollapse();
    });

    expect(result.current).toEqual({
      isCollapsed: true,
      toggleCollapse: expect.any(Function),
      isOverlay: false,
      closeOverlay: expect.any(Function),
    });
  });

  describe('em tela estreita', () => {
    beforeEach(() => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);
    });

    it('começa recolhido, mesmo com o menu expandido salvo para telas largas', () => {
      const { result } = renderHook(() => useSideMenuContext(), { wrapper: Provider });

      expect(result.current.isCollapsed).toBe(true);
      expect(result.current.isOverlay).toBe(false);
    });

    it('abre o menu por cima do conteúdo e fecha, sem mudar a preferência salva', () => {
      const { result } = renderHook(() => useSideMenuContext(), { wrapper: Provider });

      act(() => {
        result.current.toggleCollapse();
      });
      expect(result.current.isCollapsed).toBe(false);
      expect(result.current.isOverlay).toBe(true);

      act(() => {
        result.current.closeOverlay();
      });
      expect(result.current.isCollapsed).toBe(true);
      expect(result.current.isOverlay).toBe(false);
      expect(localStorage.getItem('collapsed-sidemenu')).not.toBe('true');
    });

    it('ao alargar a janela, o menu volta para a coluna com a preferência salva', () => {
      const { result, rerender } = renderHook(() => useSideMenuContext(), { wrapper: Provider });

      act(() => {
        result.current.toggleCollapse();
      });
      (useMediaQuery as jest.Mock).mockReturnValue(false);
      rerender();

      expect(result.current.isOverlay).toBe(false);
      expect(result.current.isCollapsed).toBe(false);
    });
  });
});
