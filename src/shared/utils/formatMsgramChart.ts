import { Historical } from '@customTypes/repository';
import { format } from 'date-fns';
import _ from 'lodash';

interface Props {
  historical: Historical[];
}

const formatMsgramChart = ({ historical }: Props) => {
  const legendData = _.map(historical, 'name');
  const historicalData = _.map(historical, 'history');
  const xAxisData = _.uniq(historicalData.flat(1).map((h) => format(new Date(h.created_at), 'dd/MM/yyyy HH:mm')));

  const numberOfGraphs = legendData?.length ?? 0;

  const grid = _.times(numberOfGraphs, (i) => ({
    left: '120px',
    right: '4%',
    height: '60px',
    y: `${60 * i + 60}px`,
    containLabel: true
  }));

  const legend = _.times(numberOfGraphs, (i) => ({
    x: 0,
    y: `${60 * i + 69}px`,
    data: [legendData?.[i] ?? '-']
  }));

  const xAxis = _.times(numberOfGraphs, (i) => ({
    show: i === numberOfGraphs - 1,
    gridIndex: i,
    type: 'category',
    data: xAxisData
  }));

  const yAxis = _.times(numberOfGraphs, (i) => ({
    max: 1,
    min: 0,
    type: 'value',
    gridIndex: i,
    splitNumber: 1,
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

  const dataZoom = [
    {
      type: 'slider',
      y: `${60 * numberOfGraphs + 60}px`,
      xAxisIndex: _.times(numberOfGraphs, (i) => i)
    }
  ];

  return {
    tooltip: {
      trigger: 'axis'
    },
    dataZoom,
    grid,
    xAxis,
    yAxis,
    series,
    legend
  };
};

export default formatMsgramChart;
