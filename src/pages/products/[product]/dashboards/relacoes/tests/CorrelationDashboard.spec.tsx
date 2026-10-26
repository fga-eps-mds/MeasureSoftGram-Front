import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRequest } from '@hooks/useRequest';
import { CorrelationLevel } from '@customTypes/product';
import { downloadCsv, downloadCsvZip } from '@utils/exportCsv';
import CorrelationDashboard from '../CorrelationDashboard';
import { correlation, repositories } from './fixtures';

type ChartOption = { aria: { label: { description: string } } };
type Params = { repository_id?: number; level?: CorrelationLevel };
type Request = { url: string; params?: Params } | null;
type Response = { data?: unknown; error?: Error; isLoading?: boolean };

const push = jest.fn();
const mutate = jest.fn();

jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto' }, push }) }));
jest.mock('@components/Layout', () => ({ __esModule: true, default: (page: React.ReactNode) => page }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
jest.mock('@utils/exportCsv', () => ({ downloadCsv: jest.fn(), downloadCsvZip: jest.fn() }));
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
// o ECharts não roda no jsdom: o mock mostra o texto acessível que o gráfico receberia
jest.mock('next/dynamic', () => () => ({ option }: { option: ChartOption }) => (
  <div data-testid="echarts">{option.aria.label.description}</div>
));

function answer(params: Params): Response {
  return { data: correlation({ repositoryId: params.repository_id, level: params.level }) };
}

function mockRequests({ respond = answer }: { respond?: typeof answer } = {}) {
  (useRequest as jest.Mock).mockImplementation((request: Request) => {
    const result = (response: Response) => ({ isLoading: false, mutate, ...response });
    if (!request) return result({});
    if (request.url.endsWith('/repositories/')) return result({ data: { results: repositories } });
    return result(respond(request.params ?? {}));
  });
}

function choose(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }));
}

