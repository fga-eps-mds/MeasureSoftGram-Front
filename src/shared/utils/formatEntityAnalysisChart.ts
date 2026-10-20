import { EntityAnalysis, EntityAnalysisRepository, EntityLevel } from '@customTypes/product';
import { COLOR_TOKENS, getQualityStatus } from './formatPulseChart';

export const NO_DATA_LABEL = 'sem dado';

export const LEVEL_LABELS: Record<EntityLevel, string> = {
  characteristic: 'Característica',
  subcharacteristic: 'Subcaracterística',
  measure: 'Medida',
  metric: 'Métrica',
};

const METRIC_UNITS: Record<string, string> = {
  PERCENT: '%',
  MILLISEC: 'ms',
};

export function getMetricUnit(metricType?: string): string {
  return (metricType && METRIC_UNITS[metricType]) || '';
}

/** Valores de característica, subcaracterística e medida vão de 0 a 1; métrica usa o valor coletado. */
export function formatEntityValue(value: number | null, level: EntityLevel, metricType?: string): string {
  if (value === null || value === undefined) return NO_DATA_LABEL;
  if (level !== 'metric') return value.toFixed(2);

  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
  const unit = getMetricUnit(metricType);
  return unit ? `${formatted} ${unit}` : formatted;
}

/** Do pior (menor valor) para o melhor; repositórios sem dado vão para o fim, na ordem do nome. */
export function sortRepositoriesWorstToBest(repositories: EntityAnalysisRepository[]): EntityAnalysisRepository[] {
  return [...repositories].sort((a, b) => {
    if (a.value === null && b.value === null) return a.name.localeCompare(b.name);
    if (a.value === null) return 1;
    if (b.value === null) return -1;
    return a.value - b.value || a.name.localeCompare(b.name);
  });
}

export function hasAnyValue(analysis?: EntityAnalysis | null): boolean {
  return !!analysis?.repositories.some((repository) => repository.value !== null);
}

/**
 * A faixa de referência da medida vem nas unidades da métrica (ex.: cobertura de 60 a 100), enquanto a
 * barra da medida já é o valor normalizado de 0 a 1. Por isso ela é mostrada como legenda, e não no eixo.
 */
export function formatReferenceCaption(analysis: EntityAnalysis): string | null {
  const { reference, level } = analysis;
  if (!reference) return null;

  if (level === 'characteristic' && reference.goal !== undefined) {
    return `Meta planejada da release: ${reference.goal.toFixed(2)}`;
  }
  if (level === 'measure' && reference.min_threshold !== undefined && reference.max_threshold !== undefined) {
    return `Faixa de referência da medida (mínimo – máximo): ${reference.min_threshold} – ${reference.max_threshold}`;
  }
  return null;
}

export function formatEntityAnalysisChartOptions(analysis: EntityAnalysis, showReference: boolean) {
  const { level, entity } = analysis;
  const isNormalized = level !== 'metric';
  // o eixo de categorias do ECharts desenha de baixo para cima: invertemos para o pior ficar no topo
  const repositories = sortRepositoriesWorstToBest(analysis.repositories).reverse();
  const goal = analysis.reference?.goal;

  const barColor = (value: number) => (isNormalized ? getQualityStatus(value).color : COLOR_TOKENS.secondary);

  const data = repositories.map((repository) =>
    repository.value === null
      ? {
          value: 0,
          repositoryId: repository.id,
          itemStyle: { color: 'transparent' },
          label: { show: true, formatter: NO_DATA_LABEL, color: COLOR_TOKENS.axisText, fontStyle: 'italic' },
        }
      : {
          value: repository.value,
          repositoryId: repository.id,
          itemStyle: { color: barColor(repository.value) },
          label: {
            show: true,
            formatter: formatEntityValue(repository.value, level, entity.metric_type),
            color: COLOR_TOKENS.mutedText,
          },
        }
  );

  const markLine =
    showReference && level === 'characteristic' && goal !== undefined
      ? {
          symbol: 'none',
          silent: true,
          lineStyle: { color: COLOR_TOKENS.primary, type: 'dashed', width: 2 },
          label: { formatter: `Meta ${goal.toFixed(2)}`, position: 'end', color: COLOR_TOKENS.primary },
          data: [{ xAxis: goal }],
        }
      : undefined;

  return {
    animation: false,
    grid: { left: 16, right: 72, top: 24, bottom: 24, containLabel: true },
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; dataIndex: number }) => {
        const repository = repositories[params.dataIndex];
        return `${params.name}<br/>${entity.name}: <b>${formatEntityValue(
          repository?.value ?? null,
          level,
          entity.metric_type
        )}</b>`;
      },
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: isNormalized ? 1 : undefined,
      axisLabel: { color: COLOR_TOKENS.axisText },
      splitLine: { lineStyle: { color: COLOR_TOKENS.gridLine } },
    },
    yAxis: {
      type: 'category',
      data: repositories.map((repository) => repository.name),
      axisLabel: { color: COLOR_TOKENS.primary, fontWeight: 500 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: COLOR_TOKENS.border } },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 28,
        cursor: 'pointer',
        label: { show: true, position: 'right' },
        data,
        markLine,
      },
    ],
  };
}
