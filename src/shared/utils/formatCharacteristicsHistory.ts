import { Historical } from '@customTypes/repository';
import { format } from 'date-fns';
import _ from 'lodash';
import ReactEcharts from 'echarts-for-react';
import { ComponentRef } from 'react';
import convertToCsv, { CSVFilter } from './convertToCsv';

export interface FormatCharacteristicsHistoryType {
  historical?: Historical[];
  title: string;
  isEmpty: boolean;
  csvFilters: CSVFilter;
  ref: React.MutableRefObject<ComponentRef<typeof ReactEcharts> | null>;
}

const formatCharacteristicsHistory = ({
  historical,
  title,
  isEmpty = false,
  csvFilters,
  ref
}: FormatCharacteristicsHistoryType) => {
  const legendData = _.map(historical, 'name');
  const historicalData = _.map(historical, 'history');
  const xAxisData = _.uniq(historicalData.flat(1).map((h) => format(new Date(h?.created_at), 'dd/MM/yyyy HH:mm')));
  const indexToTime = _.uniq(historicalData.flat(1).map((h) => new Date(h?.created_at).getTime()));

  const series = _.map(historical, (item) => ({
    show: !isEmpty,
    name: item.name,
    type: 'line',
    data: _.map(item.history, (history) => history.value.toFixed(2)),
    lineStyle: {
      width: item.key.includes('TSQMI') ? 5 : 2
    }
  }));

  const onEvents = {
    datazoom: () => {
      if (ref.current && csvFilters.dateRange && typeof ref.current.getEchartsInstance === 'function') {
        const chart = ref.current.getEchartsInstance();
        // @ts-ignore
        const { startValue, endValue } = chart.getOption().dataZoom[0];
        console.log(startValue, endValue);
        csvFilters.dateRange.startDate = indexToTime[startValue];
        csvFilters.dateRange.endDate = indexToTime[endValue];
      }
    }
  };

  const handleExportCsv = () => {
    if (historical) {
      console.log(csvFilters.dateRange);
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
    dataZoom: [
      {
        show: !isEmpty,
        type: 'slider',
        start: 0,
        end: 100
      },
      {
        show: !isEmpty,
        type: 'inside',
        start: 0,
        end: xAxisData.length - 1
      }
    ],
    legend: {
      show: !isEmpty,
      data: legendData,
      selectedMode: false,
      width: '80%',
      type: 'scroll'
    },
    grid: {
      show: !isEmpty,
      left: '3%',
      right: '4%',
      bottom: '17%',
      containLabel: true
    },
    xAxis: {
      show: !isEmpty,
      type: 'category',
      boundaryGap: false,
      data: xAxisData
    },
    yAxis: {
      show: !isEmpty,
      type: 'value',
      scale: true,
      minInterval: 0.1
    },
    series,
    onEvents
  };
};

export default formatCharacteristicsHistory;
