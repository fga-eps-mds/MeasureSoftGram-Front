import { Historical } from '@customTypes/repository';
import _ from 'lodash';

interface Props {
  historical: Historical[];
}

const formatMsgramChart = ({ historical }: Props) => {
  const legendData = _.map(historical, 'name');

  const numberOfGraphs = legendData?.length ?? 0;

  const grid = _.times(numberOfGraphs, (i) => ({
    left: 0,
    right: 0,
    height: '82px',
    x: 0,
    y: `${82 * i + 60}px`,
    containLabel: true
  }));

  const legend = _.times(numberOfGraphs, (i) => ({
    x: '20px',
    y: `${82 * i + 49}px`,
    data: [legendData?.[i] ?? '-']
  }));

  const xAxis = _.times(numberOfGraphs, (i) => ({
    show: i === numberOfGraphs - 1,
    gridIndex: i,
    type: 'category'
  }));

  const yAxis = _.times(numberOfGraphs, (i) => ({
    max: 1,
    min: 0,
    type: 'value',
    gridIndex: i,
    splitNumber: 5,
    splitLine: {
      lineStyle: {
        width: 2
      }
    }
  }));

  const series = historical?.map((h, i) => ({
    name: h.name,
    type: 'line',
    data: h.history.map(({ value }) => ({
      value: value.toFixed(3)
    })),
    xAxisIndex: i,
    yAxisIndex: i
  }));

  return {
    title: {
      text: `Característitcas da Release Atual`,
      subtextStyle: {
        color: '#4461A5',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid,
    xAxis,
    yAxis,
    series,
    legend
  };
};

export default formatMsgramChart;
