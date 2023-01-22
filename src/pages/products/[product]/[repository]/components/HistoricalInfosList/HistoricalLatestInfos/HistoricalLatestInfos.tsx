import React from 'react';
import { Box, Typography } from '@mui/material';
import { useQuery } from '../hooks/useQuery';

import Skeleton from '@mui/material/Skeleton';

import LatestValueTable from '../../LatestValueTable/LatestValueTable'


function HistoricalLatestInfos(){
    const { latestValueSubcharacteristics, latestValueMeasures, latestValueMetrics } = useQuery();

    
    const isArrayEmpty = (array: Array<any>) => array.length === 0;
    
    if (
        isArrayEmpty(latestValueSubcharacteristics) ||
        isArrayEmpty(latestValueMeasures) ||
        isArrayEmpty(latestValueMetrics)
        ) {
            return <Skeleton />;
    }

    return(
        <>
            <Box marginTop="24px" marginBottom="36px">
                <Typography variant="h6">Sub Características</Typography>
            </Box>
            <LatestValueTable 
                title="Sub Características"
                latestValue={latestValueSubcharacteristics}/>

            <Box marginTop="24px" marginBottom="36px">
                <Typography variant="h6">Medidas</Typography>
            </Box>
            <LatestValueTable 
                title="Medidas"
                latestValue={latestValueMeasures}/>

            <Box marginTop="24px" marginBottom="36px">
                <Typography variant="h6">Métricas</Typography>
            </Box>
            <LatestValueTable 
                title="Métricas"
                latestValue={latestValueMetrics}/>
        </>
    );
}

export default HistoricalLatestInfos;