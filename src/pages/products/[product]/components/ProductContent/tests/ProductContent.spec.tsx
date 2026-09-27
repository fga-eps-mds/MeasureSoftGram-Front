import React from 'react';
import { render, screen } from '@testing-library/react';
import { useGrafanaDashboard } from '@hooks/useGrafanaDashboard';
import ProductContent from '../ProductContent';

jest.mock('@hooks/useGrafanaDashboard', () => ({ useGrafanaDashboard: jest.fn() }));
jest.mock('@contexts/ProductProvider', () => {
  const product = { id: '2', name: 'Produto' };
  return { useProductContext: () => ({ currentProduct: product }) };
});
jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto' } }) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe('<ProductContent />', () => {
  it('mantém o iframe montado enquanto uma nova busca está em andamento', () => {
    (useGrafanaDashboard as jest.Mock).mockReturnValue({
      grafanaUrl: 'http://grafana/d/pulso',
      loading: true,
      error: false,
    });

    const { container } = render(<ProductContent />);

    expect(screen.getByTitle('Dashboard de Pulso')).toBeTruthy();
    expect(container.querySelector('.MuiCircularProgress-root')).toBeNull();
  });

  it('mostra o carregamento apenas na primeira busca', () => {
    (useGrafanaDashboard as jest.Mock).mockReturnValue({ grafanaUrl: null, loading: true, error: false });

    const { container } = render(<ProductContent />);

    expect(screen.queryByTitle('Dashboard de Pulso')).toBeNull();
    expect(container.querySelector('.MuiCircularProgress-root')).not.toBeNull();
  });
});
