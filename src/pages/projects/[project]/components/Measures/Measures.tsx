import React, { useEffect, useState } from 'react';

import ReactEcharts, { EChartsOption } from "echarts-for-react";

import { Box, Container } from '@mui/material';

import formatMeasuresHistoryChartData from '@utils/formatMeasuresHistory';
import { MeasuresHistoryResult } from '@types/project';
import useMeasures from './hook/useMeasures';


const Measures: React.FC = () => {
  const [chartOptions, setChartOptions] = useState<EChartsOption>();

  const { projectMeasuresHistory } = useMeasures();

  useEffect(() => {
    if (!projectMeasuresHistory) return

    const formatedCharOptions = formatMeasuresHistoryChartData(projectMeasuresHistory?.results as Array<MeasuresHistoryResult>)
    setChartOptions(formatedCharOptions);
  }, [projectMeasuresHistory])

  if (!chartOptions) {
    return null;
  }

  return (
    <Container>
      <Box marginY="60px">
        <ReactEcharts
          option={chartOptions}
          style={{ height: "600px", width: "100%" }}
        />
      </Box>
    </Container>
  );
}

export default Measures;
