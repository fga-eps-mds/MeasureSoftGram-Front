import { Historical } from '@customTypes/repository';

interface Props {
  historical?: Historical[];
  repositoryName?: string | undefined;
}

const formatMsgramChart = ({ historical, repositoryName }: Props) => {
  const repoName = repositoryName?.split('-')[3];
  const newHistorical = historical?.filter((h) => {
    if (h && h.history) return h;
    return null;
  });

  const legendData = newHistorical?.map((h) => h.name);
  console.log('legendData: ', legendData);

  const numberOfGraphs = legendData?.length;
  const grid = Array.from({ length: numberOfGraphs }, (_, i) => ({
    x: '16%',
    y: `${14 + 23 * i}%`,
    width: '80%',
    height: '14%'
  }));
  const legend = Array.from({ length: numberOfGraphs }, (_, i) => ({
    x: '-1%',
    y: `${18 + 23 * i}%`,
    data: [legendData[i]],
    selectedMode: 'single',
    textStyle: {
      fontSize: 12
    }
  }));
  const xAxis = Array.from({ length: numberOfGraphs }, (_, i) => ({
    show: false,
    gridIndex: i,
    type: 'category'
  }));
  const yAxis = Array.from({ length: numberOfGraphs }, (_, i) => ({
    gridIndex: i,
    type: 'value',
    max: 1,
    min: 0,
    splitLine: {
      lineStyle: {
        width: 4
      }
    },
    splitNumber: 1
  }));
  const series = newHistorical?.map((h, i) => ({
    name: h.name,
    type: 'line',
    data: h.history.map(({ value }) => ({
      value: value.toFixed(3)
    })),
    xAxisIndex: i,
    yAxisIndex: i
  }));

  return {
    title: {
      text: `Gráfico MeasureSoftGram - ${repoName}`,
      subtextStyle: {
        color: '#4461A5',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid,
    xAxis,
    yAxis,
    series,
    legend
  };
};

export default formatMsgramChart;
