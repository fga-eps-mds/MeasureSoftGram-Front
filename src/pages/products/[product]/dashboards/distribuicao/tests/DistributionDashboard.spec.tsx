import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getMetricReference } from '@utils/metricDistribution';
import DistributionDashboard from '../DistributionDashboard';
import { useDistributionDashboard } from '../useDistributionDashboard';
import { action, commentsReference, files, front, releases, service, summary, withFiles } from './fixtures';

type ChartOption = { series: { data: unknown; markLine?: { data: unknown } }[] };

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
jest.mock('../useDistributionDashboard', () => ({ useDistributionDashboard: jest.fn() }));
// o ECharts não roda no jsdom: o mock mostra os dados e as linhas de referência que o gráfico receberia
jest.mock('next/dynamic', () => () => ({ option }: { option: ChartOption }) => (
  <div data-testid="echarts">{JSON.stringify(option.series.map((series) => [series.data, series.markLine?.data]))}</div>
));

const setReleaseId = jest.fn();
const setRepositoryId = jest.fn();
const setMetric = jest.fn();
const setView = jest.fn();
const retryReleases = jest.fn();
const retryRepositories = jest.fn();
const retryDetail = jest.fn();
const retryComparison = jest.fn();

function dashboard(overrides = {}) {
  return {
    releases,
    release: releases[1],
    currentRelease: releases[1],
    setReleaseId,
    metric: 'complexity',
    setMetric,
    view: 'single',
    setView,
    repositories: [action, front, service],
    repositoryOptions: [action, front, service],
    repository: service,
    setRepositoryId,
    reference: null,
    isLoadingReleases: false,
    releasesError: undefined,
    hasReleases: true,
    isLoadingRepositories: false,
    repositoriesError: undefined,
    detail: withFiles(service),
    isLoadingDetail: false,
    detailError: undefined,
    comparison: undefined,
    isLoadingComparison: false,
    comparisonError: undefined,
    retryReleases,
    retryRepositories,
    retryDetail,
    retryComparison,
    ...overrides
  };
}

function card(name: string) {
  return screen.getByRole('region', { name });
}

