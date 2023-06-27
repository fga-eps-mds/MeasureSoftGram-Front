import { Historical } from '@customTypes/repository';

export interface FormatGaugeChartType {
  historical?: Historical[];
  title: string;
  isEmpty: boolean;
}

const formatGaugeChart = ({ historical, title, isEmpty }: FormatGaugeChartType) => {
  const maxSeriesItems:number = 6;
  const historicalLength: number = (historical?.length ?? 0) > maxSeriesItems ? maxSeriesItems : historical?.length ?? 0;
  const halfHistoricalLength:number = historicalLength / 2;
  let counter:number = halfHistoricalLength * -1;

  const seriesData = historical?.slice(0, maxSeriesItems).map((item) => {
    if (counter === 0) counter = 1;
    const offsetCenterX = `${counter * 80 }%`;
    counter += 1;
    return {
      value: item.latest.value.toFixed(2),
      name: item.name,
      title: {
        offsetCenter: [offsetCenterX, '80%']
      },
      detail: {
        offsetCenter: [offsetCenterX, '95%']
      }
    }
  }) ?? [];

  return {
    title: {
      text: title
    },
    series: {
      show: !isEmpty,
      min: 0,
      max: 1,
      data: seriesData,
      type: 'gauge',
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
        borderRadius: 3,
      }
    }

  }
};

export default formatGaugeChart;
