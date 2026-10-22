import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRequest } from '@hooks/useRequest';
import { DistributionLevel, ReleaseDashboardRepository } from '@customTypes/product';
import DistributionDashboard from '../DistributionDashboard';
import { action, catalog, distribution, entity, front, releaseRepositories, releases, service, tree } from './fixtures';

type ChartOption = { xAxis: unknown; series: { data: unknown }[] };
type Params = { release_id?: number; repository_id?: number; level?: DistributionLevel; key?: string };
type Request = { url: string; params?: Params } | null;
type Response = { data?: unknown; error?: Error };

const push = jest.fn();
const mutate = jest.fn();

jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto' }, push }) }));
jest.mock('@components/Layout', () => ({ __esModule: true, default: (page: React.ReactNode) => page }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
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
// o ECharts não roda no jsdom: o mock mostra o eixo e os dados que o gráfico receberia
jest.mock('next/dynamic', () => () => ({ option }: { option: ChartOption }) => (
  <div data-testid="echarts">{JSON.stringify({ xAxis: option.xAxis, data: option.series[0].data })}</div>
));

/** Uma métrica do GitHub (INT) no nível métrica; os outros níveis vão de 0 a 1. */
function answer(params: Params): Response {
  const { level = 'tsqmi', key = 'tsqmi' } = params;
  const main =
    level === 'metric'
      ? entity(key, key, 'metric', [42, 44, 47, 55, 63], 'INT')
      : entity(key, key === 'tsqmi' ? 'TSQMI' : key, level);
  return {
    data: distribution({ releaseId: params.release_id, repositoryId: params.repository_id, level, key, main })
  };
}

function mockRequests({
  releasesData = { results: releases },
  repositories = [action, service, front],
  respond = answer
}: {
  releasesData?: unknown;
  repositories?: ReleaseDashboardRepository[];
  respond?: typeof answer;
} = {}) {
  (useRequest as jest.Mock).mockImplementation((request: Request) => {
    const result = (response: Response) => ({ isLoading: false, mutate, ...response });
    if (!request) return result({});
    const { url, params = {} } = request;
    if (url.endsWith('/release/')) return result({ data: releasesData });
    if (url.includes('release-dashboard/characteristics')) {
      return result({ data: releaseRepositories(repositories, params.release_id) });
    }
    if (url.includes('quality-model-tree')) return result({ data: tree });
    if (url.includes('entity-analysis/entities')) return result({ data: catalog });
    return result(respond(params));
  });
}

function choose(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }));
}

function optionsOf(label: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  const names = within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((option) => option.textContent);
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  return names;
}

