import {
  ReleaseDashboardCharacteristic,
  ReleaseDashboardCharacteristics,
  ReleaseDashboardRepository
} from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';

const AXIS_LABEL = { color: DASHBOARD_COLORS.mutedText, fontSize: 11 };
const SPLIT_LINE = { lineStyle: { color: DASHBOARD_COLORS.gridLine } };
const VALUE_LABEL = { color: DASHBOARD_COLORS.text, fontSize: 11, fontWeight: 'bold' as const };

/** 0,81 — duas casas, vírgula decimal. */
export function formatDecimal(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'sem dado';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 1.284 — separador de milhar. */
export function formatTotal(value: number): string {
  return value.toLocaleString('pt-BR');
}

/** +0,04 ou −0,03, com o sinal de menos tipográfico. */
export function formatVariation(diff: number): string {
  const rounded = Math.round(diff * 100) / 100;
  if (rounded === 0) return formatDecimal(0);
  return `${rounded > 0 ? '+' : '−'}${formatDecimal(Math.abs(rounded))}`;
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
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

export function formatTsqmiTooltip(bar: TsqmiBar, releaseName: string, previousReleaseName?: string): string {
  const lines = [
    `<strong>${escapeHtml(bar.name)} · ${escapeHtml(releaseName)}</strong>`,
    `TSQMI: ${formatDecimal(bar.value)}`
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
        data: bars.map((bar) => bar.value),
        barMaxWidth: 22,
        itemStyle: { color: DASHBOARD_COLORS.primary, borderRadius: 3 },
        label: {
          show: true,
          position: 'right',
          ...VALUE_LABEL,
          fontSize: 13,
          formatter: ({ value }: { value: number }) => formatDecimal(value)
        }
      }
    ]
  };
}

/** Repositório que o radar mostra primeiro: o primeiro com alguma característica calculada na release. */
export function getDefaultRadarRepository(repositories: ReleaseDashboardRepository[]): number | undefined {
  const withValues = repositories.find((repository) =>
    repository.characteristics.some((characteristic) => characteristic.value !== null)
  );
  return (withValues ?? repositories[0])?.id;
}

export function hasCharacteristicValues(repository?: ReleaseDashboardRepository): boolean {
  return !!repository?.characteristics.some((characteristic) => characteristic.value !== null);
}

export function formatRadarOptions(
  characteristics: Pick<ReleaseDashboardCharacteristic, 'key' | 'name'>[],
  repository: ReleaseDashboardRepository
) {
  const valueByKey = new Map(
    repository.characteristics.map((characteristic) => [characteristic.key, characteristic.value])
  );
  // sem valor na release, o eixo fica sem ponto em vez de cair para zero
  const values = characteristics.map((characteristic) => valueByKey.get(characteristic.key) ?? '-');

  return {
    animation: false,
    tooltip: { trigger: 'item' },
    radar: {
      indicator: characteristics.map((characteristic) => ({ name: characteristic.name, max: 1 })),
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
        data: [{ name: repository.name, value: values }]
      }
    ]
  };
}

export function hasPlannedOrAccomplished(characteristics: ReleaseDashboardCharacteristic[]): boolean {
  return characteristics.some(
    (characteristic) => characteristic.planned !== null || characteristic.accomplished !== null
  );
}

export function formatPlannedAccomplishedOptions(characteristics: ReleaseDashboardCharacteristic[]) {
  const barLabel = {
    show: true,
    position: 'top',
    ...VALUE_LABEL,
    formatter: ({ value }: { value: number | string }) => (typeof value === 'number' ? formatDecimal(value) : '')
  };

  return {
    animation: false,
    legend: { show: false },
    grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: { dataIndex: number }[]) => {
        const characteristic = characteristics[params[0].dataIndex];
        const lines = [
          `<strong>${escapeHtml(characteristic.name)}</strong>`,
          `Planejado: ${formatDecimal(characteristic.planned)}`,
          `Realizado: ${formatDecimal(characteristic.accomplished)}`
        ];
        if (characteristic.dispersion !== null) {
          lines.push(`Dispersão entre os repositórios: ±${formatDecimal(characteristic.dispersion)}`);
        }
        return lines.join('<br/>');
      }
    },
    xAxis: {
      type: 'category',
      data: characteristics.map((characteristic) => characteristic.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: DASHBOARD_COLORS.gridLine } },
      axisLabel: { color: DASHBOARD_COLORS.text, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      interval: 0.25,
      axisLabel: { ...AXIS_LABEL, formatter: (value: number) => formatDecimal(value) },
      splitLine: SPLIT_LINE
    },
    series: [
      {
        name: 'Planejado',
        type: 'bar',
        barMaxWidth: 34,
        itemStyle: { color: DASHBOARD_COLORS.planned, borderRadius: 2 },
        label: barLabel,
        data: characteristics.map((characteristic) => characteristic.planned ?? '-')
      },
      {
        name: 'Realizado',
        type: 'bar',
        barMaxWidth: 34,
        itemStyle: { color: DASHBOARD_COLORS.accomplished, borderRadius: 2 },
        label: barLabel,
        data: characteristics.map((characteristic) => characteristic.accomplished ?? '-')
      }
    ]
  };
}
