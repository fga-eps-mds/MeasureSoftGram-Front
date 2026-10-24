import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { downloadCsv, downloadCsvZip } from '@utils/exportCsv';
import { useOverviewDashboard } from '../useOverviewDashboard';
import OverviewDashboard from '../OverviewDashboard';
import {
  analysis,
  characteristics,
  previousCharacteristics,
  releases,
  repositoryWithoutAnalysis,
  summary
} from './fixtures';

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
jest.mock('@utils/exportCsv', () => ({ downloadCsv: jest.fn(), downloadCsvZip: jest.fn() }));
jest.mock('../useOverviewDashboard', () => ({ useOverviewDashboard: jest.fn() }));
// o equalizador tem testes próprios: aqui basta ver o que ele recebe do analysis_data
jest.mock('@components/PlannedVsAccomplishedEqualizer', () => ({
  __esModule: true,
  default: ({
    planned,
    accomplished,
    normDiff
  }: {
    planned: { name: string }[];
    accomplished?: { name: string; value: number }[];
    normDiff?: number;
  }) => (
    <div data-testid="equalizer">
      {JSON.stringify({
        planned: planned.map((item) => item.name),
        accomplished: accomplished?.map((item) => [item.name, item.value]),
        normDiff
      })}
    </div>
  )
}));
// o ECharts não roda no jsdom: o mock mostra os dados que o gráfico receberia
jest.mock('next/dynamic', () => () => ({ option }: { option: { series: { data: unknown }[] } }) => (
  <div data-testid="echarts">{JSON.stringify(option.series.map((series) => series.data))}</div>
));

const retrySummary = jest.fn();
const retryCharacteristics = jest.fn();
const retryReleases = jest.fn();
const retryAnalysis = jest.fn();
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
    analysis: analysis(),
    analysisError: undefined,
    retryReleases,
    retrySummary,
    retryCharacteristics,
    retryAnalysis,
    ...overrides
  };
}

function card(name: string) {
  return screen.getByRole('region', { name });
}

const exportAllButton = () => screen.getByRole('button', { name: 'Exportar todos (.zip)' });
/** Clica no .zip e espera ele terminar de gerar (o botão fica "Exportando…" enquanto isso). */
async function exportAll() {
  fireEvent.click(exportAllButton());
  await waitFor(() => expect(exportAllButton()).toBeEnabled());
}
const zipCharts = (): { name: string; rows: Record<string, unknown>[] }[] =>
  (downloadCsvZip as jest.Mock).mock.calls.at(-1)[1];
