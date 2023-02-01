import React, { useState } from 'react';
import { Box } from '@mui/material';
import GraphicStackedLine from '@components/GraphicStackedLine';
import { useQuery } from '../hooks/useQuery';

import Skeleton from '../../Skeleton/Skeleton';

import LatestValueTable from '../../LatestValueTable/LatestValueTable'

import Download from '../../../../../../../shared/components/DownloadButton';
import { Repository } from '@customTypes/repository';

interface OptionCheckedProps {
    [key: string]: boolean;
  }
  
interface Prop {
    checkedOptions: OptionCheckedProps;
    currentRepository: any;
}

function HistoricalLatestInfos({ checkedOptions, currentRepository}: Prop){
    const { repositoryHistoricalSubCharacteristics, repositoryHistoricalMeasures, repositoryHistoricalMetrics } = useQuery();
    const { latestValueSubcharacteristics, latestValueMeasures, latestValueMetrics } = useQuery();
    const isArrayEmpty = (array: Array<any>) => array.length === 0;

    console.log('currentRepository', currentRepository);
    
    const [startDateSub, setStartDateSub] = useState<string>('');
    const [endDateSub, setEndDateSub] = useState<string>('');
    const [startDateMes, setStartDateMes] = useState<string>('');
    const [endDateMes, setEndDateMes] = useState<string>('');
    const [startDateMet, setStartDateMet] = useState<string>('');
    const [endDateMet, setEndDateMet] = useState<string>('');
    
    const getGraphicDatesSub = (sDate: string, eDate: string) => {
        setStartDateSub(sDate);
        setEndDateSub(eDate);
      }
    
    const getGraphicDatesMes = (sDate: string, eDate: string) => {
        setStartDateMes(sDate);
        setEndDateMes(eDate);
    }

    const getGraphicDatesMet = (sDate: string, eDate: string) => {
        setStartDateMet(sDate);
        setEndDateMet(eDate);
        }
    
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
        <div>
          <Download product = {currentRepository} kind = "subcharacteristics" startDate={startDateSub} endDate={endDateSub} />
        </div>
        {/* sqc, characteristics, subcharacteristics, measures, metrics */}
            <Box marginBottom="42px">
                <GraphicStackedLine
                    historical={repositoryHistoricalSubCharacteristics}
                    checkedOptions={checkedOptions}
                    title="Sub-Caracteríticas"
                    getDates={getGraphicDatesSub}
                />
                <LatestValueTable 
                    title="Sub Características"
                    latestValue={latestValueSubcharacteristics}/>
            </Box>

        <div>
            <Download product = {currentRepository} kind = "measures" startDate={startDateMes} endDate={endDateMes} />
        </div>
            <Box marginBottom="42px">
                <GraphicStackedLine
                    historical={repositoryHistoricalMeasures}
                    checkedOptions={checkedOptions}
                    title="Medidas"
                    getDates={getGraphicDatesMes}
                />
                <LatestValueTable 
                    title="Medidas"
                    latestValue={latestValueMeasures}/>
            </Box>

        <div>
            <Download product = {currentRepository} kind = "metrics" startDate={startDateMet} endDate={endDateMet} />
        </div>
            <Box marginBottom="42px">
                <GraphicStackedLine
                    historical={repositoryHistoricalMetrics}
                    checkedOptions={checkedOptions}
                    title="Métricas"
                    getDates={getGraphicDatesMet}
                />
                <LatestValueTable 
                    title="Métricas"
                    latestValue={latestValueMetrics}/>
            </Box>  
        </>
    );
}

export default HistoricalLatestInfos;