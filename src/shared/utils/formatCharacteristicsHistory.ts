import { Historical } from '@customTypes/repository';

interface OptionCheckedProps {
  [key: string]: boolean;
}

export interface FormatCharacteristicsHistoryType {
  historical?: Historical[];
  checkedOptions: OptionCheckedProps;
  title: string;
  selected?: (any) => boolean;
}

const formatCharacteristicsHistory = ({
  historical,
  checkedOptions,
  title,
  selected
}: FormatCharacteristicsHistoryType) => {
  if (!historical || historical.length === 0) return {};

  const newHistorical = historical.filter((h) => {
    if (h && h.history) return h;
    return null;
  });

  const legendData = newHistorical.map((h) => (checkedOptions[h.key] || h.key.includes('SQC') ? h.name : null));
  const series = newHistorical.map((h) => ({
    name: h.name,
    type: 'line',
    data:
      (checkedOptions[h.key] || h.key.includes('SQC')) &&
      h.history.map(({ value, created_at }) => ({
        value: value.toFixed(3),
        itemStyle: {
          color: selected && selected(created_at) ? 'red' : null
        }
      })),
    lineStyle: {
      width: h.key.includes('SQC') ? 5 : 2
    }
  }));

  const dates = newHistorical
    .filter((h) => checkedOptions[h.key] || h.key.includes('SQC'))
    .map((h) => h.history.map(({ created_at: createdAt }) => new Date(createdAt).toLocaleDateString('pt-BR')))[0];

  return {
    title: {
      text: title,
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: legendData,
      selectedMode: false,
      width: '80%',
      type: 'scroll',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '17%',
      containLabel: true
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 200
      },
      {
        start: 0,
        end: 200
      }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      scale: true,
      minInterval: 0.1
    },
    series
  };
};

export default formatCharacteristicsHistory;
