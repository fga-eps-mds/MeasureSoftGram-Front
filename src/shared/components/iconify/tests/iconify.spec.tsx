import React from 'react';
import { render } from '@testing-library/react';
import Iconify from '../iconify';

describe('Iconify', () => {
  // Teste de Renderização
  it('should render correctly', () => {
    const { container } = render(<Iconify icon="home" />);
    expect(container.firstChild).toBeTruthy();
  });

  // Teste de Encaminhamento de Referência
  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Iconify icon="home" ref={ref} />);

    // Verifique se a referência não é nula
    expect(ref.current).not.toBeNull();

    // Verifique se a referência é uma instância de HTMLDivElement
    if (ref.current) {
      expect(ref.current instanceof HTMLDivElement).toBeTruthy();
    }
  });

  // Teste de Estilos Customizados
  it('should apply custom styles', () => {
    const { container } = render(<Iconify icon="home" sx={{ color: 'red' }} />);
    const icon = container.firstChild as Element;

    // Verifique se o elemento contém o estilo esperado
    expect(window.getComputedStyle(icon).color).toBe('red');
  });

  // Teste de Snapshot
  it('should match snapshot', () => {
    const { asFragment } = render(<Iconify icon="home" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
