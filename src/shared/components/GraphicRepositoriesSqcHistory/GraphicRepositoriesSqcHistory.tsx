import React from 'react';

import formatRepositoriesSqcHistory from '@utils/formatRepositoriesSqcHistory';
import { RepositoriesSqcHistory } from '@customTypes/product';

import ReactEcharts from 'echarts-for-react';
import * as Styles from './styles';

interface Props {
  history: RepositoriesSqcHistory | undefined;
}

const GraphicRepositoriesSqcHistory = ({ history }: Props) => {
  if (!history) {
    return null;
  }

  const formatedOptions = formatRepositoriesSqcHistory(history);

  return (
    <Styles.GraphicContainer>
      <ReactEcharts option={formatedOptions} style={{ height: '700px', width: '100%' }} />
    </Styles.GraphicContainer>
  );
};

export default GraphicRepositoriesSqcHistory;
