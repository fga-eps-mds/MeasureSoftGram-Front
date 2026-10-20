import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { EntityAnalysis } from '@customTypes/product';
import EntityAnalysisDashboard from '../EntityAnalysisDashboard';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ query: { product: '1-2-Produto' }, push: mockPush }),
}));
jest.mock('@components/Layout', () => ({ __esModule: true, default: (page: React.ReactNode) => page }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({ terms: { repository: 'repositório', repositories: 'repositórios' } }),
}));

// O ECharts não desenha no jsdom: o mock expõe um botão por barra que dispara o clique do gráfico.
jest.mock('next/dynamic', () => () => {
  function MockECharts({ option, onEvents }: any) {
    return (
      <div data-testid="echarts-mock">
        {option.series[0].data.map((item: any, index: number) => (
          <button
            type="button"
            key={item.repositoryId}
            onClick={() => onEvents.click({ data: item })}
          >
            {`barra ${option.yAxis.data[index]}`}
          </button>
        ))}
      </div>
    );
  }
  return MockECharts;
});

const mockUseEntityAnalysis = jest.fn();
jest.mock('../useEntityAnalysis', () => ({
  useEntityAnalysis: (...args: unknown[]) => mockUseEntityAnalysis(...args),
}));

const analysis: EntityAnalysis = {
  release: { id: 10, release_name: 'v1.0', start_at: '2026-03-01', end_at: '2026-03-31' },
  level: 'characteristic',
  entity: { key: 'maintainability', name: 'Maintainability' },
  reference: { goal: 0.6 },
  repositories: [
    {
      id: 1,
      name: 'api',
      value: 0.8,
      created_at: '2026-03-20',
      children: [{ key: 'modifiability', name: 'Modifiability', weight: 100, value: 0.8, created_at: '2026-03-20' }],
    },
    {
      id: 2,
      name: 'parser',
      value: 0.3,
      created_at: '2026-03-10',
      children: [{ key: 'modifiability', name: 'Modifiability', weight: 100, value: null, created_at: null }],
    },
    { id: 3, name: 'web', value: null, created_at: null, children: [] },
  ],
};

const hookState = (overrides = {}) => ({
  releases: [{ id: 10, release_name: 'v1.0', start_at: '2026-03-01', end_at: '2026-03-31' }],
  releaseId: 10,
  currentReleaseId: 10,
  setReleaseId: jest.fn(),
  level: 'characteristic',
  setLevel: jest.fn(),
  entities: [{ key: 'maintainability', name: 'Maintainability' }],
  entityKey: 'maintainability',
  setEntityKey: jest.fn(),
  analysis,
  hasNoEntities: false,
  isLoadingReleases: false,
  isLoading: false,
  error: undefined,
  retry: jest.fn(),
  ...overrides,
});

