import React from 'react';

import { RepositoriesSqcHistory } from '@customTypes/product';

import ReactEcharts from 'echarts-for-react';
import formatCompareGoalsChartHistory from '@utils/formatCompareGoalsChartHistory';
import * as Styles from './styles';

interface Props {
  history: RepositoriesSqcHistory | undefined;
}

const CompareGoalsChartHistory = ({ history }: Props) => {
  if (!history) {
    return null;
  }

  const formatedOptions = formatCompareGoalsChartHistory(history);

  return (
    <Styles.GraphicContainer>
      <ReactEcharts option={formatedOptions} style={{ height: '450px', width: '100%' }} />
    </Styles.GraphicContainer>
  );
};

export default CompareGoalsChartHistory;
