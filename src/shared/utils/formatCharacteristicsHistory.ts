import { Historical } from '@customTypes/repository';
import { format } from 'date-fns';
import _ from 'lodash';

export interface FormatCharacteristicsHistoryType {
  historical?: Historical[];
  title: string;
  isEmpty: boolean;
}

const formatCharacteristicsHistory = ({ historical, title, isEmpty = false }: FormatCharacteristicsHistoryType) => {
  const legendData = _.map(historical, 'name');
  const historicalData = _.map(historical, 'history');
  const xAxisData = _.uniq(historicalData.flat(1).map((h) => format(new Date(h.created_at), 'dd/MM/yyyy HH:mm')));

  const series = _.map(historical, (item) => ({
    show: !isEmpty,
    name: item.name,
    type: 'line',
    data: _.map(item.history, (history) => history.value.toFixed(2)),
    lineStyle: {
      width: item.key.includes('SQC') ? 5 : 2
    }
  }));

  return {
    title: {
      text: title
    },
    tooltip: {
      show: !isEmpty,
      trigger: 'axis'
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
    series
  };
};

export default formatCharacteristicsHistory;
