const formatMSGGoalsChart = (textProps: string, source: Array<number>, color: string) => {
  console.log(textProps);

  const data = [
    { x: 'Category 1', y: [5, 10] },
    { x: 'Category 2', y: [4, 15] },
    { x: 'Category 3', y: [8, 5] }
  ];

  return {
    title: {
      text: 'Multi-Channel Chart'
    },
    legend: {
      data: ['Channel 1', 'Channel 2']
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: [
      {
        type: 'value',
        name: 'Channel 1',
        splitLine: {
          show: false
        }
      },
      {
        type: 'value',
        name: 'Channel 2',
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: 'Channel 1',
        type: 'bar',
        yAxisIndex: 0,
        data: [10, 20, 30, 40, 50, 60]
      },
      {
        name: 'Channel 2',
        type: 'line',
        yAxisIndex: 1,
        data: [15, 25, 35, 45, 55, 65]
      }
    ]
    // legend: {
    //   data: [`${textProps}`]
    // },
    // xAxis: {
    //   type: 'category',
    //   data: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho']
    // },
    // yAxis: {
    //   type: 'value',
    //   range: [0, 1]
    // },
    // tooltip: {
    //   trigger: 'item',
    //   formatter: '{b}: {c}'
    // },
    // lineStyle: {
    //   color: `${color}`
    // },
    // series: [
    //   {
    //     name: `${textProps}`,
    //     type: 'line',
    //     data: source,
    //     smooth: true
    //   }
    // ]
  };
};

export default formatMSGGoalsChart;
