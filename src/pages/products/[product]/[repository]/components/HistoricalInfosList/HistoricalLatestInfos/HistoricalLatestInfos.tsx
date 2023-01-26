import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useQuery } from '../hooks/useQuery';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import GraphicStackedLine from '@components/GraphicStackedLine';
import Skeleton from '../../Skeleton/Skeleton';

import LatestValueTable from '../../LatestValueTable/LatestValueTable'

interface OptionCheckedProps {
    [key: string]: boolean;
  }
  
interface Prop {
    checkedOptions: OptionCheckedProps;
}

function HistoricalLatestInfos({ checkedOptions }: Prop){
    const { repositoryHistoricalSubCharacteristics, repositoryHistoricalMeasures, repositoryHistoricalMetrics } = useQuery();
    const { latestValueSubcharacteristics, latestValueMeasures, latestValueMetrics } = useQuery();

    const {
        historicalSQC: { history }
      } = useRepositoryContext();
      const [page, setPage] = useState(0);

    const isArrayEmpty = (array: Array<any>) => array.length === 0;
    
    if (
        isArrayEmpty(latestValueSubcharacteristics) ||
        isArrayEmpty(latestValueMeasures) ||
        isArrayEmpty(latestValueMetrics) ||
        isArrayEmpty(repositoryHistoricalSubCharacteristics) ||
        isArrayEmpty(repositoryHistoricalMeasures) ||
        isArrayEmpty(repositoryHistoricalMetrics)
        ) {
            return <Skeleton />;
    }

    return(
        <>
            <Box marginBottom="42px">
                <GraphicStackedLine
                    historical={repositoryHistoricalSubCharacteristics}
                    checkedOptions={checkedOptions}
                    title="Sub-Caracteríticas"
                />
                <LatestValueTable 
                    title="Sub Características"
                    latestValue={latestValueSubcharacteristics}/>
            </Box>

            <Box marginBottom="42px">
                <GraphicStackedLine
                    historical={repositoryHistoricalMeasures}
                    checkedOptions={checkedOptions}
                    title="Medidas"
                />
                <LatestValueTable 
                    title="Medidas"
                    latestValue={latestValueMeasures}/>
            </Box>

            <Box marginBottom="42px">
                <GraphicStackedLine
                    historical={repositoryHistoricalMetrics}
                    checkedOptions={checkedOptions}
                    title="Métricas"
                />
                <LatestValueTable 
                    title="Métricas"
                    latestValue={latestValueMetrics}/>
            </Box>  
        </>
    );
}

export default HistoricalLatestInfos;