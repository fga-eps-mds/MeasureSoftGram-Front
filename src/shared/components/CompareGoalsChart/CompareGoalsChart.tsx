import React from 'react';

import { CompareGoalAccomplished } from '@customTypes/product';

import ReactEcharts from 'echarts-for-react';
import formatCompareGoalsChart from '@utils/formatCompareGoalsChart';
import { Box, InputLabel, MenuItem, Select } from '@mui/material';
import * as Styles from './styles';

interface Props {
  releaseList: CompareGoalAccomplished[];
}

const CompareGoalsChart = ({ releaseList }: Props) => {
  if (!releaseList?.[0]) {
    return null;
  }
  const [selectedRelease, setSelectedRelease] = React.useState(releaseList?.[0]);

  const formatedOptions = formatCompareGoalsChart(selectedRelease);

  return (
    <Box>
      <Box>
        <InputLabel id="demo-simple-select-label">Selecione a release</InputLabel>
        <Select
          variant="standard"
          defaultValue={selectedRelease?.id}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Selecione a release"
          fullWidth
          onChange={(e) => setSelectedRelease(releaseList?.find((release) => release.id === e.target.value))}
        >
          {releaseList?.map((release) => (
            <MenuItem value={release?.id} key={release.id}>
              {release?.release_name}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Styles.GraphicContainer>
        <ReactEcharts option={formatedOptions} style={{ height: '450px', width: '100%' }} />
      </Styles.GraphicContainer>
    </Box>
  );
};

export default CompareGoalsChart;
