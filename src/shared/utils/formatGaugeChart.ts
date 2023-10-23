import { Historical } from '@customTypes/repository';

export interface FormatGaugeChartType {
  historical?: Historical[];
  title: string;
  isEmpty: boolean;
}

const formatGaugeChart = ({ historical, title, isEmpty }: FormatGaugeChartType) => {
  const vertical: string = `70%`;
  const historicalLength: number = historical?.length ?? 1;

  let incrementX: number = 25;
  if (historicalLength % 2 === 0) {
    incrementX = 50;
  }

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
            name: item.name,
            title: {
              offsetCenter: ['-80%', '20%']
            },
            detail: {
              offsetCenter: ['-80%', '37%']
            }
          },
          {
            value: ((item?.goal ?? 100) / 100)?.toFixed(2),
            name: 'Valor esperado',
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
              [0.33, '#e74c3c'],
              [0.66, '#f1c40f'],
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
          distance: 0,
          rotate: 'tangential',
          formatter: function (value: any) {
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
    series: seriesData
  };
};

export default formatGaugeChart;