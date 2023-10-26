import convertToCsv from './convertToCsv';
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
    right: 25,
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

  const handleExportCsv = () => {
    if (historical) {
      const csvContent = convertToCsv(historical);

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dados.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return {
    title: {
      text: title
    },
    radar: {
      show: !isEmpty,
      shape: historical.length < 3 ? 'circle' : 'polygon',
      indicator: radarIndicator
    },
    toolbox: {
      feature: {
        myCustomTool: {
          show: true,
          title: 'Export CSV',
          icon: 'image:///images/png/iconCsv.png',
          onclick: () => {
            handleExportCsv();
          },
        }
      }
    },
    legend,
    series
  };
};

export default formatRadarChart;