describe('<DistributionDashboard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDistributionDashboard as jest.Mock).mockReturnValue(dashboard());
  });

  it('busca os dados do produto da URL', () => {
    render(<DistributionDashboard />);

    expect(useDistributionDashboard).toHaveBeenCalledWith('1', '2');
    expect(screen.getByRole('heading', { name: '5. Distribuição das Métricas' })).toBeInTheDocument();
  });

  it('desenha o histograma e o boxplot do repositório, com os outliers (CA3, CA5)', () => {
    render(<DistributionDashboard />);

    const chart = within(card('Distribuição de complexity entre os arquivos · service')).getByTestId('echarts');
    expect(chart).toHaveTextContent('[[1,3,5,7,8]]');
    expect(chart).toHaveTextContent('[[30,0]]');
    expect(screen.getByText('Passe o mouse sobre um ponto laranja (outlier) para ver o arquivo.')).toBeInTheDocument();
  });

  it('mostra o resumo com os arquivos excluídos (CA3, CA7)', () => {
    render(<DistributionDashboard />);

    const rows = within(card('Resumo'))
      .getAllByTestId('summary-row')
      .map((row) => row.textContent);
    expect(rows).toEqual([
      'Arquivos analisados9',
      'Mínimo1',
      '1º quartil3',
      'Mediana5',
      '3º quartil7',
      'Máximo30',
      'Média7,3',
      'Desvio padrão8,3',
      'Outliers1'
    ]);
    expect(within(card('Resumo')).getByText('2 arquivos excluídos')).toBeInTheDocument();
  });

  it('leva as linhas de referência ao gráfico quando a medida usa a métrica (CA4)', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({
        metric: 'comment_lines_density',
        reference: getMetricReference('comment_lines_density', commentsReference)
      })
    );
    render(<DistributionDashboard />);

    const chart = within(card('Distribuição de comment_lines_density entre os arquivos · service')).getByTestId(
      'echarts'
    );
    expect(chart).toHaveTextContent('Mín. de referência = 10%');
    expect(chart).toHaveTextContent('medida: Densidade de arquivos comentados');
  });

  it('abre na release atual e troca de release (CA2)', () => {
    render(<DistributionDashboard />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Release' }));
    expect(screen.getByRole('option', { name: '2026.2 R2 (atual)' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('option', { name: '2026.2 R1' }));

    expect(setReleaseId).toHaveBeenCalledWith(1);
  });

  it('troca de repositório pelo seletor (CA2)', () => {
    render(<DistributionDashboard />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Repositório' }));
    fireEvent.click(screen.getByRole('option', { name: 'front' }));

    expect(setRepositoryId).toHaveBeenCalledWith(9);
    expect(setView).toHaveBeenCalledWith('single');
  });

  it('abre a comparação pela opção Todos do seletor (CA6)', () => {
    render(<DistributionDashboard />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Repositório' }));
    fireEvent.click(screen.getByRole('option', { name: 'Todos (3)' }));

    expect(setView).toHaveBeenCalledWith('comparison');
    expect(setRepositoryId).not.toHaveBeenCalled();
  });

  it('lista só as métricas coletadas por arquivo e troca de métrica (CA2)', () => {
    render(<DistributionDashboard />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Métrica (coletada por arquivo)' }));
    const options = within(screen.getByRole('listbox'))
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(options).toEqual([
      'complexity',
      'functions',
      'coverage',
      'comment_lines_density',
      'duplicated_lines_density',
      'sqale_debt_ratio'
    ]);
    fireEvent.click(screen.getByRole('option', { name: 'coverage' }));

    expect(setMetric).toHaveBeenCalledWith('coverage');
  });

  it('alterna para a comparação entre repositórios (CA6)', () => {
    render(<DistributionDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Comparar repositórios' }));

    expect(setView).toHaveBeenCalledWith('comparison');
  });

  it('mostra um boxplot por repositório na comparação (CA6)', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({
        view: 'comparison',
        detail: undefined,
        comparison: [
          { name: 'front', summary: { ...summary, count: 5, median: 4 }, files: files.slice(0, 8) },
          { name: 'service', summary, files }
        ]
      })
    );
    render(<DistributionDashboard />);

    const comparison = card('complexity por repositório · 2026.2 R2');
    expect(within(comparison).getByTestId('echarts')).toHaveTextContent('[[1,3,4,7,8],[1,3,5,7,8]]');
    expect(within(comparison).getByText('Um boxplot por repositório')).toBeInTheDocument();
    expect(within(comparison).getByText('Sem complexity por arquivo nesta release: action.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Repositório' })).toHaveTextContent('Todos (3)');
    expect(screen.getByRole('button', { name: 'Comparar repositórios' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('explica quando nenhum repositório tem a métrica na comparação (CA8)', () => {
    const collected = { ...action, collected_at: '2026-10-14T21:03:11-03:00' };
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({
        view: 'comparison',
        detail: undefined,
        repositories: [collected],
        repositoryOptions: [collected],
        repository: collected
      })
    );
    render(<DistributionDashboard />);

    const empty = card('complexity por repositório · 2026.2 R2');
    expect(within(empty).getByText('Sem dados por arquivo')).toBeInTheDocument();
    expect(within(empty).getByText('Nenhum repositório tem complexity por arquivo nesta release')).toBeInTheDocument();
  });

  it('mostra o erro da comparação e tenta de novo (CA8)', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({ view: 'comparison', detail: undefined, comparisonError: new Error('500') })
    );
    render(<DistributionDashboard />);

    fireEvent.click(within(card('Falha ao carregar')).getByRole('button', { name: 'Tentar novamente' }));

    expect(retryComparison).toHaveBeenCalled();
  });

  it('orienta a planejar uma release quando o produto não tem nenhuma (CA8)', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({
        releases: [],
        release: undefined,
        currentRelease: undefined,
        hasReleases: false,
        repositories: [],
        repositoryOptions: [],
        repository: undefined,
        detail: undefined
      })
    );
    render(<DistributionDashboard />);

    const empty = card('Produto sem release');
    expect(within(empty).getByText('Sem release')).toBeInTheDocument();
    expect(within(empty).getByText('Este produto ainda não tem release')).toBeInTheDocument();
    fireEvent.click(within(empty).getByRole('button', { name: 'Planejar release' }));

    expect(push).toHaveBeenCalledWith('/products/1-2-Produto/releases/create');
  });

  it('explica quando o repositório não tem coleta por arquivo na release (CA8)', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(dashboard({ repository: action, detail: undefined }));
    render(<DistributionDashboard />);

    const empty = card('Distribuição de complexity entre os arquivos · action');
    expect(within(empty).getByText('Sem dados por arquivo')).toBeInTheDocument();
    expect(
      within(empty).getByText('Não há métricas por arquivo do repositório action nesta release')
    ).toBeInTheDocument();
    expect(within(empty).getByRole('link', { name: 'Ver como configurar a coleta' })).toHaveAttribute(
      'href',
      'https://github.com/fga-eps-mds/MeasureSoftGram-Action'
    );
  });

  it('aponta a métrica que faltou quando a coleta veio sem ela (CA8)', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({ repository: { ...action, collected_at: '2026-10-14T21:03:11-03:00' }, detail: undefined })
    );
    render(<DistributionDashboard />);

    expect(
      screen.getByText('A última coleta do repositório action não trouxe complexity por arquivo')
    ).toBeInTheDocument();
  });

  it('mostra o erro sem detalhes técnicos e tenta de novo (CA8)', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({ detail: undefined, detailError: new Error('500') })
    );
    render(<DistributionDashboard />);

    const failure = card('Falha ao carregar');
    expect(within(failure).getByText('Erro')).toBeInTheDocument();
    expect(within(failure).getByText('Não foi possível carregar a distribuição')).toBeInTheDocument();
    expect(screen.queryByText('500')).not.toBeInTheDocument();
    fireEvent.click(within(failure).getByRole('button', { name: 'Tentar novamente' }));

    expect(retryDetail).toHaveBeenCalled();
  });

  it('mostra o erro quando não consegue buscar as releases', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({ releasesError: new Error('500'), hasReleases: false, release: undefined })
    );
    render(<DistributionDashboard />);

    expect(within(card('Falha ao carregar')).getByText('Não foi possível carregar a distribuição')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(retryReleases).toHaveBeenCalled();
  });

  it('mostra o carregamento com o título do gráfico enquanto busca a lista da release', () => {
    (useDistributionDashboard as jest.Mock).mockReturnValue(
      dashboard({ isLoadingRepositories: true, detail: undefined })
    );
    render(<DistributionDashboard />);

    expect(within(card('Distribuição de complexity entre os arquivos')).getByText('Carregando')).toBeInTheDocument();
    expect(screen.queryByTestId('echarts')).not.toBeInTheDocument();
  });
});
