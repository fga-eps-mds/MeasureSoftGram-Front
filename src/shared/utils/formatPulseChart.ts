import { TsqmiReleasePoint } from '@customTypes/product';
import { escapeHtml, formatDecimal, formatVariation } from './formatNumber';
import { getQualityBandClamped, QualityGrade } from './qualityBands';
import { PULSE_POINTS_PER_MEASUREMENT, toPulseSeries } from './toPulseSeries';

export const COLOR_TOKENS = {
  primary: '#2B4D6F',
  secondary: '#5F7EA3',
  bgEven: '#F4F5F6',
  bgOdd: '#FAFBFC',
  critical: '#D13310',
  warning: '#DF8E16',
  adequate: '#04724D',
  border: '#D5DAE0',
  gridLine: '#E6E9ED',
  axisText: '#9AA1A9',
  mutedText: 'rgba(0, 0, 0, 0.65)',
};

export type QualityRange = QualityGrade;

export interface QualityStatus {
  key: QualityRange;
  label: string;
  color: string;
}

/** Faixa do Indicador Total da Qualidade (A a E, US06.01) de um valor; as faixas ficam em `qualityBands`. */
export function getQualityStatus(value: number): QualityStatus {
  const band = getQualityBandClamped(value);
  return { key: band.grade, label: band.label, color: band.color };
}

/** Medidas das faixas do gráfico de pulso, em px: as mesmas no pulso do produto e no do repositório. */
export const PULSE_GRID = { topOffset: 60, height: 82, gap: 34 };

export interface PulseChartOptions {
  /**
   * `first-row` mostra o nome de cada release só na primeira faixa que a tem, para as etiquetas não se repetirem nem
   * se sobreporem.
   */
  releaseLabels?: 'every-row' | 'first-row';
  /**
   * Etiqueta "Início" das releases. Sem ela, só fica a linha pontilhada: o início de uma release costuma cair no fim
   * da anterior, e as duas etiquetas se sobrepunham (ata do PO de 14/10/2026).
   */
  releaseStartLabels?: boolean;
  /** Linhas de grade dentro de cada faixa (as horizontais e as verticais da última faixa, a única com o eixo do tempo). */
  horizontalLines?: boolean;
  /** Conteúdo do tooltip quando o cursor encaixa no ponto de uma release; sem ele, o tooltip só mostra as medições. */
  releaseTooltip?: (points: PulseReleaseHover[]) => string;
}

/** Ponto de release sob o cursor: um por repositório que tem a release. */
export interface PulseReleaseHover {
  repository: string;
  release: PulseRelease;
  value: number;
}

/** Ponto do indicador TSQMI consolidado no encerramento de uma release (US06.01); `release` vai para o tooltip. */
export interface PulseReleasePoint {
  value: [number, number];
  itemStyle: { color: string };
  release: PulseRelease;
}

export interface VariationInfo {
  absoluteDiff: number;
  formattedDiff: string;
  percentageDiff: number;
  formattedPercentage: string;
  isPositive: boolean;
  isNegative: boolean;
  color: string;
}

export function calculateVariation(current: number, previous?: number): VariationInfo | null {
  if (previous === undefined || previous === null) {
    return null;
  }

  const diff = current - previous;
  const percentage = previous !== 0 ? (diff / previous) * 100 : 0;
  const isPositive = diff > 0;
  const isNegative = diff < 0;

  const sign = isPositive ? '+' : '';
  const formattedDiff = `${sign}${diff.toFixed(4)}`;
  
  const symbol = isPositive ? '▲' : isNegative ? '▼' : '•';
  const formattedPercentage = `${symbol} ${Math.abs(percentage).toFixed(2)}%`;
  
  const color = isPositive
    ? COLOR_TOKENS.adequate
    : isNegative
    ? COLOR_TOKENS.critical
    : COLOR_TOKENS.mutedText;

  return {
    absoluteDiff: diff,
    formattedDiff,
    percentageDiff: percentage,
    formattedPercentage,
    isPositive,
    isNegative,
    color,
  };
}

export interface PulseMeasurement {
  created_at: string;
  value: number;
}

