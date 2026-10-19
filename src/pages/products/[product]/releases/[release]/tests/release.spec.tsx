import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { productQuery } from '@services/product';
import Release from '../index.page';

jest.mock('@services/product', () => ({
  productQuery: {
    getReleaseAnalysisDataByReleaseId: jest.fn(),
  }
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    isReady: true,
    query: {
      product: '1-1',
      release: '1',
    },
  })),
}));

describe('Release', () => {
  it('renders without crashing', async () => {

    (productQuery.getReleaseAnalysisDataByReleaseId as jest.Mock).mockResolvedValue({ data: mockedResponse });

    render(<Release />);

    await waitFor(() => expect(productQuery.getReleaseAnalysisDataByReleaseId).toBeCalled());

    const releaseTitle = await screen.findByText('release name');
    const dataRelease = await screen.findByTestId('data-release');
    const repositoryTabs = await screen.findAllByTestId('repository-tab');

    expect(releaseTitle).toBeInTheDocument();
    expect(dataRelease).toHaveTextContent('01 de janeiro de 2022 - 01 de abril de 2022');
    expect(repositoryTabs).toHaveLength(2);
  });

  it('exibe o equalizador Planejado × Realizado direto, sem o gráfico de linhas', async () => {
    (productQuery.getReleaseAnalysisDataByReleaseId as jest.Mock).mockResolvedValue({ data: mockedResponse });

    render(<Release />);

    expect(await screen.findByTestId('planned-vs-accomplished-equalizer')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^equalizer-track-/)).toHaveLength(plannedMock.length);
    expect(screen.queryByTitle('Planejado vs Realizado')).not.toBeInTheDocument();
  });

  it('troca os valores realizados ao selecionar outro repositório', async () => {
    (productQuery.getReleaseAnalysisDataByReleaseId as jest.Mock).mockResolvedValue({ data: mockedResponse });

    render(<Release />);

    expect(await screen.findByTestId('equalizer-norm-diff')).toHaveTextContent('0.21');

    fireEvent.click(screen.getAllByTestId('repository-tab')[1]);

    await waitFor(() => expect(screen.getByTestId('equalizer-norm-diff')).toHaveTextContent('0.30'));
  });

  it('exibe apenas o planejado quando a release não tem dados realizados', async () => {
    (productQuery.getReleaseAnalysisDataByReleaseId as jest.Mock).mockResolvedValue({
      data: { ...mockedResponse, accomplished: [] },
    });

    render(<Release />);

    expect(await screen.findByTestId('equalizer-no-accomplished')).toBeInTheDocument();
  });

  it('sai do carregamento e informa erro quando a análise da release falha', async () => {
    (productQuery.getReleaseAnalysisDataByReleaseId as jest.Mock).mockRejectedValue(new Error('500'));

    render(<Release />);

    expect(await screen.findByTestId('equalizer-load-error')).toHaveTextContent('loadError');
  });
});


const release = {
  id: 1,
  created_at: '2022-01-01T00:00:00.000Z',
  start_at: '2022-01-01T00:00:00.000Z',
  end_at: '2022-04-01T00:00:00.000Z',
  release_name: 'release name',
  description: 'release description',
  created_by: 1,
  product: 1,
  goal: 1,
};

const plannedMock = [
  {
    name: 'functional_suitability',
    value: 0.5,
    diff: 0.1
  },
  {
    name: 'performance_efficiency',
    value: 0.4,
    diff: 0.1
  },
  {
    name: 'compatibility',
    value: 0.7,
    diff: 0.1
  },
  {
    name: 'interaction_capability',
    value: 0.9,
    diff: 0.1
  },
  {
    name: 'reliability',
    value: 0.2,
    diff: 0.1
  },
  {
    name: 'security',
    value: 1,
    diff: 0.1
  },
  {
    name: 'maintainability',
    value: 0.5,
    diff: 0.1
  },
  {
    name: 'flexibility',
    value: 0.2,
    diff: 0.1
  }
]

const mockedResponse = {
  release,
  planned: plannedMock,
  accomplished: [{
    repository_name: 'Repositorio 1',
    characteristics: plannedMock,
    norm_diff: 0.21
  },
  {
    repository_name: 'Repositorio 2',
    characteristics: plannedMock,
    norm_diff: 0.3
  }]
}
