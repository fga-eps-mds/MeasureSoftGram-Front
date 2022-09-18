import { RepositoriesSqcHistory } from '@customTypes/product';
import { format } from 'date-fns';

const longestHistoryMetricsIndex = (sqcHistoryResults: RepositoriesSqcHistory['results']) =>
  sqcHistoryResults.reduce((prevIndex, historyResult, currentIndex) => {
    const previousMetricHistoryLength = sqcHistoryResults[prevIndex].history.length;
    const currentMetricHistoryLength = historyResult.history.length;

    return currentMetricHistoryLength > previousMetricHistoryLength ? currentIndex : prevIndex;
  }, 0);

const formatTwoDecimalPlaces = (value: number) => Math.round(value * 100) / 100;

const formatRepositoriesSqcHistory = (history: RepositoriesSqcHistory) => {
  const legendData: string[] = [];

  const longestHistory = history.results[longestHistoryMetricsIndex(history.results)]

  const dates = [...new Set(longestHistory.history.map(item => item.created_at))]

  history.results.forEach((item, index) => {
    if (index === longestHistoryMetricsIndex(history.results)) return;

    [...new Set(item.history.map(item => item.created_at))].forEach(i => {
      if (!dates.includes(i)) dates.push(i)
    })
  })

  dates.sort((a, b) => new Date(a) > new Date(b))


  const highestOccrs = (date: string) => history.results.reduce((amount, repo) => {
      const highest =  repo.history.reduce((acc, metric) => acc + Number(metric.created_at === date), 0)

      return Math.max(amount, highest)
    }, 0)

  let xAxisData: string[] = new Array(200)
  let initialFillIndex = 0

  dates.forEach(date => {
    xAxisData.fill(date, initialFillIndex, initialFillIndex + highestOccrs(date))

    initialFillIndex += highestOccrs(date)
  })

  xAxisData = xAxisData.filter(item => item)

  const seriesAux = []

  history.results.forEach((repo, index) => {
    seriesAux.push({
      name: repo.name,
      data: new Array(xAxisData.length).fill(null),
      type: 'line',
      animationDuration: 1200
    })

    legendData.push(repo.name);

    // eslint-disable-next-line no-plusplus
    for(let i=0, j=0; j<repo.history.length; j++, i++) {
      if (xAxisData[i] === repo.history[j].created_at) {
        seriesAux[index].data[i] = formatTwoDecimalPlaces(repo.history[j].value)
      } else {
        i = xAxisData.findIndex(item => item == repo.history[j].created_at)
        seriesAux[index].data[i] = formatTwoDecimalPlaces(repo.history[j].value)
      }
    }
  })

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
        end: xAxisData.length - 1
      },
      {
        start: 0,
        end: xAxisData.length - 1
      }
    ],
    xAxis: {
      type: 'category',
      data: xAxisData, // .map(metric => format(new Date(metric.replace(/\s+/g, '')), 'dd/MM/yyyy HH:MM')),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [{
      ticks: {
        beginAtZero: false
      }
    }],
    series: seriesAux
  };
};

export default formatRepositoriesSqcHistory;
