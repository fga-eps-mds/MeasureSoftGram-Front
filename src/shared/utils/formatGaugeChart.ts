import { Historical } from '@customTypes/repository';

export interface FormatGaugeChartType {
  historical?: Historical[];
  title: string;
  isEmpty: boolean;
}

const formatGaugeChart = ({ historical, title, isEmpty }: FormatGaugeChartType) => {
  const vertical: string = `57%`;
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
              offsetCenter: ['-60%', '70%']
            },
            detail: {
              offsetCenter: ['-60%', '95%']
            },
          },
          {
            value: ((item?.goal ?? 1) / 100)?.toFixed(2),
            name: 'Valor esperado',
            title: {
              offsetCenter: ['60%', '70%']
            },
            detail: {
              offsetCenter: ['60%', '95%']
            },
            itemStyle: {
              color: '#f1c40f'
            }
          }
        ],
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        anchor: {
          show: true,
          showAbove: true,
          size: 18,
          itemStyle: {
            color: '#FAC858'
          }
        },
        pointer: {
          icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
          width: 8,
          length: '80%',
          offsetCenter: [0, '8%']
        },
        progress: {
          show: true,
          overlap: true,
          roundCap: true
        },
        axisLine: {
          roundCap: true
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
