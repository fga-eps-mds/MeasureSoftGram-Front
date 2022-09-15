import React, { useEffect, useState } from 'react';
import { EChartsOption } from 'echarts-for-react';

import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';
import { Historical } from '@customTypes/respository';

import { GraphicContainer, StackedLineStyled } from './styles';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  historical?: Historical[];
  checkedOptions: OptionCheckedProps;
}

const GraphicStackedLine = ({ historical, checkedOptions }: Prop) => {
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  useEffect(() => {
    const formatedOptions = formatCharacteristicsHistory({ historical, checkedOptions });
    setChartOption(formatedOptions);
  }, [historical, checkedOptions]);

  return (
    <GraphicContainer>
      <StackedLineStyled option={chartOption} />
    </GraphicContainer>
  );
};

export default GraphicStackedLine;
