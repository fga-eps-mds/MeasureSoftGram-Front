import React, { ComponentRef, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type ReactEchartsType from 'echarts-for-react';

import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';
import formatMsgramChart from '@utils/formatMsgramChart';
import formatRadarChart from '@utils/formatRadarChart';
import formatGaugeChart from '@utils/formatGaugeChart';
import { Alert, Box, Fade, IconButton, Skeleton } from '@mui/material';
import { useRequestValues } from '@hooks/useRequestValues';
import { Historical } from '@customTypes/repository';
import _ from 'lodash';
import { useProductConfigFilterContext } from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { useProductContext } from '@contexts/ProductProvider';
import { HistoryDateRange } from '@customTypes/product';
import { useTranslation } from 'react-i18next';

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface Prop {
  title: string;
  type: 'line' | 'msg' | 'radar' | 'gauge';
  value: 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';
  valueType?: 'historical-values' | 'latest-values';
  autoGrid?: boolean;
  addHistoricalTSQMI?: boolean;
  addCurrentGoal?: boolean;
  collectionSource?: 'github' | 'sonarqube'
}

type formatFunctionType = {
  [key: string]: Function;
};

const chartOption: formatFunctionType = {
  line: formatCharacteristicsHistory,
  msg: formatMsgramChart,
  radar: formatRadarChart,
  gauge: formatGaugeChart
};

const GraphicChart = ({
  title,
  type,
  value,
  valueType = 'historical-values',
  autoGrid = false,
  addHistoricalTSQMI = false,
  addCurrentGoal = false,
  collectionSource,
}: Prop) => {
  const {
    data: historical,
    error,
    isLoading,
    isEmpty
  } = useRequestValues({ type: valueType, value, addHistoricalTSQMI, addCurrentGoal, collectionSource });
  const { hasKey } = useProductConfigFilterContext();
  const [showCharts, setShowCharts] = useState(false);
  const { currentProduct } = useProductContext();

  const { t } = useTranslation('graphic_chart');

  const sliceHistorical = (rowIdx: number): Historical[] => {
    if (!autoGrid) return historical;
    return historical.slice(numChartsPerLine * rowIdx, numChartsPerLine * (rowIdx + 1));
  };

  const historicalLength: number = historical?.length ?? 0;
  const numChartsPerLine: number = 2;
  const numLines: number = !autoGrid ? 1 : Math.ceil(historicalLength / numChartsPerLine);

  let chartBoxHeight: string = 'auto';
  let chartStyle: React.CSSProperties = {};

  if (type === 'msg') {
    chartBoxHeight = `${historicalLength * 82 + 85}px`;
    chartStyle = { height: chartBoxHeight };
  }

  const echartsRef = useRef<any>(null);

  const dateRange: HistoryDateRange = {
    startDate: null,
    endDate: null
  };

  const chartsOption = useMemo(
    () =>
      _.range(numLines).map((i) => ({
        ...chartOption[type]({
          historical: _.filter(sliceHistorical(i), (item) => hasKey(item.key)),
          title: i === 0 ? title : '',
          isEmpty: isEmpty || error,
          redLimit: currentProduct?.gaugeRedLimit,
          yellowLimit: currentProduct?.gaugeYellowLimit,
          csvFilters: { dateRange },
          ref: echartsRef
        }),
        key: `graphic - chart - ${i}`
      })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [historical, title, isEmpty, error]
  );

  const filteredChartsOptions = chartsOption.filter((option, index) => {
    if (type === 'gauge') {
      return (index <= 1);
    }
    return true;
  });

  return isLoading ? (
    <Skeleton variant="rectangular" height="300px" />
  ) : (
    <>
      <Fade in timeout={1500}>
        <Box
          bgcolor="white"
          borderRadius="4px"
          boxShadow="0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"
          paddingX="20px"
          paddingY="10px"
          width="100%"
          height={chartBoxHeight}
        >
          {(type !== 'gauge') || (type === 'gauge' && showCharts) && (typeof window !== 'undefined') ?
            (typeof window !== 'undefined') && chartsOption.map((option) => (
              < ReactEcharts
                // @ts-ignore
                ref={echartsRef}
                onEvents={option?.onEvents}
                key={option.key} notMerge lazyUpdate style={chartStyle} option={option} />
            ))
            :
            (typeof window !== 'undefined') && filteredChartsOptions.map((option) => (
              <ReactEcharts
                key={option.key} notMerge lazyUpdate style={chartStyle} option={option} />
            ))
          }

          {(type === 'gauge' && chartsOption.length > 2) &&
            <Box
              width="100%"
              display="flex"
              flexDirection="row"
              justifyContent="center"
            >
              <IconButton onClick={() => { setShowCharts(prev => !prev) }}>
                {showCharts ? <KeyboardDoubleArrowUpIcon fontSize="large" /> : <KeyboardDoubleArrowDownIcon fontSize="large" />}
              </IconButton>
            </Box>
          }
        </Box>
      </Fade>
      {error && (
        <Fade in timeout={1000}>
          <Alert severity="error">{t('error')}</Alert>
        </Fade>
      )}
      {isEmpty && (
        <Fade in timeout={1000}>
          <Alert variant="standard" severity="warning">
            {t('noData')}
          </Alert>
        </Fade>
      )}
    </>
  );
};

export default GraphicChart;
