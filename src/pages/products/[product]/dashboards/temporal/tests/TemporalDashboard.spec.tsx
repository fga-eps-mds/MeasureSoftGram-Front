import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import TemporalDashboard from '../TemporalDashboard';

jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto' } }) }));
jest.mock('@components/Layout', () => ({ __esModule: true, default: (page: React.ReactNode) => page }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({
    terms: { Repository: 'Repositório', repository: 'repositório', repositories: 'repositórios' },
  }),
}));
jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
jest.mock('@components/ECharts', () => ({
  __esModule: true,
  usePreloadECharts: jest.fn(),
  default: ({ option }: { option: { series: { name: string; data: unknown[] }[] } }) => (
    <div data-testid="echarts">{option.series.map((item) => `${item.name}:${item.data.length}`).join('|')}</div>
  ),
}));

type Branch = [key: string, name: string, children?: Branch[]];
const TYPES = ['tsqmi', 'characteristic', 'subcharacteristic', 'measure', 'metric'];
const node = (depth: number, [key, name, children = []]: Branch): unknown => ({
  id: null,
  type: TYPES[depth],
  key,
  name,
  description: null,
  weight: 1,
  children: children.map((child) => node(depth + 1, child)),
});

const tree = [
  node(0, [
    'tsqmi',
    'TSQMI',
    [
      [
        'reliability',
        'Reliability',
        [
          [
            'testing_status',
            'Testing Status',
            [
              ['passed_tests', 'Passed Tests', [['tests', 'tests']]],
              ['test_coverage', 'Test Coverage', [['coverage', 'coverage']]],
            ],
          ],
          ['maturity', 'Maturity', [['ci_feedback_time', 'CI Feedback Time', [['ci_time', 'ci_time']]]]],
        ],
      ],
      ['maintainability', 'Maintainability', [['modifiability', 'Modifiability', [['non_complex_file_density', 'Non Complex File Density']]]]],
    ],
  ]),
];

const record = (value: number, createdAt: string) => ({ value, created_at: createdAt });
const entity = (key: string, history: ReturnType<typeof record>[]) => ({ id: 1, key, name: key, history });

const histories: Record<string, unknown> = {
  characteristics: {
    results: [
      entity('reliability', [record(0.5, '2026-03-01T10:00:00'), record(0.6, '2026-03-05T10:00:00')]),
      entity('maintainability', [record(0.7, '2026-03-01T10:00:00')]),
    ],
  },
  subcharacteristics: {
    results: [
      entity('testing_status', [record(0.4, '2026-03-01T10:00:00')]),
      entity('maturity', [record(0.9, '2026-03-01T10:00:00')]),
      entity('modifiability', [record(0.8, '2026-03-01T10:00:00')]),
    ],
  },
  measures: {
    results: [
      entity('passed_tests', [record(0.4, '2026-03-01T10:00:00')]),
      entity('test_coverage', [record(0.5, '2026-03-01T10:00:00')]),
      entity('ci_feedback_time', [record(0.9, '2026-03-01T10:00:00')]),
    ],
  },
  // coverage só tem valores por arquivo: com qualifier=TRK, o histórico vem vazio
  metrics: {
    results: [
      entity('tests', [record(120, '2026-03-01T10:00:00')]),
      entity('coverage', []),
      entity('ci_time', [record(300, '2026-03-01T10:00:00')]),
    ],
  },
};

const repositories = [
  { id: 7, name: 'api' },
  { id: 9, name: 'web' },
];

type Request = { url: string; params?: Record<string, string> } | null;
let responses: (request: NonNullable<Request>) => { data?: unknown; error?: unknown; isLoading?: boolean };
const mutate = jest.fn();

function defaultResponse(request: NonNullable<Request>) {
  if (request.url.endsWith('/repositories/')) return { data: { results: repositories } };
  if (request.url.endsWith('/quality-model-tree/')) return { data: tree };
  const level = request.url.match(/historical-values\/(\w+)\//)?.[1];
  return { data: level ? histories[level] : undefined };
}

const chart = (title: string) => within(screen.getByRole('region', { name: title }));
const chooseOption = (label: string, option: string) => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(within(screen.getByRole('listbox')).getByText(option));
};
const closeMenu = () => fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });

