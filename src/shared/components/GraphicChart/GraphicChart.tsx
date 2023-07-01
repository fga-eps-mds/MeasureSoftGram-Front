import React from 'react';
import ReactEcharts from 'echarts-for-react';

import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';
import formatMsgramChart from '@utils/formatMsgramChart';
import formatRadarChart from '@utils/formatRadarChart';
import formatGaugeChart from '@utils/formatGaugeChart';
import { Alert, Box, Fade, Skeleton } from '@mui/material';
import { useRequestValues } from '@hooks/useRequestValues';
import { Historical } from '@customTypes/repository';

interface Prop {
  title: string;
  type: 'line' | 'msg' | 'radar' | 'gauge';
  value: 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';
  valueType?: 'historical-values' | 'latest-values';
  autoGrid?: boolean;
  addHistoricalTSQMI?: boolean;
}

type formatFunctionType = {
  [key: string]: Function;
};

const chartOption: formatFunctionType = {
  line: formatCharacteristicsHistory,
  msg: formatMsgramChart,
  radar: formatRadarChart,
  gauge: formatGaugeChart
};

const GraphicChart = ({ title, type, value, valueType = 'historical-values', autoGrid = false, addHistoricalTSQMI = false }: Prop) => {
  const {
    data: historical,
    error,
    isLoading,
    isEmpty
  } = useRequestValues({ type: valueType, value, addHistoricalTSQMI });

  const historicalLength:number = historical?.length ?? 0;
  const numChartsPerLine: number = 3;

  const numChartRows = ():number => {
    if (!autoGrid) return 1;

    const numLines:number = historicalLength / numChartsPerLine;
    return Math.ceil(numLines);
  }

  const sliceHistorical = (rowIdx: number): Historical[] => {
    if (!autoGrid) return historical;

    return historical.slice(numChartsPerLine*rowIdx, numChartsPerLine*(rowIdx+1));
  }

  const numLines:number = numChartRows();

  let chartBoxHeight: string = 'auto';
  if (error || isEmpty) {
    chartBoxHeight = '50px';
  } else if (type === 'msg') {
    chartBoxHeight = `${historicalLength * 82 + 85}px`;
  }

  return isLoading ? (
    <Skeleton variant="rectangular" height="300px" />
  ) : (
    <>
      <Fade in timeout={2000}>
        <Box
          bgcolor="white"
          borderRadius="4px"
          boxShadow="0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"
          paddingX="20px"
          paddingY="10px"
          width="100%"
          height={chartBoxHeight}
        >
          {Array.from({length: numLines}, (_,i) => i).map((i) =>
            <ReactEcharts
              data-testid="graphic-stacked-line"
              option={chartOption[type]({
                historical: sliceHistorical(i),
                title: i === 0 ? title : '',
                isEmpty: !!error || isEmpty,
              })}
            />)
          }
        </Box>
      </Fade>
      {error && (
        <Fade in timeout={1000}>
          <Alert severity="error">Ocorreu um erro ao tentar carregar as informações</Alert>
        </Fade>
      )}
      {isEmpty && (
        <Fade in timeout={1000}>
          <Alert variant="standard" severity="warning">
            Não há dados para serem exibidos
          </Alert>
        </Fade>
      )}
    </>
  );
};

export default GraphicChart;
