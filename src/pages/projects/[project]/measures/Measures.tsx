import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import ReactEcharts, { EChartsOption } from "echarts-for-react";

import { Box, Container } from '@mui/material';

import Layout from '@components/Layout';

import formatMeasuresHistoryChartData from '@utils/formatMeasuresHistory';
import ProjectContent from '../components/ProjectContent';
import useQuery from '../components/ProjectContent/hook/useQuery';


const Measures: NextPage = () => {
  const [chartOptions, setChartOptions] = useState<EChartsOption>();

  const { loadProjectMeasuresHistory } = useQuery();

  const { isReady } = useRouter();

  useEffect(() => {
    if(!isReady) return;

    async function getProjectMeasuresHistory() {
      const response = await loadProjectMeasuresHistory();
      setChartOptions(formatMeasuresHistoryChartData(response));
    }

    getProjectMeasuresHistory();
  }, [isReady])

  if (!chartOptions) {
    return null;
  }

  return (
    <Layout>
      <Container>
        <Box>
          <ProjectContent />

          <ReactEcharts
            option={chartOptions}
            style={{ height: "600px", width: "100%" }}
          />
        </Box>
      </Container>
    </Layout>
  );
}

export default Measures;