describe('<TemporalDashboard />', () => {
  beforeEach(() => {
    responses = defaultResponse;
    mutate.mockReset();
    (useRequest as jest.Mock).mockImplementation((request: Request) =>
      request ? { isLoading: false, mutate, ...responses(request) } : { isLoading: false, mutate }
    );
  });

  it('desenha os quatro gráficos, um abaixo do outro, com a primeira característica e todas as filhas dela', () => {
    render(<TemporalDashboard />);

    expect(chart('Característica').getByTestId('echarts').textContent).toBe('Reliability:2');
    expect(chart('Subcaracterísticas').getByTestId('echarts').textContent).toBe('Testing Status:1|Maturity:1');
    expect(chart('Medidas').getByTestId('echarts').textContent).toBe(
      'Passed Tests:1|Test Coverage:1|CI Feedback Time:1'
    );
    expect(chart('Métricas').getByTestId('echarts').textContent).toBe('tests:1|ci_time:1');
    expect(useRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/v1/organizations/1/products/2/repositories/7/historical-values/metrics/',
        params: { qualifier: 'TRK' },
      })
    );
  });

  it('só oferece no nível métrica as métricas com valor do repositório inteiro', () => {
    render(<TemporalDashboard />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Métrica' }));
    const options = within(screen.getByRole('listbox'));
    expect(options.getByText('tests')).toBeTruthy();
    expect(options.queryByText('coverage')).toBeNull();
  });

  it('filtra cada nível pelo que foi escolhido no anterior', () => {
    render(<TemporalDashboard />);

    chooseOption('Subcaracterística', 'Maturity');
    closeMenu();

    expect(chart('Subcaracterísticas').getByTestId('echarts').textContent).toBe('Maturity:1');
    expect(chart('Medidas').getByTestId('echarts').textContent).toBe('CI Feedback Time:1');
    expect(chart('Métricas').getByTestId('echarts').textContent).toBe('ci_time:1');

    chooseOption('Medida', 'Todas');
    closeMenu();
    expect(chart('Medidas').getByTestId('echarts').textContent).toBe('CI Feedback Time:1');
  });

  it('troca as opções dos níveis seguintes ao mudar a característica', () => {
    render(<TemporalDashboard />);

    chooseOption('Subcaracterística', 'Maturity');
    closeMenu();
    chooseOption('Característica', 'Maintainability');

    // a subcaracterística escolhida não é filha da nova característica: o filtro volta para "Todas"
    expect(chart('Característica').getByTestId('echarts').textContent).toBe('Maintainability:1');
    expect(chart('Subcaracterísticas').getByTestId('echarts').textContent).toBe('Modifiability:1');
    expect(screen.getByRole('combobox', { name: 'Subcaracterística' }).textContent).toContain('Todas');
    expect(chart('Métricas').getByText(/não têm métricas do repositório inteiro/)).toBeTruthy();
  });

  it('mostra o eixo em dias e troca para meses', () => {
    render(<TemporalDashboard />);

    expect(screen.getByRole('button', { name: 'Dias', pressed: true })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Meses' }));

    // as duas análises de março viram um ponto só
    expect(chart('Característica').getByTestId('echarts').textContent).toBe('Reliability:1');
  });

  it('busca os históricos do repositório escolhido', () => {
    render(<TemporalDashboard />);

    chooseOption('Repositório', 'web');

    expect(useRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: '/v1/organizations/1/products/2/repositories/9/historical-values/metrics/' })
    );
  });

  it('mostra o carregamento de cada gráfico', () => {
    responses = (request) =>
      request.url.includes('historical-values/measures') ? { isLoading: true } : defaultResponse(request);

    render(<TemporalDashboard />);

    expect(chart('Medidas').getByText('Carregando a evolução das medidas…')).toBeTruthy();
    expect(chart('Característica').getByTestId('echarts')).toBeTruthy();
  });

  it('mostra o erro com "Tentar novamente"', () => {
    responses = (request) =>
      request.url.includes('historical-values/subcharacteristics')
        ? { error: new Error('500') }
        : defaultResponse(request);

    render(<TemporalDashboard />);

    expect(chart('Subcaracterísticas').getByText('Não foi possível carregar a evolução das subcaracterísticas')).toBeTruthy();
    fireEvent.click(chart('Subcaracterísticas').getByRole('button', { name: 'Tentar novamente' }));
    expect(mutate).toHaveBeenCalled();
  });

  it('explica o que fazer quando o repositório ainda não tem análises', () => {
    responses = (request) =>
      request.url.includes('historical-values') ? { data: { results: [] } } : defaultResponse(request);

    render(<TemporalDashboard />);

    expect(chart('Característica').getByText('Ainda não há valores desta característica neste repositório')).toBeTruthy();
    expect(chart('Medidas').getAllByText(/depois que a Action do MeasureSoftGram analisa o repositório/)).toBeTruthy();
  });

  it('mostra estado vazio quando o produto não tem repositórios', () => {
    responses = (request) =>
      request.url.endsWith('/repositories/') ? { data: { results: [] } } : defaultResponse(request);

    render(<TemporalDashboard />);

    expect(screen.getByText('Este produto ainda não tem repositórios')).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Característica' })).toBeNull();
  });
});
