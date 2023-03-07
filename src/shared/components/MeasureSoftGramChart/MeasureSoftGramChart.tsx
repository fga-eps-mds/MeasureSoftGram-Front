import React, { useEffect, useState } from 'react';
import ReactEcharts, { EChartsOption } from 'echarts-for-react';
import formatMsgramChart from '@utils/formatMsgramChart';
import { Box } from '@mui/material';
import { Historical } from '@customTypes/repository';
import * as Styles from './styles';

interface Props {
  historical: Historical[];
  repositoryName: string;
}

const MeasureSoftGramChart = ({ historical, repositoryName }: Props) => {
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  useEffect(() => {
    const formatedOptions = formatMsgramChart({ historical, repositoryName });
    setChartOption(formatedOptions);
  }, [historical, repositoryName]);

  return (
    <div>
      <Box>
        <Styles.GraphicContainer>
          <ReactEcharts option={chartOption} style={{ height: '450px', width: '100%' }} />
        </Styles.GraphicContainer>
      </Box>
    </div>
  );
};

export default MeasureSoftGramChart;
