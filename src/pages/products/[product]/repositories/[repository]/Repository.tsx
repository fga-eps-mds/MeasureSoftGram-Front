import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { NextPageWithLayout } from '@pages/_app.next';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import getLayout from '@components/Layout';
import GraphicStackedLine from '@components/GraphicStackedLine';
import Skeleton from './components/Skeleton';
import HistoricalLatestInfos from './components/HistoricalInfosList';
import LatestValueTable from './components/LatestValueTable';
import FilterTreeInfos from './components/FilterTreeInfos';
import { useQuery as useQueryProduct } from '../../hooks/useQuery';
import { useQuery } from './hooks/useQuery';
import Download from '../../../../../shared/components/DownloadButton';

const Repository: NextPageWithLayout = () => {
  useQueryProduct();

  const { repositoryHistoricalCharacteristics, latestValueCharacteristics, checkedOptionsFormat } = useQuery();
  const { characteristics, subCharacteristics, measures, metrics, currentRepository, historicalSQC } =
    useRepositoryContext();

  const [checkedOptions, setCheckedOptions] = useState(checkedOptionsFormat);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const getGraphicDates = (sDate: string, eDate: string) => {
    setStartDate(sDate);
    setEndDate(eDate);
  };

  useEffect(() => {
    setCheckedOptions(checkedOptionsFormat);
  }, [checkedOptionsFormat]);

  const isArrayEmpty = (array: Array<any>) => array.length === 0;

  if (
    isArrayEmpty(repositoryHistoricalCharacteristics) ||
    isArrayEmpty(latestValueCharacteristics) ||
    isArrayEmpty(Object.values(checkedOptions)) ||
    !currentRepository ||
    !historicalSQC
  ) {
    return <Skeleton />;
  }

  return (
    <Box display="flex" width="100%" flexDirection="row">
      <FilterTreeInfos
        checkedOptions={checkedOptions}
        setCheckedOptions={setCheckedOptions}
        characteristics={characteristics}
        subCharacteristics={subCharacteristics}
        measures={measures}
        metrics={metrics}
      />
      <Box width="100%">
        <Box marginBottom="42px">
          <Container>
            <Box display="flex" flexDirection="column" width="100%">
              <Box marginTop="40px" marginBottom="36px">
                <Box display="flex">
                  <Typography variant="h4" marginRight="10px">
                    Repositório
                  </Typography>
                  <Typography variant="h4" fontWeight="300">
                    {currentRepository.name}
                  </Typography>
                </Box>

                <div>
                  <Download
                    product={currentRepository}
                    kind="characteristics"
                    startDate={startDate}
                    endDate={endDate}
                    checkedOptions={checkedOptions}
                  />
                </div>
                {/* sqc, characteristics, subcharacteristics, measures, metrics */}

                <Typography variant="caption" color="gray">
                  {currentRepository?.description}
                </Typography>
              </Box>

              {historicalSQC &&
                repositoryHistoricalCharacteristics &&
                repositoryHistoricalCharacteristics.length !== 0 && (
                  <GraphicStackedLine
                    historical={repositoryHistoricalCharacteristics.concat(historicalSQC)}
                    checkedOptions={checkedOptions}
                    title="Características"
                    getDates={getGraphicDates}
                  />
                )}

              <LatestValueTable title="Características" latestValue={latestValueCharacteristics} />
            </Box>
          </Container>
        </Box>

        {/* <SubCharacteristicsList checkedOptions={checkedOptions} /> */}

        {/* <HistoricalInfosList checkedOptions={checkedOptions}/> */}

        <HistoricalLatestInfos checkedOptions={checkedOptions} currentRepository={currentRepository} />
      </Box>
    </Box>
  );
};

Repository.getLayout = getLayout;

export default Repository;
