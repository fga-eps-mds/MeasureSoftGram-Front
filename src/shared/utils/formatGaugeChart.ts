import convertToCsv from './convertToCsv';
import { Historical } from '@customTypes/repository';

export interface FormatGaugeChartType {
  historical?: Historical[];
  title: string;
  isEmpty: boolean;
  redLimit?: number | undefined;
  yellowLimit?: number | undefined;
}

const formatGaugeChart = ({ historical, title, isEmpty, redLimit, yellowLimit }: FormatGaugeChartType) => {
  const vertical: string = `70%`;
  const historicalLength: number = historical?.length ?? 1;

  let incrementX: number = 25;
  if (historicalLength % 2 === 0) {
    incrementX = 50;
  }

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

  const seriesData =
    historical?.map((item, index) => {
      const horizontal: string = `${25 + index * incrementX}%`;

      return {
        name: item.name,
        show: !isEmpty,
        center: [horizontal, vertical],
        min: 0,
        max: 1,
        data: [
          {
            value: item.latest.value.toFixed(2),
            name: 'Valor atual',
            title: {
              offsetCenter: ['-80%', '20%']
            },
            detail: {
              offsetCenter: ['-80%', '37%']
            }
          },
          {
            value: ((item?.goal ?? 100) / 100)?.toFixed(2),
            name: 'Valor planejado',
            title: {
              offsetCenter: ['80%', '20%']
            },
            detail: {
              offsetCenter: ['80%', '37%']
            },
            itemStyle: {
              color: '#f1c40f'
            },
            pointer: {
              width: 0
            }
          }
        ],
        type: 'gauge',
        startAngle: 180,
        endAngle: 360,
        radius: '90%',
        anchor: {
          show: true,
          showAbove: true,
          size: 18,
          itemStyle: {
            color: '#171717'
          }
        },
        pointer: {
          icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
          width: 8,
          length: '90%',
          offsetCenter: [0, '8%'],
          itemStyle: {
            color: '#171717'
          }
        },
        axisLine: {
          lineStyle: {
            width: 40,
            color: [
              [redLimit ?? 0.33, '#e74c3c'],
              [yellowLimit ?? 0.66, '#f1c40f'],
              [1, '#07bc0c']
            ]
          }
        },
        axisTick: {
          length: 0
        },
        splitLine: {
          length: 0
        },
        axisLabel: {
          fontSize: 18,
          fontWeight: 'bold',
          distance: -45,
          rotate: 'tangential',
          formatter: function (value: any) {
            if (value === 0.5) {
              return item.name;
            }
            return '';
          }
        },
        detail: {
          width: 20,
          height: 14,
          fontSize: 18,
          color: '#fff',
          backgroundColor: 'inherit',
          borderRadius: 3
        }
      };
    }) ?? [];

  return {
    title: {
      text: title
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
    series: seriesData
  };
};

export default formatGaugeChart;
