import { Historical } from '@customTypes/repository';
import { format } from 'date-fns';
import _ from 'lodash';
import ReactEcharts from 'echarts-for-react';
import { ComponentRef } from 'react';
import convertToCsv, { CSVFilter } from './convertToCsv';

interface Props {
  historical: Historical[];
  title: string;
  isEmpty: boolean;
  csvFilters: CSVFilter;
  ref: React.MutableRefObject<ComponentRef<typeof ReactEcharts> | null>;
}

const formatMsgramChart = ({ historical, title, isEmpty = false, csvFilters, ref }: Props) => {
  const legendData = _.map(historical, 'name');
  const historicalData = _.map(historical, 'history');
  const xAxisData = _.uniq(historicalData.flat(1).map((h) => format(new Date(h.created_at), 'dd/MM/yyyy HH:mm')));
  const indexToTime = _.uniq(historicalData.flat(1).map((h) => new Date(h?.created_at).getTime()));

  const numberOfGraphs = legendData?.length ?? 0;

  const onEvents = {
    datazoom: () => {
      if (ref.current && csvFilters.dateRange) {
        const chart = ref.current.getEchartsInstance();
        // @ts-ignore
        const { startValue, endValue } = chart.getOption().dataZoom[0];
        console.log(startValue, endValue);
        csvFilters.dateRange.startDate = indexToTime[startValue];
        csvFilters.dateRange.endDate = indexToTime[endValue];
      }
    }
  };

  const grid = _.times(numberOfGraphs, (i) => ({
    show: false,
    left: '120px',
    right: '4%',
    height: '60px',
    y: `${60 * i + 60}px`,
    containLabel: true
  }));

  const legend = _.times(numberOfGraphs, (i) => ({
    show: !isEmpty,
    selectedMode: false,
    x: 0,
    y: `${60 * i + 69}px`,
    data: [legendData?.[i] ?? '-']
  }));

  const xAxis = _.times(numberOfGraphs, (i) => ({
    show: i === numberOfGraphs - 1 && !isEmpty,
    gridIndex: i,
    type: 'category',
    data: xAxisData
  }));

  const yAxis = _.times(numberOfGraphs, (i) => ({
    show: !isEmpty,
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
    show: !isEmpty,
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
      show: !isEmpty,
      type: 'slider',
      y: `${60 * numberOfGraphs + 60}px`,
      xAxisIndex: _.times(numberOfGraphs, (i) => i)
    }
  ];

  const handleExportCsv = () => {
    if (historical) {
      const csvContent = convertToCsv(historical, csvFilters);

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[. ]/g, '');
      a.download = `msgram-${title}-${timestamp}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return {
    title: {
      text: title
    },
    tooltip: {
      show: !isEmpty,
      trigger: 'axis'
    },
    toolbox: {
      feature: {
        myCustomTool: {
          show: true,
          title: 'Export CSV',
          icon: 'image:///images/png/iconCsv.png',
          onclick: () => {
            handleExportCsv();
          }
        }
      }
    },
    dataZoom,
    grid,
    xAxis,
    yAxis,
    series,
    legend,
    onEvents
  };
};

export default formatMsgramChart;
