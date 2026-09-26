import React from 'react';

import { IReleases } from '@customTypes/product';

import dynamic from 'next/dynamic';
import type ReactEchartsType from 'echarts-for-react';
import formatCompareGoalsChart from '@utils/formatCompareGoalsChart';
import { Box } from '@mui/material';
import * as Styles from './styles';

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface Props {
  release: IReleases;
}

const CompareGoalsChart = ({ release }: Props) => {
  if (!release) {
    return null;
  }

  const formatedOptions = formatCompareGoalsChart(release);

  return (
    <Box>
      <Styles.GraphicContainer>
        <ReactEcharts option={formatedOptions} style={{ height: '450px', width: '100%' }} />
      </Styles.GraphicContainer>
    </Box>
  );
};

export default CompareGoalsChart;