describe('<DistributionDashboard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequests();
  });

  it('mostra o título, a frase com a entidade e a linha da release (CA1 e CA3)', () => {
    render(<DistributionDashboard />);

    expect(screen.getByRole('heading', { name: '5. Distribuição Estatística' })).toBeInTheDocument();
    expect(screen.getByTestId('distribution-subtitle')).toHaveTextContent(
      'Como os valores de TSQMI se espalham entre as suas análises'
    );
    expect(screen.getByTestId('distribution-period')).toHaveTextContent(
      'Release R2 · repositório MeasureSoftGram-Service · 6 análises no período (17 ago a 22 ago)'
    );
  });

  it('abre na release atual e no primeiro repositório com análise, sem a opção "Todos" (CA2)', () => {
    render(<DistributionDashboard />);

    expect(screen.getByRole('combobox', { name: 'Release' })).toHaveTextContent('R2 (atual)');
    expect(screen.getByRole('combobox', { name: 'Repositório' })).toHaveTextContent('MeasureSoftGram-Service');
    expect(optionsOf('Repositório')).toEqual([
      'MeasureSoftGram-Action (sem análise na release)',
      'MeasureSoftGram-Service',
      'MeasureSoftGram-Front'
    ]);
  });

  it('tem os cinco níveis e nenhum seletor de entidade no TSQMI', () => {
    render(<DistributionDashboard />);

    const levels = within(screen.getByRole('group', { name: 'Nível do modelo' })).getAllByRole('button');
    expect(levels.map((button) => button.textContent)).toEqual([
      'TSQMI',
      'Característica',
      'Subcaracterística',
      'Medida',
      'Métrica'
    ]);
    expect(screen.getByRole('button', { name: 'TSQMI' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByTestId('entity-selectors')).not.toBeInTheDocument();
  });

  it('mostra um seletor por nível até o escolhido, cada um filtrado pelo de cima', () => {
    render(<DistributionDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Medida' }));

    expect(screen.getByRole('combobox', { name: 'Característica' })).toHaveTextContent('Reliability');
    expect(screen.getByRole('combobox', { name: 'Subcaracterística' })).toHaveTextContent('Testing Status');
    expect(screen.getByRole('combobox', { name: 'Medida' })).toHaveTextContent('Passed Tests');
    expect(optionsOf('Medida')).toEqual(['Passed Tests', 'CI Feedback Time']);
    expect(screen.getByTestId('distribution-subtitle')).toHaveTextContent('Como os valores de Passed Tests');
  });

  it('trocar um nível de cima limpa os de baixo e atualiza os quadros', () => {
    render(<DistributionDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Medida' }));
    choose('Medida', 'CI Feedback Time');

    choose('Característica', 'Maintainability');

    expect(screen.getByRole('combobox', { name: 'Subcaracterística' })).toHaveTextContent('Modifiability');
    expect(screen.getByRole('combobox', { name: 'Medida' })).toHaveTextContent('Non Complex File Density');
    const last = (useRequest as jest.Mock).mock.calls
      .map(([request]: [Request]) => request)
      .filter((request) => request?.url.includes('analysis-distribution'))
      .pop();
    expect(last?.params).toMatchObject({ level: 'measure', key: 'non_complex_file_density' });
  });

  it('no nível métrica, só lista os ramos com métricas que têm valor por análise', () => {
    render(<DistributionDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Métrica' }));

    expect(optionsOf('Característica')).toEqual(['Reliability', 'Functional Suitability']);
    expect(optionsOf('Métrica')).toEqual(['sum_ci_feedback_times', 'total_builds']);
  });

  it('nos valores de 0 a 1, desenha o histograma de 0 a 1 com a régua A a E (CA4)', () => {
    render(<DistributionDashboard />);

    const histogram = screen.getByRole('region', { name: 'Histograma' });
    const chart = JSON.parse(within(histogram).getByTestId('echarts').textContent ?? '{}');
    expect(chart.xAxis).toMatchObject({ min: 0, max: 1, interval: 0.1 });
    expect(chart.data).toHaveLength(10);
    const bands = within(within(histogram).getByRole('list', { name: 'Faixas de qualidade de A a E' })).getAllByRole(
      'listitem'
    );
    expect(bands.map((band) => band.textContent)).toEqual([
      'E · Muito ruim',
      'D · Ruim',
      'C · Bom',
      'B · Muito bom',
      'A · Ótimo'
    ]);
  });

  it('numa métrica, o eixo segue a escala dela, sem a régua (CA4)', () => {
    render(<DistributionDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Métrica' }));

    const histogram = screen.getByRole('region', { name: 'Histograma' });
    const chart = JSON.parse(within(histogram).getByTestId('echarts').textContent ?? '{}');
    expect(chart.xAxis).toMatchObject({ min: 40, max: 65, interval: 5 });
    expect(within(histogram).queryByRole('list')).not.toBeInTheDocument();
    expect(histogram).toHaveTextContent('Quantas análises caem em cada faixa de 5 de sum_ci_feedback_times');
  });

  it('põe o histograma, a densidade, o boxplot, a dispersão e o resumo nas posições da grade da referência', () => {
    render(<DistributionDashboard />);

    const grid = screen.getByTestId('distribution-grid');
    // na ordem da grade, sem cartão vazio
    expect(within(grid).getAllByRole('region')).toEqual(
      [
        'Histograma',
        'Curva de densidade',
        'Boxplot e percentis do nível',
        'Dispersão das análises no tempo',
        'Resumo estatístico e IQR'
      ].map((name) => within(grid).getByRole('region', { name }))
    );
  });

  it('desenha no boxplot a entidade e os filhos que vêm na resposta (CA6)', () => {
    render(<DistributionDashboard />);

    const boxplot = screen.getByRole('region', { name: 'Boxplot e percentis do nível' });
    expect(
      within(boxplot)
        .getAllByTestId('percentile-row')
        .map((row) => row.firstElementChild?.textContent)
    ).toEqual(['TSQMI', 'Reliability']);
  });

  it('ao trocar de entidade, mantém os quadros anteriores enquanto a resposta nova não chega', () => {
    render(<DistributionDashboard />);
    const scatter = () => screen.getByRole('region', { name: 'Dispersão das análises no tempo' });
    const before = within(scatter()).getByTestId('echarts').textContent;
    // com o keepPreviousData, o pedido da característica devolve a resposta do TSQMI até a nova chegar
    mockRequests({ respond: (params) => answer({ ...params, level: 'tsqmi', key: 'tsqmi' }) });

    fireEvent.click(screen.getByRole('button', { name: 'Característica' }));

    expect(screen.getByTestId('distribution-grid')).toHaveAttribute('aria-busy', 'true');
    expect(within(scatter()).getByTestId('echarts').textContent).toBe(before);
    expect(
      within(screen.getByRole('region', { name: 'Curva de densidade' })).getByTestId('echarts')
    ).toBeInTheDocument();
    expect(screen.queryByText('Carregando')).not.toBeInTheDocument();
  });

  it('com poucas análises, a densidade explica que faltam análises e os outros quadros continuam (CA9)', () => {
    mockRequests({
      respond: (params) => ({
        data: distribution({
          repositoryId: params.repository_id,
          main: entity('tsqmi', 'TSQMI', 'tsqmi', [0.5, 0.6])
        })
      })
    });
    render(<DistributionDashboard />);

    expect(screen.getByRole('region', { name: 'Curva de densidade' })).toHaveTextContent(
      'Faltam análises para a curva de densidade'
    );
    expect(within(screen.getByRole('region', { name: 'Histograma' })).getByTestId('echarts')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Resumo estatístico e IQR' })).toBeInTheDocument();
  });

  it('produto sem release orienta a planejar a primeira (CA9)', () => {
    mockRequests({ releasesData: { results: [] } });
    render(<DistributionDashboard />);

    expect(screen.getByText('Este produto ainda não tem release')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Planejar release' }));
    expect(push).toHaveBeenCalledWith('/products/1-2-Produto/releases/create');
  });

  it('repositório sem análise na release orienta a configurar a coleta (CA9)', () => {
    mockRequests({
      respond: (params) => ({
        data: distribution({ repositoryId: params.repository_id, main: entity('tsqmi', 'TSQMI', 'tsqmi', []) })
      })
    });
    render(<DistributionDashboard />);

    expect(
      screen.getByText('O repositório MeasureSoftGram-Service não tem análises de TSQMI na release R2')
    ).toBeInTheDocument();
    expect(screen.getByText(/roda no repositório entre 17\/08 e 16\/10, o período da release/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver como configurar a coleta' })).toBeInTheDocument();
    expect(screen.queryByTestId('distribution-period')).not.toBeInTheDocument();
  });

  it('com falha, mostra "Tentar novamente" sem detalhes técnicos (CA9)', () => {
    mockRequests({ respond: () => ({ error: new Error('Request failed with status code 400') }) });
    render(<DistributionDashboard />);

    expect(screen.getByText('Não foi possível carregar a distribuição')).toBeInTheDocument();
    expect(screen.queryByText(/status code/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(mutate).toHaveBeenCalled();
  });

  it('enquanto carrega, mostra os esqueletos nas posições da grade', () => {
    mockRequests({ respond: () => ({}) });
    render(<DistributionDashboard />);

    const grid = screen.getByTestId('distribution-grid');
    expect(within(grid).getByRole('region', { name: 'Histograma' })).toHaveTextContent('Carregando');
    expect(within(grid).getByRole('region', { name: 'Curva de densidade' })).toHaveTextContent('Carregando');
    expect(within(grid).getByRole('region', { name: 'Dispersão das análises no tempo' })).toHaveTextContent(
      'Carregando'
    );
    expect(within(grid).getByRole('region', { name: 'Resumo estatístico e IQR' })).toHaveTextContent('Carregando');
  });
});
