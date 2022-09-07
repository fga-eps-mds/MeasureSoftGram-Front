import React, { useEffect, useState } from 'react';

import { EChartsOption } from 'echarts-for-react';

import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';
import { GraphicContainer, StackedLineStyled } from './styles';

interface HistoricalEntity {
  name: string;
  history: Array<{
    value: number;
    created_at: string;
  }>;
}

interface Prop {
  historical: HistoricalEntity[];
}

const GraphicStackedLine = ({ historical }: Prop) => {
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  useEffect(() => {
    const formatedOptions = formatCharacteristicsHistory(historical);
    setChartOption(formatedOptions);
  }, [historical]);

  return (
    <GraphicContainer>
      <StackedLineStyled option={chartOption} />
    </GraphicContainer>
  );
};

export default GraphicStackedLine;
