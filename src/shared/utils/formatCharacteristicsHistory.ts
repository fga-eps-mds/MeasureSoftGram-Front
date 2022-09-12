interface Charactheristic {
  key: string;
  name: string;
  history: Array<{
    value: number;
    created_at: string;
  }>;
}

interface OptionCheckedProps {
  [key: string]: boolean;
}

const formatCharacteristicsHistory = (historical: Charactheristic[], checkedOptions: OptionCheckedProps) => {
  if (!historical || historical.length === 0) return {};

  const newHistorical = historical.filter((h) => {
    if (h && h.history) return h;
    return null;
  });

  const legendData = newHistorical.map((h) => (checkedOptions[h.key] || h.key.includes('SQC') ? h.name : null));
  const series = newHistorical
    .map((h) => ({
      name: h.name,
      type: 'line',
      data: checkedOptions[h.key] || h.key.includes('SQC') ? h.history.map(({ value }) => value.toFixed(3)) : null
    }))
    .reverse();

  const xAxisData = newHistorical
    .filter((h) => checkedOptions[h.key] || h.key.includes('SQC'))
    .map((h) => h.history.map(({ created_at: createdAt }) => new Date(createdAt).toLocaleDateString('pt-BR')))[0]
    .reverse();

  return {
    title: {
      text: 'Características'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: legendData
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData
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
