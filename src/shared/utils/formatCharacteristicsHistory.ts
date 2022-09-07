interface Charactheristic {
  name: string;
  history: Array<{
    value: number;
    created_at: string;
  }>;
}

const formatCharacteristicsHistory = (historical: Charactheristic[]) => {
  if (historical.length === 0) return {};
  // console.log('e', historical);
  // console.log(
  //   'f',
  //   historical.map((h) => h)
  // );
  console.log(
    historical.map((h) => h.history.map(({ created_at: createdAt }) => new Date(createdAt).toLocaleDateString('pt-BR')))
  );
  // console.log(
  //   historical.map((h) => ({
  //     name: h.name,
  //     type: 'line',
  //     stack: 'Total',
  //     data: h.history.map(({ value }) => value).slice(0, 10)
  //   }))
  // );

  const data = historical.map((h) => h.name);
  const series = historical.map((h) => ({
    name: h.name,
    type: 'line',
    stack: 'Total',
    // data: Array.from({ length: 10 }).map((_, i) => i)
    data: h.history.map(({ value }) => value.toFixed(3))
  }));
  const xAxisData = historical.map((h) =>
    h.history.map(({ created_at: createdAt }) => new Date(createdAt).toLocaleDateString('pt-BR'))
  )[0];

  return {
    title: {
      text: 'Stacked Line'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data
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
      boundaryGap: ['20%', '20%'],
      // scale: false,
      min: 0,
      minInterval: 0.1,
      max: 3
    },
    series
  };
};

export default formatCharacteristicsHistory;