const downloadedChart = () => (downloadCsv as jest.Mock).mock.calls.at(-1)[1];
function chooseRepository(name: string) {
  fireEvent.mouseDown(
    within(card('Planejado × Realizado do repositório')).getByRole('combobox', { name: 'Repositório' })
  );
  fireEvent.click(screen.getByRole('option', { name }));
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

  it('desenha o Indicador Total da Qualidade com a cor da faixa de cada repositório e a legenda', () => {
    render(<OverviewDashboard />);
    const indicator = card('Indicador Total da Qualidade');

    expect(within(indicator).getByTestId('echarts')).toHaveTextContent(
      '[[{"value":0.81,"itemStyle":{"color":"#1A9641"}},{"value":0.72,"itemStyle":{"color":"#8CC63F"}}]]'
    );
    const legend = within(indicator).getByTestId('quality-bands-legend');
    expect(within(legend).getByText('A · Ótimo (0,80 a 1,00)')).toBeInTheDocument();
    expect(within(legend).getByText('E · Muito ruim (0,00 a 0,19)')).toBeInTheDocument();
  });

  it('mostra o equalizador da tela da release com o analysis_data do primeiro repositório', () => {
    render(<OverviewDashboard />);

    expect(within(card('Planejado × Realizado do repositório')).getByTestId('equalizer')).toHaveTextContent(
      JSON.stringify({
        planned: ['reliability', 'maintainability'],
        accomplished: [
          ['reliability', 0.74],
          ['maintainability', 0.78]
        ],
        normDiff: 0.05
      })
    );
  });

  it('o mesmo seletor troca o repositório do equalizador e do radar, com os valores do realizado', () => {
    render(<OverviewDashboard />);
    const comparison = card('Planejado × Realizado do repositório');

    expect(within(comparison).getByTestId('echarts')).toHaveTextContent('[[{"name":"service","value":[0.74,0.78]}]]');
    expect(
      within(comparison).getByText('Mesmos valores do realizado (Rd) do repositório service na release 2026.2 R2.')
    ).toBeInTheDocument();

    fireEvent.mouseDown(within(comparison).getByRole('combobox', { name: 'Repositório' }));
    fireEvent.click(screen.getByRole('option', { name: 'front' }));

    expect(within(comparison).getByTestId('equalizer')).toHaveTextContent('"normDiff":0.2');
    expect(within(comparison).getByTestId('echarts')).toHaveTextContent('[[{"name":"front","value":[0.7,"-"]}]]');
  });

  it('avisa, com a mensagem do guia de IDV, quando o repositório escolhido não tem análise na release', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({ analysis: analysis([...(analysis().accomplished ?? []), repositoryWithoutAnalysis]) })
    );
    render(<OverviewDashboard />);
    const comparison = card('Planejado × Realizado do repositório');

    fireEvent.mouseDown(within(comparison).getByRole('combobox', { name: 'Repositório' }));
    fireEvent.click(screen.getByRole('option', { name: 'docs' }));

    const warning = within(comparison).getByRole('status');
    expect(warning).toHaveAttribute('data-severity', 'warning');
    expect(warning).toHaveTextContent(
      'O repositório docs ainda não tem características calculadas na release 2026.2 R2.'
    );
    expect(within(comparison).queryByTestId('echarts')).not.toBeInTheDocument();
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
      dashboard({
        isLoadingReleases: true,
        release: undefined,
        summary: undefined,
        characteristics: undefined,
        analysis: undefined
      })
    );
    render(<OverviewDashboard />);

    expect(screen.getAllByText('Carregando')).toHaveLength(2);
    expect(screen.getAllByTestId('overview-total')[0]).not.toHaveTextContent('3');
    expect(screen.queryByTestId('echarts')).not.toBeInTheDocument();
    expect(screen.queryByTestId('equalizer')).not.toBeInTheDocument();
  });

  it('explica o que fazer, com o aviso do guia de IDV, quando a release não tem análises', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({ characteristics: characteristics([]), analysis: analysis([]) })
    );
    render(<OverviewDashboard />);

    expect(screen.getAllByText('Sem dados')).toHaveLength(2);
    expect(screen.getAllByText('Ainda não há análises nesta release')).toHaveLength(2);
    screen.getAllByRole('status').forEach((message) => expect(message).toHaveAttribute('data-severity', 'warning'));
    expect(screen.getAllByRole('link', { name: 'Ver como configurar a coleta' })[0]).toHaveAttribute(
      'href',
      'https://github.com/fga-eps-mds/MeasureSoftGram-Action'
    );
  });

  it('mostra o erro de cada parte com a mensagem do guia de IDV e "Tentar novamente"', () => {
    (useOverviewDashboard as jest.Mock).mockReturnValue(
      dashboard({
        summaryError: new Error('500'),
        characteristicsError: new Error('500'),
        analysisError: new Error('500')
      })
    );
    render(<OverviewDashboard />);

    expect(screen.getAllByRole('alert')).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Tentar novamente' })).toHaveLength(3);
    expect(screen.queryByText('500')).not.toBeInTheDocument();

    fireEvent.click(within(card('Totais da release')).getByRole('button', { name: 'Tentar novamente' }));
    fireEvent.click(within(card('Indicador Total da Qualidade')).getByRole('button', { name: 'Tentar novamente' }));
    fireEvent.click(
      within(card('Planejado × Realizado do repositório')).getByRole('button', { name: 'Tentar novamente' })
    );

    expect(retrySummary).toHaveBeenCalled();
    expect(retryCharacteristics).toHaveBeenCalled();
    expect(retryAnalysis).toHaveBeenCalled();
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

  describe('exportação de CSV', () => {
    it('exporta os quatro gráficos num .zip pelo botão do topo, com a release escolhida', async () => {
      render(<OverviewDashboard />);

      await exportAll();

      expect((downloadCsvZip as jest.Mock).mock.calls[0][0]).toBe('overview');
      expect(zipCharts().map((chart) => chart.name)).toEqual(['totais', 'indicador', 'planejado-realizado', 'radar']);
      expect(zipCharts()[0].rows[0]).toEqual({ release: '2026.2 R2', total: 'Características', quantity: 3 });
      expect(zipCharts()[0].rows).toHaveLength(6);
    });

    it('exporta o Indicador Total da Qualidade pelo botão do card, com o valor e o grau de cada repositório', () => {
      render(<OverviewDashboard />);

      fireEvent.click(within(card('Indicador Total da Qualidade')).getByRole('button', { name: 'Exportar .csv' }));

      expect((downloadCsv as jest.Mock).mock.calls[0][0]).toBe('overview');
      expect(downloadedChart().name).toBe('indicador');
      expect(downloadedChart().rows).toEqual([
        { release: '2026.2 R2', repository: 'service', indicator: 0.81, grade: 'A' },
        { release: '2026.2 R2', repository: 'front', indicator: 0.72, grade: 'B' }
      ]);
    });

    it('exporta o planejado × realizado só do repositório escolhido no seletor', () => {
      render(<OverviewDashboard />);
      const comparison = card('Planejado × Realizado do repositório');

      fireEvent.click(within(comparison).getByRole('button', { name: 'Exportar .csv' }));
      expect(downloadedChart().name).toBe('planejado-realizado');
      expect(downloadedChart().rows.map((row: { repository: string }) => row.repository)).toEqual([
        'service',
        'service'
      ]);
      expect(downloadedChart().rows[0]).toMatchObject({
        release: '2026.2 R2',
        characteristic: 'reliability',
        planned: 0.7,
        accomplished: 0.74,
        normDiff: 0.05
      });

      chooseRepository('front');
      fireEvent.click(within(comparison).getByRole('button', { name: 'Exportar .csv' }));

      expect(downloadedChart().rows[1]).toEqual({
        release: '2026.2 R2',
        repository: 'front',
        characteristic: 'maintainability',
        planned: 0.8,
        accomplished: null,
        difference: null,
        normDiff: 0.2
      });
    });

    it('exporta o radar com os valores do realizado do repositório escolhido, pelo botão do radar', () => {
      render(<OverviewDashboard />);
      chooseRepository('front');

      fireEvent.click(screen.getByRole('button', { name: 'Exportar .csv do radar' }));

      expect(downloadedChart().name).toBe('radar');
      expect(downloadedChart().rows).toEqual([
        { release: '2026.2 R2', repository: 'front', characteristic: 'reliability', value: 0.7 },
        { release: '2026.2 R2', repository: 'front', characteristic: 'maintainability', value: null }
      ]);
    });

    it('sem análise no repositório escolhido, não há botão do radar e o .zip leva os outros gráficos', async () => {
      (useOverviewDashboard as jest.Mock).mockReturnValue(
        dashboard({ analysis: analysis([...(analysis().accomplished ?? []), repositoryWithoutAnalysis]) })
      );
      render(<OverviewDashboard />);
      chooseRepository('docs');

      expect(screen.queryByRole('button', { name: 'Exportar .csv do radar' })).not.toBeInTheDocument();
      await exportAll();

      expect(zipCharts().map((chart) => chart.name)).toEqual(['totais', 'indicador', 'planejado-realizado']);
    });

    it('deixa de fora do .zip os totais que ainda não chegaram', async () => {
      (useOverviewDashboard as jest.Mock).mockReturnValue(dashboard({ summary: undefined }));
      render(<OverviewDashboard />);

      await exportAll();

      expect(zipCharts().map((chart) => chart.name)).toEqual(['indicador', 'planejado-realizado', 'radar']);
    });

    it('desabilita o .zip enquanto nada carregou', () => {
      (useOverviewDashboard as jest.Mock).mockReturnValue(
        dashboard({
          isLoadingReleases: true,
          release: undefined,
          summary: undefined,
          characteristics: undefined,
          analysis: undefined
        })
      );
      render(<OverviewDashboard />);

      expect(exportAllButton()).toBeDisabled();
    });

    it('não oferece o CSV de um card com erro', () => {
      (useOverviewDashboard as jest.Mock).mockReturnValue(dashboard({ characteristicsError: new Error('500') }));
      render(<OverviewDashboard />);

      expect(within(card('Indicador Total da Qualidade')).queryByRole('button', { name: 'Exportar .csv' })).toBeNull();
    });
  });
});
