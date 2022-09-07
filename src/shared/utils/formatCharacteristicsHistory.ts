interface Charactheristic {
  name: string;
  history: Array<{
    value: number;
    created_at: string;
  }>;
}

const formatCharacteristicsHistory = (historical: Charactheristic[]) => {
  if (!historical || historical.length === 0) return {};

  const legendData = historical.map((h) => h.name);

  const series = historical.map((h) => ({
    name: h.name,
    type: 'line',
    data: h.history.map(({ value }) => value.toFixed(3))
  }));

  const xAxisData = historical.map((h) =>
    h.history.map(({ created_at: createdAt }) => new Date(createdAt).toLocaleDateString('pt-BR'))
  )[0];

  return {
    title: {
      text: 'Caracteristicas'
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
