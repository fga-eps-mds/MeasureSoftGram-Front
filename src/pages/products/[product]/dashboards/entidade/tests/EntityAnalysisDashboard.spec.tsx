import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { downloadCsv, downloadCsvZip } from '@utils/exportCsv';
import EntityAnalysisDashboard from '../EntityAnalysisDashboard';
import { measureMatrix, repository } from './fixtures';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ query: { product: '1-2-Produto' }, push: mockPush })
}));
jest.mock('@components/Layout', () => ({ __esModule: true, default: (page: React.ReactNode) => page }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({ terms: { repository: 'repositório', repositories: 'repositórios' } })
}));
// a composição da célula é pedida pelo diálogo
jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
jest.mock('@utils/exportCsv', () => ({ downloadCsv: jest.fn(), downloadCsvZip: jest.fn() }));

const mockUseEntityAnalysis = jest.fn();
jest.mock('../useEntityAnalysis', () => ({
  useEntityAnalysis: (...args: unknown[]) => mockUseEntityAnalysis(...args)
}));

const releases = [
  { id: 2, release_name: 'R2', start_at: '2026-03-01', end_at: '2026-03-31' },
  { id: 1, release_name: 'R1', start_at: '2026-02-01', end_at: '2026-02-28' }
];

const hookState = (overrides = {}) => ({
  organizationId: '1',
  productId: '2',
  releases,
  releaseId: 2,
  currentReleaseId: 2,
  setReleaseId: jest.fn(),
  level: 'measure',
  setLevel: jest.fn(),
  matrix: measureMatrix(),
  isLoadingReleases: false,
  isLoading: false,
  error: undefined,
  retry: jest.fn(),
  ...overrides
});

const heatmap = () => screen.getByRole('table', { name: 'Mapa de calor' });
const card = (name: string) => screen.getByRole('region', { name });
const HEATMAP = 'Mapa de calor: repositório × medida';
const CONTRIBUTION = 'O que puxa a qualidade total para baixo';
const RANKING = 'Ranking dos piores pares';
const exportButton = (name: string) => within(card(name)).getByRole('button', { name: 'Exportar .csv' });
const exportAllButton = () => screen.getByRole('button', { name: 'Exportar todos (.zip)' }) as HTMLButtonElement;
/** Clica no .zip e espera ele terminar de gerar (o botão fica "Exportando…" enquanto isso). */
async function exportAll() {
  fireEvent.click(exportAllButton());
  await waitFor(() => expect(exportAllButton().disabled).toBe(false));
}
const zipCharts = () => (downloadCsvZip as jest.Mock).mock.calls.at(-1)[1];