export interface PulseRelease {
  id?: number;
  name: string;
  version: string;
  start_at?: string;
  end_at: string;
  /** Indicador TSQMI consolidado do repositório na release (US06.01); só no pulso do produto. */
  tsqmi?: TsqmiReleasePoint;
  /** Nome da release anterior do mesmo repositório, a base de `tsqmi.previous_value`. */
  previousName?: string;
}

export interface PulseRepositoryData {
  id: number | string;
  name: string;
  measurements: PulseMeasurement[];
  releases: PulseRelease[];
}

/**
 * Trechos de tempo do pulso de um repositório, cada um na cor da faixa do indicador vigente; a cor troca no instante
 * da medição que muda de faixa. A cor vem do tempo, não da altura: os picos são ampliados e passariam por outras
 * faixas. No ECharts, o `visualMap` de uma série `line` só pinta pela dimensão de um eixo.
 */
export function getBandTimePieces(sortedMeasurements: PulseMeasurement[]) {
  const pieces: { gte?: number; lt?: number; color: string }[] = [];
  sortedMeasurements.forEach((measurement) => {
    const { color } = getQualityStatus(measurement.value);
    const last = pieces[pieces.length - 1];
    if (last?.color === color) return;
    const time = new Date(measurement.created_at).getTime();
    if (last) last.lt = time;
    pieces.push(last ? { gte: time, color } : { color });
  });
  return pieces;
}

/** Folga à direita do eixo do tempo, em fração do período: a etiqueta da última release fica centrada na linha. */
const TIME_AXIS_RIGHT_PADDING = 0.05;

/**
 * Mesmo intervalo de tempo em todas as faixas: das medições e dos pontos de indicador das releases de todos os
 * repositórios. Com um eixo por faixa, cada uma calcularia o seu, e as faixas ficariam desalinhadas. Releases sem
 * indicador (antes das medições, por exemplo) não esticam o eixo; os marcadores delas fora do intervalo não aparecem.
 */
function getTimeRange(repositories: PulseRepositoryData[]): { min?: number; max?: number } {
  const times = repositories
    .flatMap((repo) => [
      ...repo.measurements.map((m) => m.created_at),
      ...repo.releases.filter((rel) => typeof rel.tsqmi?.value === 'number').map((rel) => rel.end_at),
    ])
    .map((date) => new Date(date).getTime())
    .filter((time) => !Number.isNaN(time));
  if (!times.length) return {};

  const min = Math.min(...times);
  const max = Math.max(...times);
  return { min, max: max + (max - min) * TIME_AXIS_RIGHT_PADDING };
}

