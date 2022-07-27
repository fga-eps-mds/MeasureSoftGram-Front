import { format } from 'date-fns';

import { MeasuresHistoryResult } from '@customTypes/project';

const longestHistoryMetricsIndex = (measuresHistoryResults: Array<MeasuresHistoryResult>) => measuresHistoryResults.reduce((prevIndex, historyResult, currentIndex) => {
    const previousMetricHistoryLength = measuresHistoryResults[prevIndex].history.length;
    const currentMetricHistoryLength = historyResult.history.length;

    return currentMetricHistoryLength > previousMetricHistoryLength ? currentIndex : prevIndex
  }, 0)

const formatTwoDecimalPlaces = (value: number) => Math.round(value * 100) / 100;

const formatMeasuresHistoryChartData = (measuresHistoryResults: Array<MeasuresHistoryResult>) => {
  console.log(measuresHistoryResults)
  const legendData: string[] = []

  const xAxisData = measuresHistoryResults[longestHistoryMetricsIndex(measuresHistoryResults)]
    .history
    .map(metric => format(new Date(metric.created_at.replace(/\s+/g, '')), 'dd/MM/yyyy HH:MM'))

  const series = measuresHistoryResults.map(item => {
    legendData.push(item.name)

    return {
      name: item.name,
      data: item.history.map(metric => formatTwoDecimalPlaces(metric.value)),
      type: "line",
      animationDuration: 1200
    }})

  return {
    title: {
      text: "Histórico de Medidas",
      left: 'center'
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: legendData,
      top: 40,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "12%",
      top: "20%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: xAxisData.length-20,
        end: xAxisData.length-1
      },
      {
        start: xAxisData.length-20,
        end: xAxisData.length-1
      }
    ],
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: "value"
    },
    series
  }
}

export default formatMeasuresHistoryChartData;