describe('<EntityAnalysisDashboard />', () => {
  beforeEach(() => {
    mockPush.mockClear();
    (downloadCsv as jest.Mock).mockClear();
    (downloadCsvZip as jest.Mock).mockClear();
    mockUseEntityAnalysis.mockReturnValue(hookState());
    (useRequest as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, mutate: jest.fn() });
  });

  it('mostra as abas de nível e o caminho na hierarquia', () => {
    render(<EntityAnalysisDashboard />);

    expect(screen.getByRole('heading', { name: '4. Análise por Entidade' })).toBeTruthy();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Característica',
      'Subcaracterística',
      'Medida'
    ]);
    expect(screen.getByRole('tab', { name: 'Medida' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.queryByRole('tab', { name: 'Métrica' })).toBeNull();
    expect(screen.getByTestId('entity-level-path').textContent).toBe(
      'TSQMI › todas as características › todas as subcaracterísticas › medidas'
    );
  });

  it('troca de nível pelas abas', () => {
    const setLevel = jest.fn();
    mockUseEntityAnalysis.mockReturnValue(hookState({ setLevel }));
    render(<EntityAnalysisDashboard />);

    fireEvent.click(screen.getByRole('tab', { name: 'Característica' }));

    expect(setLevel).toHaveBeenCalledWith('characteristic');
  });

  it('agrupa as colunas pelas entidades de cima, com o peso', () => {
    render(<EntityAnalysisDashboard />);

    const groups = within(heatmap())
      .getAllByRole('columnheader')
      .filter((header) => header.getAttribute('scope') === 'colgroup')
      .map((header) => [header.textContent, header.getAttribute('colspan')]);
    // o peso fica colado ao nome por espaços não separáveis
    expect(groups).toEqual([
      ['Reliability\u00A0·\u00A034%', '3'],
      ['Maintainability\u00A0·\u00A033%', '1'],
      ['Testing Status\u00A0·\u00A050%', '2'],
      ['Maturity\u00A0·\u00A050%', '1'],
      ['Modifiability\u00A0·\u00A0100%', '1']
    ]);
    expect(within(heatmap()).getByRole('columnheader', { name: 'TSQMI · Δ' })).toBeTruthy();
    // os nomes das releases ficam no texto, e não no cabeçalho
    expect(
      within(card('Mapa de calor: repositório × medida')).getByText(
        /Δ é a variação em relação à release anterior, R1\./
      )
    ).toBeTruthy();
  });

  it('ordena as linhas do pior para o melhor TSQMI e mostra o TSQMI com o grau e a variação', () => {
    render(<EntityAnalysisDashboard />);

    expect(
      within(heatmap())
        .getAllByRole('rowheader')
        .map((row) => row.textContent)
    ).toEqual(['AI', 'Front', 'Service']);
    expect(screen.getByTestId('tsqmi-2').textContent).toBe('0,41C · −0,09');
  });

  it('pinta a célula com o valor e o grau e mostra "sem dado" sem valor', () => {
    render(<EntityAnalysisDashboard />);

    const cell = screen.getByRole('button', { name: /^AI · Test Coverage: 0,18 \(E, Muito ruim\)/ });
    expect(cell.textContent).toBe('0,18E');
    expect(screen.getByRole('button', { name: 'Front · CI Feedback Time: sem dado' }).textContent).toBe('sem dado');
    expect(screen.getByTestId('quality-grade-legend').textContent).toContain('[0,80; 1,00] Ótimo');
  });

  it('quebra a chave da entidade no "_" do cabeçalho', () => {
    render(<EntityAnalysisDashboard />);

    const key = within(heatmap()).getByText(
      (_, element) => element?.textContent === 'commented_file_density' && element.tagName === 'P'
    );
    expect(key.querySelectorAll('wbr')).toHaveLength(2);
  });

  it('destaca as 3 células que mais puxaram o TSQMI para baixo', () => {
    render(<EntityAnalysisDashboard />);

    const highlighted = within(heatmap())
      .getAllByRole('button')
      .filter((button) => button.dataset.highlighted)
      .map((button) => button.getAttribute('aria-label')?.split(':')[0]);
    expect(highlighted).toEqual(['AI · Test Coverage', 'AI · Commented File Density', 'Front · Test Coverage']);
  });

  it('escreve a leitura com a entidade mais fraca e a de maior dispersão', () => {
    render(<EntityAnalysisDashboard />);

    expect(screen.getByTestId('entity-reading').textContent).toBe(
      'Leitura: Commented File Density é a medida mais fraca do produto (média 0,34). Test Coverage tem a maior ' +
        'dispersão entre os repositórios: de 0,18 (AI) a 0,81 (Service).'
    );
  });

  it('desenha as contribuições da maior piora para a maior melhora', () => {
    render(<EntityAnalysisDashboard />);

    const rows = within(card('O que puxa a qualidade total para baixo')).getAllByTestId('contribution-row');
    expect(rows[0].textContent).toBe('Fronttest_coverage−0,021');
    expect(rows[rows.length - 1].textContent).toBe('AIpassed_tests+0,005');
  });

  it('explica que a primeira release não tem com o que comparar', () => {
    const matrix = measureMatrix({
      previous_release: null,
      repositories: [
        repository(1, 'api', [0.6, null], {
          passed_tests: [0.9, null, null],
          test_coverage: [0.4, null, null]
        })
      ]
    });
    mockUseEntityAnalysis.mockReturnValue(hookState({ matrix }));

    render(<EntityAnalysisDashboard />);

    expect(
      within(card('O que puxa a qualidade total para baixo')).getByText('R2 é a primeira release do produto')
    ).toBeTruthy();
    expect(screen.getByTestId('tsqmi-1').textContent).toBe('0,60B · —');
    expect(within(heatmap()).getByRole('columnheader', { name: 'TSQMI' })).toBeTruthy();
    expect(within(card('Ranking dos piores pares')).getAllByRole('row')[1].textContent).toBe(
      '1apitest_coverage0,40 C—'
    );
  });

  it('ranqueia os piores pares com o grau e a variação', () => {
    render(<EntityAnalysisDashboard />);

    const ranking = card('Ranking dos piores pares');
    expect(within(ranking).getByText('Nível: Medida')).toBeTruthy();
    const rows = within(ranking).getAllByRole('row').slice(1);
    expect(rows[0].textContent).toBe('1AItest_coverage0,18 E−0,29');
    expect(rows[1].textContent).toBe('2Frontcommented_file_density0,22 D−0,02');
    expect(rows).toHaveLength(10);
  });

  it('abre a composição da entidade ao clicar numa célula', () => {
    (useRequest as jest.Mock).mockImplementation((request) => ({
      data: request && {
        repositories: [
          {
            id: 2,
            name: 'AI',
            children: [{ key: 'coverage', name: 'Coverage', weight: null, value: 18.5, created_at: '2026-03-10' }]
          }
        ]
      },
      isLoading: false,
      mutate: jest.fn()
    }));
    render(<EntityAnalysisDashboard />);

    fireEvent.click(screen.getByRole('button', { name: /^AI · Test Coverage/ }));

    expect((useRequest as jest.Mock).mock.calls.at(-1)[0]).toEqual({
      url: '/v1/organizations/1/products/2/entity-analysis/',
      method: 'get',
      params: { release_id: 2, level: 'measure', key: 'test_coverage' }
    });
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Test Coverage em AI')).toBeTruthy();
    expect(within(dialog).getByText('Valor: 0,18 (E, Muito ruim)')).toBeTruthy();
    expect(within(dialog).getByRole('row', { name: 'Coverage — 18.50' })).toBeTruthy();
  });

  it('mostra o erro sem detalhes técnicos, com "Tentar novamente"', () => {
    const retry = jest.fn();
    mockUseEntityAnalysis.mockReturnValue(hookState({ error: new Error('500'), matrix: undefined, retry }));
    render(<EntityAnalysisDashboard />);

    expect(screen.getByText('Não foi possível carregar a análise por entidade')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalled();
  });

  it('orienta a criar uma release quando o produto não tem nenhuma', () => {
    mockUseEntityAnalysis.mockReturnValue(hookState({ releases: [], releaseId: undefined, matrix: undefined }));
    render(<EntityAnalysisDashboard />);

    expect(screen.getByText('Este produto ainda não tem release')).toBeTruthy();
    expect(screen.queryByRole('tab')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Planejar release' }));
    expect(mockPush).toHaveBeenCalledWith('/products/1-2-Produto/releases/create');
  });

  it('mostra o carregamento enquanto o mapa não chega', () => {
    mockUseEntityAnalysis.mockReturnValue(hookState({ isLoading: true, matrix: undefined }));
    render(<EntityAnalysisDashboard />);

    expect(within(card('Mapa de calor: repositório × medida')).getByText('Carregando')).toBeTruthy();
  });

  it('orienta quando a release ainda não tem análises', () => {
    const matrix = measureMatrix({ repositories: [repository(1, 'api', [null, null], {})] });
    mockUseEntityAnalysis.mockReturnValue(hookState({ matrix }));
    render(<EntityAnalysisDashboard />);

    expect(screen.getByText('A release R2 ainda não tem análises')).toBeTruthy();
    expect(screen.queryByRole('table', { name: 'Mapa de calor' })).toBeNull();
  });

  it('avisa quando a configuração da release não tem entidades no nível', () => {
    mockUseEntityAnalysis.mockReturnValue(hookState({ matrix: measureMatrix({ columns: [] }) }));
    render(<EntityAnalysisDashboard />);

    expect(screen.getByText('A configuração da release R2 não tem nenhuma entidade no nível medida')).toBeTruthy();
  });

  describe('exportação de CSV', () => {
    it('exporta o CSV de cada quadro pelo botão do cabeçalho', () => {
      render(<EntityAnalysisDashboard />);

      [HEATMAP, CONTRIBUTION, RANKING].forEach((name) => fireEvent.click(exportButton(name)));

      const exported = (downloadCsv as jest.Mock).mock.calls.map(([dashboard, chart]) => [
        dashboard,
        chart.name,
        chart.rows.length
      ]);
      expect(exported).toEqual([
        ['entidade', 'mapa-calor', 12],
        ['entidade', 'contribuicao', 10],
        ['entidade', 'ranking', 10]
      ]);
    });

    it('exporta os três quadros num .zip pelo botão do topo', async () => {
      render(<EntityAnalysisDashboard />);

      await exportAll();

      expect((downloadCsvZip as jest.Mock).mock.calls[0][0]).toBe('entidade');
      expect(zipCharts().map((chart: { name: string }) => chart.name)).toEqual([
        'mapa-calor',
        'contribuicao',
        'ranking'
      ]);
    });

    it('exporta a release e o nível escolhidos', async () => {
      const { rerender } = render(<EntityAnalysisDashboard />);
      await exportAll();
      expect(zipCharts()[0].rows[0]).toMatchObject({ release: 'R2', level: 'Medida' });

      const matrix = measureMatrix({
        release: { id: 1, release_name: 'R1', start_at: '2026-02-01', end_at: '2026-02-28' },
        previous_release: null,
        level: 'characteristic',
        columns: [{ key: 'reliability', name: 'Reliability', weight: 50, path: [] }],
        repositories: [repository(1, 'api', [0.6, null], { reliability: [0.7, null, null] })]
      });
      mockUseEntityAnalysis.mockReturnValue(hookState({ releaseId: 1, level: 'characteristic', matrix }));
      rerender(<EntityAnalysisDashboard />);
      await exportAll();

      // na primeira release a contribuição não tem linhas e fica fora do .zip (o botão filtra os vazios)
      expect(zipCharts()[0].rows).toEqual([
        {
          release: 'R1',
          level: 'Característica',
          repository: 'api',
          entity: 'Reliability',
          key: 'reliability',
          path: '',
          weight: 50,
          value: 0.7,
          grade: 'B',
          tsqmi: 0.6,
          tsqmi_grade: 'B',
          tsqmi_variation: null
        }
      ]);
    });

    it('não exporta a contribuição na primeira release', async () => {
      const matrix = measureMatrix({
        previous_release: null,
        repositories: [repository(1, 'api', [0.6, null], { passed_tests: [0.9, null, null] })]
      });
      mockUseEntityAnalysis.mockReturnValue(hookState({ matrix }));
      render(<EntityAnalysisDashboard />);

      expect(within(card(CONTRIBUTION)).queryByRole('button', { name: 'Exportar .csv' })).toBeNull();
      await exportAll();
      expect(zipCharts().map((chart: { name: string }) => chart.name)).toEqual(['mapa-calor', 'ranking']);
    });

    it('desabilita o .zip sem dados', () => {
      const matrix = measureMatrix({ repositories: [repository(1, 'api', [null, null], {})] });
      mockUseEntityAnalysis.mockReturnValue(hookState({ matrix }));
      render(<EntityAnalysisDashboard />);

      expect(exportAllButton().disabled).toBe(true);
      expect(screen.queryByRole('button', { name: 'Exportar .csv' })).toBeNull();
    });

    it('desabilita o .zip enquanto carrega e no erro', () => {
      mockUseEntityAnalysis.mockReturnValue(hookState({ isLoading: true, matrix: undefined }));
      const { rerender } = render(<EntityAnalysisDashboard />);
      expect(exportAllButton().disabled).toBe(true);

      mockUseEntityAnalysis.mockReturnValue(hookState({ error: new Error('500') }));
      rerender(<EntityAnalysisDashboard />);
      expect(exportAllButton().disabled).toBe(true);
    });
  });
});
