import React, { useEffect, useState } from 'react';

import { EChartsOption } from 'echarts-for-react';
import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';

import { GraphicContainer, StackedLineStyled } from './styles';

const GraphicStackedLine = () => {
  const [chartOptions, setChartOptions] = useState<EChartsOption>();

  useEffect(() => {
    // if (!projectMeasuresHistory) return;
    const formatedCharOptions = formatCharacteristicsHistory();
    setChartOptions(formatedCharOptions);
  }, []);

  if (!chartOptions) {
    return null;
  }

  return (
    <GraphicContainer>
      <StackedLineStyled option={chartOptions} />
    </GraphicContainer>
  );
};

export default GraphicStackedLine;
