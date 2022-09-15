import React, { useEffect, useState } from 'react';

import { EChartsOption } from 'echarts-for-react';

import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';
import { GraphicContainer, StackedLineStyled } from './styles';

interface HistoricalEntity {
  key: string;
  name: string;
  history: Array<{
    value: number;
    created_at: string;
  }>;
}

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  historical: HistoricalEntity[];
  checkedOptions: OptionCheckedProps;
}

const GraphicStackedLine = ({ historical, checkedOptions }: Prop) => {
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  useEffect(() => {
    const formatedOptions = formatCharacteristicsHistory(historical, checkedOptions);
    setChartOption(formatedOptions);
  }, [historical, checkedOptions]);

  return (
    <GraphicContainer>
      <StackedLineStyled option={chartOption} />
    </GraphicContainer>
  );
};

export default GraphicStackedLine;
