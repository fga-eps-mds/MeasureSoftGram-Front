import React from 'react';
import { render } from '@testing-library/react';
import Iconify from '../iconify';

describe('Iconify', () => {
  // Teste de Renderização
  it('should render correctly', () => {
    const { container } = render(<Iconify icon="home" />);
    expect(container.firstChild).toBeTruthy();
  });

  // Teste de Snapshot
  it('should match snapshot', () => {
    const { asFragment } = render(<Iconify icon="home" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
