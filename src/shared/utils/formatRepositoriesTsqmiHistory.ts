import { RepositoriesTsqmiHistory } from '@customTypes/product';

const formatTwoDecimalPlaces = (value: number) => Math.round(value * 100) / 100;

const formatRepositoriesTsqmiHistory = (history: RepositoriesTsqmiHistory) => {
  const legendData: string[] = [];

  const series = history.results.map((item) => {
    legendData.push(item.name);

    return {
      name: item.name,
      data: item.history.map((metric) => [
        new Date(metric.created_at).getTime(),
        formatTwoDecimalPlaces(metric.value)
      ]),
      type: 'line',
      animationDuration: 1200
    };
  });

  return {
    title: {
      text: 'Comportamento observado do produto'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: legendData.flatMap((i) => [i, i]),
      top: 40
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '25%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 2000
      },
      {
        start: 0,
        end: 2000
      }
    ],
    xAxis: {
      type: 'time',
      axisLine: { onZero: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { onZero: false },
      min: 0,
      max: 1
    },
    series
  };
};

export default formatRepositoriesTsqmiHistory;
