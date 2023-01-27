import React, { useEffect, useState } from 'react';
import { EChartsOption } from 'echarts-for-react';

import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';
import { Historical } from '@customTypes/repository';

import * as Styles from './styles';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  historical?: Historical[];
  checkedOptions: OptionCheckedProps;
  title: string;
  selected?: (any) => boolean;
}

const GraphicStackedLine = ({ historical, checkedOptions, title, selected }: Prop) => {
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  useEffect(() => {
    const formatedOptions = formatCharacteristicsHistory({ historical, checkedOptions, title, selected });
    setChartOption(formatedOptions);
  }, [historical, checkedOptions, title, selected]);

  return (
    <Styles.GraphicContainer>
      <Styles.StackedLineStyled option={chartOption} />
    </Styles.GraphicContainer>
  );
};

export default GraphicStackedLine;
