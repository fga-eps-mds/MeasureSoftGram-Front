import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useOverviewDashboard } from '../useOverviewDashboard';
import OverviewDashboard from '../OverviewDashboard';
import { characteristics, previousCharacteristics, releases, repositoryWithoutAnalysis, summary } from './fixtures';

const push = jest.fn();

jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto' }, push }) }));
jest.mock('@components/Layout', () => ({ __esModule: true, default: (page: React.ReactNode) => page }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({
    terms: {
      Repository: 'Repositório',
      Repositories: 'Repositórios',
      repository: 'repositório',
      repositories: 'repositórios'
    }
  })
}));
jest.mock('../useOverviewDashboard', () => ({ useOverviewDashboard: jest.fn() }));
// o ECharts não roda no jsdom: o mock mostra os dados que o gráfico receberia
jest.mock('next/dynamic', () => () => ({ option }: { option: { series: { data: unknown }[] } }) => (
  <div data-testid="echarts">{JSON.stringify(option.series.map((series) => series.data))}</div>
));

const retrySummary = jest.fn();
const retryCharacteristics = jest.fn();
const retryReleases = jest.fn();
const setReleaseId = jest.fn();

function dashboard(overrides = {}) {
  return {
    releases,
    release: releases[1],
    currentRelease: releases[1],
    previousRelease: releases[0],
    setReleaseId,
    isLoadingReleases: false,
    releasesError: undefined,
    hasReleases: true,
    summary: summary(),
    summaryError: undefined,
    characteristics: characteristics(),
    characteristicsError: undefined,
    previousCharacteristics,
    retryReleases,
    retrySummary,
    retryCharacteristics,
    ...overrides
  };
}

function card(name: string) {
  return screen.getByRole('region', { name });
}

describe('<OverviewDashboard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOverviewDashboard as jest.Mock).mockReturnValue(dashboard());
  });

  it('busca os dados do produto da URL', () => {
    render(<OverviewDashboard />);

    expect(useOverviewDashboard).toHaveBeenCalledWith('1', '2');
  });

  it('mostra os totais da release', () => {
    render(<OverviewDashboard />);

    const totals = screen.getAllByTestId('overview-total').map((total) => total.textContent);
    expect(totals).toEqual([
      '3Características',
      '6Subcaracterísticas',
      '10Medidas',
      '14Métricas',
      '2Repositórios',
      '1.284Arquivos analisados'
    ]);
  });

  it('desenha o TSQMI por repositório, do maior para o menor', () => {
    render(<OverviewDashboard />);

    expect(within(card('TSQMI por repositório')).getByTestId('echarts')).toHaveTextContent('[[0.81,0.72]]');
  });

  it('desenha o radar do primeiro repositório e troca de repositório', () => {
    render(<OverviewDashboard />);
    const radar = card('Radar das características');

    expect(within(radar).getByTestId('echarts')).toHaveTextContent('[[{"name":"service","value":[0.74,0.78]}]]');
    expect(within(radar).getByText('Características do repositório service na release 2026.2 R2.')).toBeInTheDocument();

    fireEvent.mouseDown(within(radar).getByRole('combobox', { name: 'Repositório' }));
    fireEvent.click(screen.getByRole('option', { name: 'front' }));

    expect(within(radar).getByTestId('echarts')).toHaveTextContent('[[{"name":"front","value":[0.7,"-"]}]]');
  });

  it('avisa quando o repositório escolhido no radar não tem análise na release', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({ characteristics: characteristics([...characteristics().repositories, repositoryWithoutAnalysis]) })
    );
    render(<OverviewDashboard />);
    const radar = card('Radar das características');

    fireEvent.mouseDown(within(radar).getByRole('combobox', { name: 'Repositório' }));
    fireEvent.click(screen.getByRole('option', { name: 'docs' }));

    expect(within(radar).getByText('O repositório docs não tem análise nesta release.')).toBeInTheDocument();
  });

  it('desenha o planejado × realizado por característica', () => {
    render(<OverviewDashboard />);

    expect(within(card('Planejado × Realizado por característica')).getByTestId('echarts')).toHaveTextContent(
      '[[0.7,0.8],[0.72,0.78]]'
    );
  });

  it('abre na release atual e troca de release', () => {
    render(<OverviewDashboard />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Release' }));

    expect(screen.getByRole('option', { name: '2026.2 R2 (atual)' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('option', { name: '2026.2 R1' }));

    expect(setReleaseId).toHaveBeenCalledWith(1);
  });

  it('mostra o carregamento enquanto busca a release', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({ isLoadingReleases: true, release: undefined, summary: undefined, characteristics: undefined })
    );
    render(<OverviewDashboard />);

    expect(screen.getAllByText('Carregando')).toHaveLength(3);
    expect(screen.getAllByTestId('overview-total')[0]).not.toHaveTextContent('3');
    expect(screen.queryByTestId('echarts')).not.toBeInTheDocument();
  });

  it('explica o que fazer quando a release não tem análises', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({
        characteristics: {
          ...characteristics([repositoryWithoutAnalysis]),
          characteristics: characteristics().characteristics.map((item) => ({
            ...item,
            planned: null,
            accomplished: null
          }))
        }
      })
    );
    render(<OverviewDashboard />);

    expect(screen.getAllByText('Sem dados')).toHaveLength(3);
    expect(screen.getAllByText('Ainda não há análises nesta release')).toHaveLength(3);
    expect(screen.getAllByRole('link', { name: 'Ver como configurar a coleta' })[0]).toHaveAttribute(
      'href',
      'https://github.com/fga-eps-mds/MeasureSoftGram-Action'
    );
  });

  it('mostra o erro de cada parte com "Tentar novamente"', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({ summaryError: new Error('500'), characteristicsError: new Error('500') })
    );
    render(<OverviewDashboard />);

    const buttons = screen.getAllByRole('button', { name: 'Tentar novamente' });
    expect(buttons).toHaveLength(4);
    expect(screen.queryByText('500')).not.toBeInTheDocument();

    fireEvent.click(within(card('Totais da release')).getByRole('button', { name: 'Tentar novamente' }));
    fireEvent.click(within(card('Radar das características')).getByRole('button', { name: 'Tentar novamente' }));

    expect(retrySummary).toHaveBeenCalled();
    expect(retryCharacteristics).toHaveBeenCalled();
  });

  it('mostra o erro quando não consegue buscar as releases', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({ releasesError: new Error('500'), hasReleases: false, release: undefined })
    );
    render(<OverviewDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(retryReleases).toHaveBeenCalled();
  });

  it('orienta a criar uma release quando o produto não tem nenhuma', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({ releases: [], release: undefined, currentRelease: undefined, hasReleases: false })
    );
    render(<OverviewDashboard />);

    expect(screen.getByText('Este produto ainda não tem releases')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Criar release' }));

    expect(push).toHaveBeenCalledWith('/products/1-2-Produto/releases/create');
  });
});
