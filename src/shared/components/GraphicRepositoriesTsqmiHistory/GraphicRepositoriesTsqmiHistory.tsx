import React, { ComponentRef, useRef } from 'react';

import formatRepositoriesTsqmiHistory from '@utils/formatRepositoriesTsqmiHistory';
import { RepositoriesTsqmiHistory , HistoryDateRange } from '@customTypes/product';

import dynamic from 'next/dynamic';
import type ReactEchartsType from 'echarts-for-react';
import { CSVFilter } from '@utils/convertToCsv';
import * as Styles from './styles';

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface Props {
  history?: RepositoriesTsqmiHistory;
}

const GraphicRepositoriesTsqmiHistory = ({ history }: Props) => {
  const echartsRef = useRef<any>(null);

  if (!history) {
    return null;
  }

  const dateRange: HistoryDateRange = {
    startDate: null,
    endDate: null
  };

  const csvFilters: CSVFilter = {
    dateRange
  }

  const { options, onEvents } = formatRepositoriesTsqmiHistory({ history, csvFilters, ref: echartsRef });

  return (
    <Styles.GraphicContainer>
        <ReactEcharts
          // @ts-ignore
          ref={echartsRef}
          onEvents={onEvents}
          option={options} style={{ height: '450px', width: '100%' }} />
      </Styles.GraphicContainer>
  );
};

export default GraphicRepositoriesTsqmiHistory;
