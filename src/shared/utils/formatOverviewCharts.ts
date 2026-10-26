import { AccomplishedRepository, ReleaseDashboardCharacteristics, ReleaseDashboardSummary } from '@customTypes/product';
import { CharacteristicComparison } from '@utils/comparePlannedAccomplished';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { escapeHtml, formatDecimal, formatVariation } from '@utils/formatNumber';
import { getQualityBandClamped } from '@utils/qualityBands';

// Continuam exportados daqui para os imports existentes; a definição fica em formatNumber.
export { escapeHtml, formatDecimal, formatVariation };

const AXIS_LABEL = { color: DASHBOARD_COLORS.mutedText, fontSize: 11 };
const SPLIT_LINE = { lineStyle: { color: DASHBOARD_COLORS.gridLine } };
const VALUE_LABEL = { color: DASHBOARD_COLORS.text, fontSize: 11, fontWeight: 'bold' as const };

/** 1.284 — separador de milhar. */
export function formatTotal(value: number): string {
  return value.toLocaleString('pt-BR');
}

export interface TotalItem {
  label: string;
  /** `undefined` enquanto os totais da release ainda não chegaram. */
  value?: number;
}

/** Os totais da release na ordem dos cards da tela; `repositoriesLabel` é o termo do provedor ("Repositórios"). */
export function getTotalItems(
  totals: ReleaseDashboardSummary['totals'] | undefined,
  repositoriesLabel: string
): TotalItem[] {
  return [
    { label: 'Características', value: totals?.characteristics },
    { label: 'Subcaracterísticas', value: totals?.subcharacteristics },
    { label: 'Medidas', value: totals?.measures },
    { label: 'Métricas', value: totals?.metrics },
    { label: repositoriesLabel, value: totals?.repositories },
    { label: 'Arquivos analisados', value: totals?.files }
  ];
}

export interface TsqmiBar {
  id: number;
  name: string;
  value: number;
  /** TSQMI do repositório na release anterior, quando houver. */
  previous: number | null;
}

/** Repositórios com TSQMI na release, do maior para o menor. */
export function getTsqmiBars(
  current?: ReleaseDashboardCharacteristics,
  previous?: ReleaseDashboardCharacteristics
): TsqmiBar[] {
  const previousById = new Map(previous?.repositories.map((repository) => [repository.id, repository.tsqmi.value]));

  return (current?.repositories ?? [])
    .filter((repository) => repository.tsqmi.value !== null)
    .map((repository) => ({
      id: repository.id,
      name: repository.name,
      value: repository.tsqmi.value as number,
      previous: previousById.get(repository.id) ?? null
    }))
    .sort((a, b) => b.value - a.value);
}

/** "B · Muito bom": grau e rótulo da faixa do Indicador Total da Qualidade (US06.01). */
export function formatQualityGrade(value: number): string {
  const band = getQualityBandClamped(value);
  return `${band.grade} · ${band.label}`;
}

export function formatTsqmiTooltip(bar: TsqmiBar, releaseName: string, previousReleaseName?: string): string {
  const lines = [
    `<strong>${escapeHtml(bar.name)} · ${escapeHtml(releaseName)}</strong>`,
    `Indicador Total da Qualidade: ${formatDecimal(bar.value)} (${formatQualityGrade(bar.value)})`
  ];
  if (bar.previous !== null && previousReleaseName) {
    lines.push(
      `Variação: ${formatVariation(bar.value - bar.previous)} em relação à ${escapeHtml(previousReleaseName)}`
    );
  }
  return lines.join('<br/>');
}

export function formatTsqmiBarOptions(bars: TsqmiBar[], releaseName: string, previousReleaseName?: string) {
  return {
    animation: false,
    grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'item',
      formatter: ({ dataIndex }: { dataIndex: number }) =>
        formatTsqmiTooltip(bars[dataIndex], releaseName, previousReleaseName)
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 1,
      interval: 0.25,
      axisLabel: { ...AXIS_LABEL, formatter: (value: number) => formatDecimal(value) },
      splitLine: SPLIT_LINE
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: bars.map((bar) => bar.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: DASHBOARD_COLORS.text, fontSize: 13 }
    },
    series: [
      {
        type: 'bar',
        // cada barra com a cor da faixa do valor (A a E)
        data: bars.map((bar) => ({ value: bar.value, itemStyle: { color: getQualityBandClamped(bar.value).color } })),
        barMaxWidth: 22,
        itemStyle: { borderRadius: 3 },
        label: {
          show: true,
          position: 'right',
          ...VALUE_LABEL,
          fontSize: 13,
          formatter: ({ value }: { value: number }) => `${formatDecimal(value)} · ${getQualityBandClamped(value).grade}`
        }
      }
    ]
  };
}

/** Repositório que o equalizador e o radar mostram primeiro: o primeiro com alguma característica realizada. */
export function getDefaultAnalysisRepository(accomplished: AccomplishedRepository[]): string | undefined {
  const withValues = accomplished.find((repository) => hasAccomplishedValues(repository));
  return (withValues ?? accomplished[0])?.repository_name;
}

export function hasAccomplishedValues(repository?: AccomplishedRepository): boolean {
  return !!repository?.characteristics?.some(
    (characteristic) => typeof characteristic?.value === 'number' && Number.isFinite(characteristic.value)
  );
}

/**
 * Radar das características do repositório com os mesmos valores do realizado (Rd) do equalizador: os eixos são as
 * características planejadas, na mesma ordem, e uma característica sem realizado fica sem ponto em vez de zero.
 */
export function formatRadarOptions(
  comparisons: CharacteristicComparison[],
  repositoryName: string,
  nameOf: (key: string) => string
) {
  const values = comparisons.map((comparison) => comparison.rd ?? '-');

  return {
    animation: false,
    tooltip: { trigger: 'item' },
    radar: {
      indicator: comparisons.map((comparison) => ({ name: nameOf(comparison.key), max: 1 })),
      center: ['50%', '54%'],
      radius: '72%',
      splitNumber: 4,
      axisName: { color: DASHBOARD_COLORS.text, fontSize: 11 },
      splitLine: SPLIT_LINE,
      splitArea: { show: false },
      axisLine: SPLIT_LINE
    },
    series: [
      {
        type: 'radar',
        symbolSize: 5,
        lineStyle: { color: DASHBOARD_COLORS.primary, width: 2 },
        itemStyle: { color: DASHBOARD_COLORS.primary },
        areaStyle: { color: 'rgba(43, 77, 111, 0.15)' },
        label: {
          show: true,
          color: DASHBOARD_COLORS.primary,
          fontSize: 11,
          fontWeight: 'bold',
          distance: 6,
          // contorno branco para o valor continuar legível sobre as linhas do radar
          textBorderColor: '#FFFFFF',
          textBorderWidth: 2,
          formatter: ({ value }: { value: number | string }) => (typeof value === 'number' ? formatDecimal(value) : '')
        },
        data: [{ name: repositoryName, value: values }]
      }
    ]
  };
}
