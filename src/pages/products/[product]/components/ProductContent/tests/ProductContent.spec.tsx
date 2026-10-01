import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import ProductContent from '../ProductContent';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
jest.mock('@components/PulseChart', () => ({ PulseChart: () => <div data-testid="pulse-chart" /> }));
jest.mock('../NoReleasesState', () => () => <div data-testid="no-releases" />);
jest.mock('@contexts/ProductProvider', () => {
  const product = { id: '2', name: 'Produto' };
  return { useProductContext: () => ({ currentProduct: product }) };
});
jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto' } }) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe('<ProductContent />', () => {
  it('mostra o skeleton enquanto as releases carregam', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });

    const { container } = render(<ProductContent />);

    expect(container.querySelector('.MuiSkeleton-root')).not.toBeNull();
    expect(screen.queryByTestId('pulse-chart')).toBeNull();
  });

  it('renderiza o grafico de pulso quando existem releases', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: [{ id: 1 }], isLoading: false });

    const { container } = render(<ProductContent />);

    expect(screen.getByTestId('pulse-chart')).toBeTruthy();
    expect(container.querySelector('.MuiSkeleton-root')).toBeNull();
  });

  it('renderiza NoReleasesState quando nao existem releases', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: { results: [] }, isLoading: false });

    render(<ProductContent />);

    expect(screen.getByTestId('no-releases')).toBeTruthy();
  });
});
