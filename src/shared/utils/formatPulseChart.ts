import { toPulseSeries } from './toPulseSeries';

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

export type QualityRange = 'critical' | 'warning' | 'adequate';

export interface QualityStatus {
  key: QualityRange;
  label: string;
  color: string;
}

export function getQualityStatus(value: number): QualityStatus {
  if (value < 0.4) {
    return { key: 'critical', label: 'crítico', color: COLOR_TOKENS.critical };
  }
  if (value < 0.7) {
    return { key: 'warning', label: 'atenção', color: COLOR_TOKENS.warning };
  }
  return { key: 'adequate', label: 'adequado', color: COLOR_TOKENS.adequate };
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
  name: string;
  version: string;
  start_at?: string;
  end_at: string;
}

export interface PulseRepositoryData {
  id: number | string;
  name: string;
  measurements: PulseMeasurement[];
  releases: PulseRelease[];
}

export function formatPulseChartOptions(repositories: PulseRepositoryData[]) {
  if (!repositories || !repositories.length) {
    return {};
  }

  const gridCount = repositories.length;
  const gridHeight = 82;
  const gridGap = 34;
  const topOffset = 60;

  const grids: any[] = [];
  const xAxes: any[] = [];
  const yAxes: any[] = [];
  const seriesList: any[] = [];

  repositories.forEach((repo, index) => {
    const isLast = index === gridCount - 1;
    const topPosition = topOffset + index * (gridHeight + gridGap);

    const sortedMeasurements = [...repo.measurements].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const ts = sortedMeasurements.map((m) => new Date(m.created_at).getTime());
    const values = sortedMeasurements.map((m) => m.value);
    const pulseData = toPulseSeries(ts, values);

    // Releases markLines (Início e Fim da Release)
    const markLineData: any[] = [];

    repo.releases.forEach((rel) => {
      const labelText =
        rel.version === rel.name || !rel.name
          ? rel.version || rel.name
          : `${rel.version} ${rel.name}`;

      if (rel.start_at) {
        const startMs = new Date(rel.start_at).getTime();
        if (!isNaN(startMs)) {
          markLineData.push({
            name: `Início ${labelText}`,
            xAxis: startMs,
            label: {
              show: true,
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
          markLineData.push({
            name: labelText,
            xAxis: endMs,
            label: {
              show: true,
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
          return `${month}/${day}`;
        },
      },
      splitLine: {
        show: true,
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
        show: true,
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
      lineStyle: {
        width: 2,
      },
      data: pulseData,
      markLine: {
        silent: true,
        symbol: ['none', 'none'],
        data: markLineData,
      },
    });
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
    visualMap: [
      {
        show: false,
        dimension: 1,
        seriesIndex: Array.from({ length: gridCount }, (_, i) => i),
        pieces: [
          { lte: 0.399, color: COLOR_TOKENS.critical },
          { gte: 0.4, lte: 0.699, color: COLOR_TOKENS.warning },
          { gte: 0.7, color: COLOR_TOKENS.adequate },
        ],
      },
    ],
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
      formatter: (params: any[]) => {
        if (!params || !params.length) return '';
        const firstParam = params[0];
        const dateStr = new Date(firstParam.value[0]).toISOString().split('T')[0];

        let html = `<div style="font-weight:bold; font-size:14px; margin-bottom:8px;">${dateStr}</div>`;

        params.forEach((p: any) => {
          const repoName = p.seriesName;
          const val = p.value[1];
          const status = getQualityStatus(val);

          const rawIdx = Math.floor(p.dataIndex / 3);
          const repo = repositories.find((r) => r.name === repoName);
          let varText = '';

          if (repo && repo.measurements && rawIdx > 0) {
            const sortedM = [...repo.measurements].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            const prevVal = sortedM[rawIdx - 1]?.value;
            if (prevVal !== undefined) {
              const diff = val - prevVal;
              const sign = diff >= 0 ? '+' : '';
              const diffColor = diff >= 0 ? COLOR_TOKENS.adequate : COLOR_TOKENS.critical;
              if (diff !== 0) {
                varText = ` <span style="color: ${diffColor}">(${sign}${diff.toFixed(4)})</span>`;
              }
            }
          }

          html += `<div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
            <span style="display:inline-block; width:8px; height:8px; background-color:${status.color}; border-radius:2px;"></span>
            <span><strong>${repoName}:</strong> ${val.toFixed(4)}${varText}</span>
          </div>`;
        });

        return html;
      },
    },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: seriesList,
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

export function convertPulseRepositoriesToCsv(repositories: PulseRepositoryData[]): string {
  const csvHeader = [
    'id',
    'key',
    'name',
    'description',
    'historyId',
    'history_characteristic_id',
    'history_value',
    'history_created_at',
    'quality_status',
  ];

  const rows: string[][] = [];

  repositories.forEach((repo) => {
    const sorted = [...repo.measurements].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach((m, idx) => {
      const status = getQualityStatus(m.value);
      rows.push([
        String(repo.id),
        '',
        `"${repo.name.replace(/"/g, '""')}"`,
        '',
        String(idx + 1),
        '',
        String(m.value),
        m.created_at,
        status.label,
      ]);
    });
  });

  const lines = [csvHeader, ...rows];
  return lines.map((line) => line.join(',')).join('\n');
}


