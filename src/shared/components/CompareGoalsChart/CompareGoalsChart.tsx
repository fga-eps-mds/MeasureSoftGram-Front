import React from 'react';

import { CompareGoalAccomplished, ReleaseGoal } from '@customTypes/product';

import ReactEcharts from 'echarts-for-react';
import formatCompareGoalsChart from '@utils/formatCompareGoalsChart';
import { Box, InputLabel, MenuItem, Select } from '@mui/material';
import * as Styles from './styles';

interface Props {
  release: ReleaseGoal;
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
