import { COLOR_TOKENS } from './formatPulseChart';
import { SERIES_COLORS } from './dashboardColors';
import { TimeGranularity, TimeSeries } from './historicalValues';

const DAY = 24 * 60 * 60 * 1000;
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Data do eixo e do tooltip: 21/10/2026 em dias, out/2026 em meses. */
export function formatPeriod(time: number, granularity: TimeGranularity) {
  const date = new Date(time);
  if (granularity === 'month') return `${MONTHS[date.getMonth()]}/${date.getFullYear()}`;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatValue(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

/**
 * Gráfico de linhas no tempo de um nível do modelo, como os painéis da Evolução Temporal do Grafana: uma linha por
 * entidade, com o eixo X em dias ou em meses.
 * @param normalized características, subcaracterísticas e medidas vão de 0 a 1; métricas usam o valor coletado
 */
export function formatTimeEvolutionOptions(series: TimeSeries[], granularity: TimeGranularity, normalized: boolean) {
  return {
    color: SERIES_COLORS,
    animation: false,
    grid: { left: 16, right: 24, top: 48, bottom: 16, containLabel: true },
    legend: { type: 'scroll', top: 0, textStyle: { color: COLOR_TOKENS.mutedText } },
    tooltip: {
      trigger: 'axis',
      formatter: (params: { marker: string; seriesName: string; value: [number, number] }[]) => {
        if (!params.length) return '';
        const rows = params.map(
          ({ marker, seriesName, value }) => `<div>${marker} ${seriesName}: <strong>${formatValue(value[1])}</strong></div>`
        );
        return [`<div><strong>${formatPeriod(params[0].value[0], granularity)}</strong></div>`, ...rows].join('');
      }
    },
    xAxis: {
      type: 'time',
      // um rótulo por dia ou por mês, sem horas no meio
      minInterval: granularity === 'day' ? DAY : 28 * DAY,
      axisLabel: {
        color: COLOR_TOKENS.axisText,
        hideOverlap: true,
        formatter: (value: number) => formatPeriod(value, granularity)
      },
      axisLine: { lineStyle: { color: COLOR_TOKENS.border } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: normalized ? 1 : undefined,
      axisLabel: { color: COLOR_TOKENS.axisText },
      splitLine: { lineStyle: { color: COLOR_TOKENS.gridLine } }
    },
    series: series.map((item) => ({
      name: item.name,
      type: 'line',
      data: item.points,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      // o preenchimento leve dos painéis do Grafana
      areaStyle: { opacity: 0.08 }
    }))
  };
}
