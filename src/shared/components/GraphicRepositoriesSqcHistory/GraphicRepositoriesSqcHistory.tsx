import React from 'react';

import formatRepositoriesSqcHistory from '@utils/formatRepositoriesSqcHistory';
import { RepositoriesSqcHistory } from '@customTypes/project';
import ReactEcharts from 'echarts-for-react';
import { GraphicContainer } from './styles';


interface Props {
  history: RepositoriesSqcHistory | undefined;
}

const GraphicRepositoriesSqcHistory = ({ history }: Props) => {
  if (!history) {
    return null;
  }

  const formatedOptions = formatRepositoriesSqcHistory(history);

  return (
    <GraphicContainer>
        <ReactEcharts option={formatedOptions} style={{ height: '450px', width: '100%' }} />
    </GraphicContainer>
  );
};

export default GraphicRepositoriesSqcHistory;