describe('<EntityAnalysisDashboard />', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUseEntityAnalysis.mockReturnValue(hookState());
  });

  it('lê a organização e o produto da rota', () => {
    render(<EntityAnalysisDashboard />);

    expect(mockUseEntityAnalysis).toHaveBeenCalledWith('1', '2');
  });

  it('mostra os seletores de release, nível e entidade', () => {
    render(<EntityAnalysisDashboard />);

    expect(screen.getByRole('combobox', { name: 'Release' }).textContent).toBe('v1.0 (atual)');
    expect(screen.getByRole('combobox', { name: 'Nível' }).textContent).toBe('Característica');
    expect(screen.getByRole('combobox', { name: 'Entidade' }).textContent).toBe('Maintainability');
  });

  it('desenha uma barra por repositório, do pior para o melhor, com os sem dado no fim', () => {
    render(<EntityAnalysisDashboard />);

    const bars = within(screen.getByTestId('echarts-mock')).getAllByRole('button');
    // o eixo de categorias desenha de baixo para cima: a ordem visual é a inversa
    expect(bars.map((bar) => bar.textContent).reverse()).toEqual(['barra parser', 'barra api', 'barra web']);
  });

  it('mostra a meta da release e permite esconder a referência', () => {
    render(<EntityAnalysisDashboard />);

    expect(screen.getByTestId('entity-reference').textContent).toBe('Meta planejada da release: 0.60');

    fireEvent.click(screen.getByLabelText('Mostrar meta e faixa de referência'));

    expect(screen.queryByTestId('entity-reference')).toBeNull();
  });

  it('abre a decomposição do repositório ao clicar na barra e fecha no botão', () => {
    render(<EntityAnalysisDashboard />);

    fireEvent.click(screen.getByText('barra parser'));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Maintainability em parser')).toBeTruthy();
    expect(within(dialog).getByText('Subcaracterística')).toBeTruthy();
    expect(within(dialog).getByText('Modifiability')).toBeTruthy();
    expect(within(dialog).getByText('100%')).toBeTruthy();
    expect(within(dialog).getByText('sem dado')).toBeTruthy();

    fireEvent.click(within(dialog).getByText('Fechar'));

    expect(screen.queryByText('Maintainability em parser')).toBeNull();
  });

  it('orienta a criar uma release quando o produto não tem nenhuma', () => {
    mockUseEntityAnalysis.mockReturnValue(hookState({ releases: [], releaseId: undefined, analysis: undefined }));

    render(<EntityAnalysisDashboard />);

    expect(screen.getByText(/ainda não tem releases/)).toBeTruthy();
    fireEvent.click(screen.getByText('Ir para releases'));
    expect(mockPush).toHaveBeenCalledWith('/products/1-2-Produto/releases');
  });

  it('mostra estado vazio quando a release não tem análise', () => {
    const withoutValues = {
      ...analysis,
      repositories: analysis.repositories.map((repository) => ({ ...repository, value: null })),
    };
    mockUseEntityAnalysis.mockReturnValue(hookState({ analysis: withoutValues }));

    render(<EntityAnalysisDashboard />);

    expect(screen.getByText(/ainda não tem análise de Maintainability/)).toBeTruthy();
    expect(screen.queryByTestId('echarts-mock')).toBeNull();
  });

  it('mostra erro sem detalhes técnicos e tenta de novo', () => {
    const retry = jest.fn();
    mockUseEntityAnalysis.mockReturnValue(
      hookState({ analysis: undefined, error: new Error('Request failed with status code 500'), retry })
    );

    render(<EntityAnalysisDashboard />);

    expect(screen.getByText('Não foi possível carregar a análise por entidade.')).toBeTruthy();
    expect(screen.queryByText(/status code/)).toBeNull();
    fireEvent.click(screen.getByText('Tentar novamente'));
    expect(retry).toHaveBeenCalled();
  });

  it('mostra o carregamento enquanto a análise chega', () => {
    mockUseEntityAnalysis.mockReturnValue(hookState({ analysis: undefined, isLoading: true }));

    render(<EntityAnalysisDashboard />);

    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('explica quando a release não tem métricas com valor por repositório, sem ficar carregando', () => {
    mockUseEntityAnalysis.mockReturnValue(
      hookState({ level: 'metric', entities: [], entityKey: undefined, analysis: undefined, hasNoEntities: true })
    );

    render(<EntityAnalysisDashboard />);

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByText(/Nenhuma métrica da release v1.0 tem valor por repositório/)).toBeTruthy();
    expect(screen.getByText(/5. Distribuição das Métricas/)).toBeTruthy();
  });

  it('explica quando a configuração não tem entidades no nível', () => {
    mockUseEntityAnalysis.mockReturnValue(
      hookState({ level: 'measure', entities: [], entityKey: undefined, analysis: undefined, hasNoEntities: true })
    );

    render(<EntityAnalysisDashboard />);

    expect(screen.getByText(/A configuração da release v1.0 não tem nenhuma entidade no nível Medida/)).toBeTruthy();
  });
});
