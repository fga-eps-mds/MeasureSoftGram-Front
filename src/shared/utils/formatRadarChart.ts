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
      legend: {
        show: false
      },
      radar: {
        show: false,
        shape: 'circle',
        indicator: []
      },
      series: []
    };
  }

  const radarIndicator = _.map(historical, (item) => ({ name: item.name, max: 1 }));

  const series = [
    {
      show: !isEmpty,
      type: 'radar',
      data: [
        {
          value: _.map(historical, (item) => item.latest.value.toFixed(2))
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
    series
  };
};

export default formatRadarChart;