export function formatPulseChartOptions(
  repositories: PulseRepositoryData[],
  {
    releaseLabels = 'every-row',
    releaseStartLabels = true,
    horizontalLines = true,
    releaseTooltip,
  }: PulseChartOptions = {}
) {
  if (!repositories || !repositories.length) {
    return {};
  }

  const gridCount = repositories.length;
  const { height: gridHeight, gap: gridGap, topOffset } = PULSE_GRID;

  const grids: any[] = [];
  const xAxes: any[] = [];
  const yAxes: any[] = [];
  const seriesList: any[] = [];
  // Ficam depois das séries do pulso, para o índice da série continuar sendo o do repositório (visualMap e tooltip).
  const releasePointSeries: any[] = [];
  // Medições de cada repositório em ordem cronológica: o tooltip lê o valor medido daqui, não do desenho do pulso.
  const sortedByRepository: PulseMeasurement[][] = [];
  const labeledReleases = new Set<string>();
  const timeRange = getTimeRange(repositories);
  const bandVisualMaps: any[] = [];

  repositories.forEach((repo, index) => {
    const isLast = index === gridCount - 1;
    const topPosition = topOffset + index * (gridHeight + gridGap);

    const sortedMeasurements = [...repo.measurements].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedByRepository.push(sortedMeasurements);
    // Com troca de faixa, a cor vem do visualMap; sem troca, fica na série (a cor da série teria prioridade).
    const bandPieces = getBandTimePieces(sortedMeasurements);
    const changesBand = bandPieces.length > 1;
    if (changesBand) {
      bandVisualMaps.push({ show: false, seriesIndex: index, dimension: 0, pieces: bandPieces });
    }

    const ts = sortedMeasurements.map((m) => new Date(m.created_at).getTime());
    const values = sortedMeasurements.map((m) => m.value);
    const pulseData = toPulseSeries(ts, values);

    // Releases markLines (Início e Fim da Release)
    const markLineData: any[] = [];

    const releasePoints: PulseReleasePoint[] = [];

    repo.releases.forEach((rel) => {
      const labelText =
        rel.version === rel.name || !rel.name
          ? rel.version || rel.name
          : `${rel.version} ${rel.name}`;

      const releaseKey = rel.id !== undefined ? String(rel.id) : `${labelText}|${rel.end_at}`;
      const showReleaseLabels = releaseLabels === 'every-row' || !labeledReleases.has(releaseKey);
      labeledReleases.add(releaseKey);

      if (rel.start_at) {
        const startMs = new Date(rel.start_at).getTime();
        if (!isNaN(startMs)) {
          markLineData.push({
            name: `Início ${labelText}`,
            xAxis: startMs,
            label: {
              show: showReleaseLabels && releaseStartLabels,
              formatter: `Início ${labelText}`,
              position: 'start',
              backgroundColor: 'rgba(95, 126, 163, 0.85)',
              color: '#FFFFFF',
              fontSize: 10,
              fontFamily: 'Roboto',
              padding: [2, 5],
              borderRadius: 3,
            },
            lineStyle: {
              color: COLOR_TOKENS.secondary,
              type: 'dotted',
              width: 1.5,
            },
          });
        }
      }

      if (rel.end_at) {
        const endMs = new Date(rel.end_at).getTime();
        if (!isNaN(endMs)) {
          const tsqmiValue = rel.tsqmi?.value;
          if (tsqmiValue !== undefined && tsqmiValue !== null) {
            releasePoints.push({
              value: [endMs, tsqmiValue],
              itemStyle: { color: getQualityStatus(tsqmiValue).color },
              release: rel,
            });
          }

          markLineData.push({
            name: labelText,
            xAxis: endMs,
            label: {
              show: showReleaseLabels,
              formatter: labelText,
              position: 'end',
              backgroundColor: COLOR_TOKENS.primary,
              color: '#FFFFFF',
              fontSize: 10.5,
              fontFamily: 'Roboto',
              padding: [3, 6],
              borderRadius: 3,
            },
            lineStyle: {
              color: COLOR_TOKENS.primary,
              type: [4, 3],
              width: 1.5,
            },
          });
        }
      }
    });



    grids.push({
      left: 220,
      right: 30,
      top: topPosition,
      height: gridHeight,
      show: true,
      backgroundColor: index % 2 === 0 ? COLOR_TOKENS.bgEven : COLOR_TOKENS.bgOdd,
      borderColor: COLOR_TOKENS.border,
      borderWidth: 1,
    });

    xAxes.push({
      type: 'time',
      gridIndex: index,
      ...timeRange,
      show: isLast,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: COLOR_TOKENS.axisText,
        fontSize: 11,
        fontFamily: 'Roboto',
        formatter: (val: number) => {
          const date = new Date(val);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${day}/${month}`;
        },
      },
      splitLine: {
        show: horizontalLines,
        lineStyle: {
          color: COLOR_TOKENS.gridLine,
          type: 'solid',
        },
      },
    });

    yAxes.push({
      type: 'value',
      gridIndex: index,
      min: 0,
      max: 1,
      interval: 0.5,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: COLOR_TOKENS.axisText,
        fontSize: 11,
        fontFamily: 'Roboto',
        formatter: (v: number) => v.toFixed(1),
      },
      splitLine: {
        show: horizontalLines,
        lineStyle: {
          color: COLOR_TOKENS.gridLine,
          type: 'solid',
        },
      },
    });

    const latestVal = values[values.length - 1] ?? 0;
    const latestStatus = getQualityStatus(latestVal);

    seriesList.push({
      name: repo.name,
      type: 'line',
      xAxisIndex: index,
      yAxisIndex: index,
      showSymbol: false,
      hoverAnimation: false,
      // O pico do batimento pode passar um pouco da faixa, como no eletrocardiograma.
      clip: false,
      lineStyle: {
        width: 2,
        ...(changesBand ? {} : { color: bandPieces[0]?.color ?? COLOR_TOKENS.secondary }),
      },
      data: pulseData,
      markLine: {
        silent: true,
        symbol: ['none', 'none'],
        data: markLineData,
      },
    });

    if (releasePoints.length) {
      releasePointSeries.push({
        name: repo.name,
        type: 'scatter',
        xAxisIndex: index,
        yAxisIndex: index,
        symbolSize: 10,
        z: 3,
        itemStyle: { borderColor: '#FFFFFF', borderWidth: 2 },
        data: releasePoints,
      });
    }
  });

  const totalHeight = topOffset + gridCount * (gridHeight + gridGap) + 40;

  return {
    height: totalHeight,
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      lineStyle: {
        color: COLOR_TOKENS.axisText,
        type: 'dashed',
      },
    },
    visualMap: bandVisualMaps,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      borderRadius: 8,
      padding: [12, 16],
      textStyle: {
        color: '#1F2937',
        fontSize: 12,
        fontFamily: 'Roboto',
      },
      formatter: (allParams: any[]) => {
        // Com o cursor no ponto de uma release, o eixo encaixa nele e os params trazem os pontos dessa release.
        const releasePoints: PulseReleaseHover[] = (allParams ?? [])
          .filter((p: any) => p.seriesIndex >= gridCount && p.data?.release)
          .map((p: any) => ({ repository: p.seriesName, release: p.data.release, value: p.data.value[1] }));
        if (releaseTooltip && releasePoints.length) return releaseTooltip(releasePoints);

        // Só as medições do pulso; os pontos das releases ficam de fora.
        const params = (allParams ?? []).filter((p: any) => p.seriesIndex < gridCount);
        if (!params.length) return '';
        // Uma série por repositório, na mesma ordem: o índice evita confundir repositórios de mesmo nome.
        const measurementOf = (p: any) =>
          sortedByRepository[p.seriesIndex]?.[Math.floor(p.dataIndex / PULSE_POINTS_PER_MEASUREMENT)];
        const firstMeasurement = measurementOf(params[0]);
        if (!firstMeasurement) return '';
        const dateStr = new Date(firstMeasurement.created_at).toLocaleDateString('pt-BR');

        let html = `<div style="font-weight:bold; font-size:14px; margin-bottom:8px;">${dateStr}</div>`;

        params.forEach((p: any) => {
          const repoName = p.seriesName;
          const rawIdx = Math.floor(p.dataIndex / PULSE_POINTS_PER_MEASUREMENT);
          const measurement = measurementOf(p);
          if (!measurement) return;
          const val = measurement.value;
          const status = getQualityStatus(val);
          let varText = '';

          if (rawIdx > 0) {
            const prevVal = sortedByRepository[p.seriesIndex][rawIdx - 1]?.value;
            const diff = prevVal === undefined ? 0 : Math.round((val - prevVal) * 100) / 100;
            // Sem variação visível nas duas casas, não mostra "(0,00)".
            if (diff !== 0) {
              const diffColor = diff > 0 ? COLOR_TOKENS.adequate : COLOR_TOKENS.critical;
              varText = ` <span style="color: ${diffColor}">(${formatVariation(diff)})</span>`;
            }
          }

          html += `<div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
            <span style="display:inline-block; width:8px; height:8px; background-color:${status.color}; border-radius:2px;"></span>
            <span><strong>${escapeHtml(repoName)}:</strong> ${formatDecimal(val)}${varText}</span>
          </div>`;
        });

        return html;
      },
    },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: [...seriesList, ...releasePointSeries],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: Array.from({ length: gridCount }, (_, i) => i),
      },
      {
        type: 'slider',
        xAxisIndex: Array.from({ length: gridCount }, (_, i) => i),
        bottom: 10,
        height: 20,
        borderColor: COLOR_TOKENS.border,
        fillerColor: 'rgba(95, 126, 163, 0.2)',
        handleStyle: {
          color: COLOR_TOKENS.secondary,
        },
      },
    ],
  };
}
