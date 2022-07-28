import React, { useEffect, useState } from 'react';

import ReactEcharts, { EChartsOption } from 'echarts-for-react';
import { Box, Container } from '@mui/material';

import formatMeasuresHistoryChartData from '@utils/formatMeasuresHistory';
import { MeasuresHistoryResult } from '@customTypes/project';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';

import useQuery from './hooks/useQuery';

const Measures: NextPageWithLayout = () => {
  const [chartOptions, setChartOptions] = useState<EChartsOption>();

  const { projectMeasuresHistory } = useQuery();

  useEffect(() => {
    if (!projectMeasuresHistory) return;

    const formatedCharOptions = formatMeasuresHistoryChartData(
      projectMeasuresHistory?.results as Array<MeasuresHistoryResult>
    );
    setChartOptions(formatedCharOptions);
  }, [projectMeasuresHistory]);

  if (!chartOptions) {
    return null;
  }

  return (
    <Container>
      <Box marginY="60px" data-testid="measures">
        <ReactEcharts option={chartOptions} style={{ height: '600px', width: '100%' }} />
      </Box>
    </Container>
  );
};

Measures.getLayout = getLayout;

export default Measures;
