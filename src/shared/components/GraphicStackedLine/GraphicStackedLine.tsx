import React, { useEffect, useRef } from 'react';
import ReactEcharts, { EChartsOption } from 'echarts-for-react';

import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';
import { Alert, Box, Fade, Skeleton } from '@mui/material';
import { useRequestValues } from '@hooks/useRequestValues';

interface Prop {
  title: string;
  value: 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';
  addHistoricalSQC?: boolean;
}

const GraphicStackedLine = ({ title, value, addHistoricalSQC = false }: Prop) => {
  const {
    data: historical,
    error,
    isLoading,
    isEmpty
  } = useRequestValues({ type: 'historical-values', value, addHistoricalSQC });

  const echartsOptionRef = useRef<EChartsOption>({});

  useEffect(() => {
    echartsOptionRef.current = formatCharacteristicsHistory({ historical, title, isEmpty: !!error || isEmpty });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historical, isEmpty, error]);

  return isLoading ? (
    <Skeleton variant="rectangular" height="300px" />
  ) : (
    <>
      <Box
        bgcolor="white"
        borderRadius="4px"
        boxShadow="0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"
        paddingX="20px"
        paddingY="10px"
        width="100%"
        height={error || isEmpty ? '50px' : 'auto'}
        marginTop="20px"
        zIndex={-1}
      >
        <ReactEcharts option={echartsOptionRef.current} />
      </Box>
      {error && (
        <Fade in>
          <Alert severity="error">Ocorreu um erro ao tentar carregar as informações</Alert>
        </Fade>
      )}
      {isEmpty && (
        <Fade in>
          <Alert variant="standard" severity="warning">
            Não há dados para serem exibidos
          </Alert>
        </Fade>
      )}
    </>
  );
};

export default GraphicStackedLine;
