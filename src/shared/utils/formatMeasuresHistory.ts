import { format } from 'date-fns';

import { MeasuresHistory } from '@types/project';

const indexOfLongestArray = (measuresHistory: MeasuresHistory) => measuresHistory.results.reduce((prevIndex, historyResult, currentIndex) => {
    const previousMetricHistoryLength = measuresHistory.results[prevIndex].collected_metric_history.length;
    const currentMetricHistoryLength = historyResult.collected_metric_history.length;

    return currentMetricHistoryLength > previousMetricHistoryLength ? currentIndex : prevIndex
  }, 0)

const formatMeasuresHistoryChartData = (measuresHistory: MeasuresHistory) => {
  const legendData: string[] = []

  const xAxisData = measuresHistory.results[indexOfLongestArray(measuresHistory)]
    .collected_metric_history
    .map(metric => format(new Date(metric.created_at.replace(/\s+/g, '')), 'dd/MM/yyyy HH:MM'))

  const series = measuresHistory.results.map(item => {
    legendData.push(item.key)

    return {
      name: item.key,
      data: item.collected_metric_history.map(metric => metric.value),
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
