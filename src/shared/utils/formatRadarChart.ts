import { Historical } from '@customTypes/repository';
import _ from 'lodash';

export interface FormatRadarChartType {
  historical?: Historical[];
  title: string;
  isEmpty: boolean;
}

const formatRadarChart = ({ historical, title, isEmpty }: FormatRadarChartType) => {
  if (!historical?.length) {
    return {
      title: {
        text: title
      },
      radar: {
        show: false,
        shape: 'circle',
        indicator: []
      },
      series: []
    };
  }

  const radarIndicator = _.map(historical, (item) => ({ name: item.name, max: 1, color: '#000000' }));

  const legend = {
    data: ['Valor alcançado', 'Valor esperado'],
    right: 0,
  }

  const series = [
    {
      show: !isEmpty,
      type: 'radar',
      data: [
        {
          value: _.map(historical, (item) => item.latest.value.toFixed(2)),
          name: 'Valor alcançado'
        },
        {
          value: _.map(historical, (item) => ((item?.goal ?? 1) / 100)?.toFixed(2)),
          name: 'Valor esperado',
          itemStyle: {
            color: '#f1c40f'
          }
        }
      ]
    }
  ];

  return {
    title: {
      text: title
    },
    radar: {
      show: !isEmpty,
      shape: historical.length < 3 ? 'circle' : 'polygon',
      indicator: radarIndicator
    },
    legend,
    series
  };
};

export default formatRadarChart;
