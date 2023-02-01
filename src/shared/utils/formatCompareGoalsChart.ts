import { CompareGoalAccomplished } from '@customTypes/product';

const formatCompareGoalsChart = (data: CompareGoalAccomplished) => {
  const xAxisData = Object.keys(data?.goal);

  const seriesGoalData = Object.values(data?.goal).map((value) => value / 100);
  const seriesAccomplishedData = Object.values(data?.accomplished).map((value) => value);
  return {
    title: {
      text: 'Realizado x Planejado - Características',
      subtext: `release criada por ${data?.created_by}`,
      subtextStyle: {
        color: '#4461A5',
        fontSize: 14
      }
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        magicType: {
          type: ['line', 'bar']
        },
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '20%',
      containLabel: true
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['Realizado', 'Planejado'],
      left: 'center'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: true
    },
    yAxis: {
      type: 'value',
      min: 0,
      boundaryGap: [0, 0.1]
    },
    series: [
      {
        name: 'Planejado',
        type: 'line',
        data: seriesGoalData
      },
      {
        name: 'Realizado',
        type: 'line',
        data: seriesAccomplishedData
      }
    ]
  };
};

export default formatCompareGoalsChart;
