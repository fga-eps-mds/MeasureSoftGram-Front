import React from 'react';

import formatRepositoriesTsqmiHistory from '@utils/formatRepositoriesTsqmiHistory';
import { RepositoriesTsqmiHistory } from '@customTypes/product';

import ReactEcharts from 'echarts-for-react';
import * as Styles from './styles';

interface Props {
  history: RepositoriesTsqmiHistory | undefined;
}

const GraphicRepositoriesTsqmiHistory = ({ history }: Props) => {
  if (!history) {
    return null;
  }

  const formatedOptions = formatRepositoriesTsqmiHistory(history);

  return (
    <Styles.GraphicContainer>
      <ReactEcharts option={formatedOptions} style={{ height: '450px', width: '100%' }} />
    </Styles.GraphicContainer>
  );
};

export default GraphicRepositoriesTsqmiHistory;