describe('<CorrelationDashboard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequests();
  });

  it('mostra o título, a frase com o repositório e a linha das releases (CA1 e CA3)', () => {
    render(<CorrelationDashboard />);

    expect(screen.getByRole('heading', { name: '6. Relações e Correlações' })).toBeInTheDocument();
    expect(screen.getByTestId('correlation-subtitle')).toHaveTextContent(
      'Como as características de MeasureSoftGram-Service variam juntas ao longo das releases'
    );
    expect(screen.getByTestId('correlation-info')).toHaveTextContent(
      '20 releases de MeasureSoftGram-Service · 3 características · coeficiente aplicado: Spearman (distribuição não normal em 3 de 3 características)'
    );
  });

  it('tem os seletores de repositório e de nível (CA2)', () => {
    render(<CorrelationDashboard />);

    expect(screen.getByRole('combobox', { name: 'Repositório' })).toHaveTextContent('MeasureSoftGram-Service');
    const levels = within(screen.getByRole('group', { name: 'Nível do modelo' })).getAllByRole('button');
    expect(levels.map((button) => button.textContent)).toEqual(['Característica', 'Subcaracterística']);
  });

  it('a escolha de repositório e de nível atualiza as duas matrizes', () => {
    render(<CorrelationDashboard />);

    choose('Repositório', 'MeasureSoftGram-Front');
    fireEvent.click(screen.getByRole('button', { name: 'Subcaracterística' }));

    expect(screen.getByTestId('correlation-subtitle')).toHaveTextContent(
      'Como as subcaracterísticas de MeasureSoftGram-Front variam juntas'
    );
    expect(screen.getByText('Matriz de correlação das subcaracterísticas')).toBeInTheDocument();
    screen.getAllByTestId('echarts').forEach((chart) => {
      expect(chart).toHaveTextContent('subcaracterísticas de MeasureSoftGram-Front');
    });
  });

  it('desenha a matriz de correlação com as notas da legenda (CA4)', () => {
    render(<CorrelationDashboard />);

    const [matrix] = screen.getAllByTestId('echarts');
    expect(matrix).toHaveTextContent('Matriz de correlação de Spearman entre 3 características');
    expect(screen.getByText('Azul: movem-se juntas · Laranja: movem-se em sentidos opostos')).toBeInTheDocument();
    expect(screen.getByText('Itálico e opaco: não significativo (|r| < 0,44, p < 0,05, n = 20)')).toBeInTheDocument();
    expect(screen.getByText(/Coeficiente aplicado: Spearman\. Regra do modelo/)).toBeInTheDocument();
  });

  it('desenha a matriz de bolhas com a legenda de cores e de tamanhos (CA5)', () => {
    render(<CorrelationDashboard />);

    const [, bubbles] = screen.getAllByTestId('echarts');
    expect(bubbles).toHaveTextContent('Matriz de bolhas de Spearman');
    ['Positiva', 'Negativa', 'Não tem relação', 'Tamanho = |r|:', '0,25', '1,00'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('exporta cada matriz em CSV e as duas num .zip, com os filtros da tela (CA7)', async () => {
    render(<CorrelationDashboard />);
    choose('Repositório', 'MeasureSoftGram-Front');
    fireEvent.click(screen.getByRole('button', { name: 'Subcaracterística' }));

    screen.getAllByRole('button', { name: 'Exportar .csv' }).forEach((button) => fireEvent.click(button));
    fireEvent.click(screen.getByRole('button', { name: 'Exportar todos (.zip)' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Exportar todos (.zip)' })).toBeEnabled());

    const charts = (downloadCsv as jest.Mock).mock.calls.map(([dashboard, chart]) => [dashboard, chart.name]);
    expect(charts).toEqual([
      ['relacoes', 'matriz-correlacao'],
      ['relacoes', 'matriz-bolhas']
    ]);
    const [dashboard, zipCharts] = (downloadCsvZip as jest.Mock).mock.calls[0];
    expect(dashboard).toBe('relacoes');
    expect(zipCharts.map((chart: { name: string }) => chart.name)).toEqual(['matriz-correlacao', 'matriz-bolhas']);
    expect(zipCharts[0].rows[0]).toMatchObject({
      repository: 'MeasureSoftGram-Front',
      level: 'Subcaracterística',
      coefficient: 0.559
    });
  });

  it('com 1 ou 2 releases com valor, explica que faltam releases (CA9)', () => {
    const [first, second] = correlation().releases;
    mockRequests({
      respond: () => ({ data: correlation({ releases: [first, second], reason: 'insufficient_releases', pairs: [] }) })
    });

    render(<CorrelationDashboard />);

    expect(screen.getByText('Faltam releases para calcular a correlação')).toBeInTheDocument();
    expect(
      screen.getByText(
        /pelo menos 3 releases com valor para todas as características, e o repositório MeasureSoftGram-Service tem 2 releases/
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId('correlation-info')).not.toBeInTheDocument();
  });

  it('repositório sem análise mostra a orientação da coleta (CA9)', () => {
    mockRequests({
      respond: () => ({ data: correlation({ releases: [], excluded_releases: 3, reason: 'insufficient_releases' }) })
    });

    render(<CorrelationDashboard />);

    expect(
      screen.getByText('O repositório MeasureSoftGram-Service não tem análises nas releases do produto')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver como configurar a coleta' })).toBeInTheDocument();
  });

  it('produto sem release leva ao planejamento da release (CA9)', () => {
    mockRequests({
      respond: () => ({ data: correlation({ releases: [], excluded_releases: 0, reason: 'insufficient_entities' }) })
    });

    render(<CorrelationDashboard />);

    expect(screen.getByText('Este produto ainda não tem release')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Planejar release' }));
    expect(push).toHaveBeenCalledWith('/products/1-2-Produto/releases/create');
  });

  it('com falha, mostra "Tentar novamente" sem detalhes técnicos (CA9)', () => {
    mockRequests({ respond: () => ({ error: new Error('Request failed with status code 500') }) });

    render(<CorrelationDashboard />);

    expect(screen.getByText('Não foi possível carregar as correlações')).toBeInTheDocument();
    expect(screen.queryByText(/500/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(mutate).toHaveBeenCalled();
  });

  it('enquanto carrega, mostra o esqueleto das duas matrizes', () => {
    mockRequests({ respond: () => ({ isLoading: true }) });

    render(<CorrelationDashboard />);

    expect(screen.getAllByText('Carregando')).toHaveLength(2);
    expect(screen.queryByTestId('echarts')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar todos (.zip)' })).toBeDisabled();
  });
});
