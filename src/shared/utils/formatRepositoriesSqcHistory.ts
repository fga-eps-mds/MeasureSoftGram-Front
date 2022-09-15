import { RepositoriesSqcHistory } from "@customTypes/project";
import { format } from "date-fns";

const longestHistoryMetricsIndex = (sqcHistoryResults: RepositoriesSqcHistory['results']) =>
  sqcHistoryResults.reduce((prevIndex, historyResult, currentIndex) => {
    const previousMetricHistoryLength = sqcHistoryResults[prevIndex].history.length;
    const currentMetricHistoryLength = historyResult.history.length;

    return currentMetricHistoryLength > previousMetricHistoryLength ? currentIndex : prevIndex;
  }, 0);

const formatTwoDecimalPlaces = (value: number) => Math.round(value * 100) / 100;

const formatRepositoriesSqcHistory = (history: RepositoriesSqcHistory) => {
  const legendData: string[] = [];

  const xAxisData = history.results[longestHistoryMetricsIndex(history.results)].history.map((metric) =>
    format(new Date(metric.created_at.replace(/\s+/g, '')), 'dd/MM/yyyy HH:MM')
  );

  const series = history.results.map((item) => {
    legendData.push(item.name);

    return {
      name: item.name,
      data: item.history.map((metric) => formatTwoDecimalPlaces(metric.value)),
      type: 'line',
      animationDuration: 1200
    };
  });

  return {
    title: {
      text: 'Comportamento observado do produto',
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: legendData.flatMap(i => [i,i]),
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
        start: xAxisData.length - 20,
        end: xAxisData.length - 1
      },
      {
        start: xAxisData.length - 20,
        end: xAxisData.length - 1
      }
    ],
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series
  };
};

export default formatRepositoriesSqcHistory;
