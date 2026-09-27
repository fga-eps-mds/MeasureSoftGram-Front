import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoReleasesState from '../NoReleasesState';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { product: '1-1-MeasureSoftGram' },
    push: mockPush,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { productName?: string }) => {
      if (key === 'no-releases-description-2') {
        return `Cadastre a primeira release de ${options?.productName || ''} para acompanhar a evolução.`;
      }
      const translations: Record<string, string> = {
        'msg-chart-title': 'Gráfico MSG — Evolução de Qualidade',
        'msg-chart-subtitle': 'Uma linha por repositório (TSQMI) • marcadores = releases planejadas • cor = faixa de qualidade',
        'no-releases-title': 'Este produto ainda não tem releases cadastradas',
        'no-releases-description-1': 'O Gráfico MSG acompanha o TSQMI dos repositórios marcando as releases planejadas de cada um.',
        'go-to-releases': 'Ir para Releases',
      };
      return translations[key] || key;
    },
  }),
}));

describe('<NoReleasesState />', () => {
  it('renders no releases orientation elements correctly', () => {
    const { getByText } = render(<NoReleasesState productName="MeasureSoftGram" />);

    expect(getByText('Gráfico MSG — Evolução de Qualidade')).toBeInTheDocument();
    expect(getByText('Este produto ainda não tem releases cadastradas')).toBeInTheDocument();
    expect(
      getByText('Cadastre a primeira release de MeasureSoftGram para acompanhar a evolução.')
    ).toBeInTheDocument();
    expect(getByText('Ir para Releases')).toBeInTheDocument();
  });

  it('navigates to releases page when button is clicked', () => {
    const { getByText } = render(<NoReleasesState productName="MeasureSoftGram" />);
    const button = getByText('Ir para Releases');

    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith('/products/1-1-MeasureSoftGram/releases');
  });
});
