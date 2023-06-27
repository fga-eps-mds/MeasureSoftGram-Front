import { Historical } from '@customTypes/repository';
import _ from 'lodash';

export interface FormatRadarChartType {
  historical?: Historical[];
  title: string;
  isEmpty: boolean;
}

const formatRadarChart = ({ historical, title, isEmpty }: FormatRadarChartType) => {
  const legendData = ['Valores atuais', 'Valores esperado'];
  const radarIndicator = _.map(historical, item => ({ name: item.name, max: 1 }));

  const serA = [
    {
      show: !isEmpty,
      type: 'radar',
      data: [
        {
          name: 'Valores atuais',
          value: _.map(historical, item => item.latest.value.toFixed(2))
        },
        {
          name: 'Valores esperado',
          value: _.map(historical, () => 1)
        }
      ]
    }
  ]

  return {
    title: {
      text: title,
    },
    legend: {
      show: !isEmpty,
      data: legendData
    },
    radar: {
      show: !isEmpty,
      shape: 'circle',
      indicator: radarIndicator,
    },
    series: serA
  }
}

export default formatRadarChart;
