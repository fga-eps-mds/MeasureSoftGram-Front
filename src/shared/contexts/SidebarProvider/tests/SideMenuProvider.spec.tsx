import React, { ReactNode } from 'react';
import { act, render, renderHook } from '@testing-library/react';

import { SideMenuProvider, useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';

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
  it('should return the SideMenuContext correct', () => {
    const { result } = renderHook(() => useSideMenuContext(), { wrapper: Provider });

    expect(result.current).toEqual({ isCollapsed: false, toggleCollapse: expect.any(Function) });
  });

  it('should return the SideMenuContext correct when isCollapsed is true', () => {
    const { result } = renderHook(() => useSideMenuContext(), { wrapper: Provider });

    act(() => {
      result.current.toggleCollapse();
    });

    expect(result.current).toEqual({ isCollapsed: true, toggleCollapse: expect.any(Function) });
  });
});
