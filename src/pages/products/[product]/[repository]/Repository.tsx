import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';

import Filters from '@components/Filters';
import getLayout from '@components/Layout';
import GraphicStackedLine from '@components/GraphicStackedLine';

import { NextPageWithLayout } from '@pages/_app.next';

import { useRepositoryContext } from '@contexts/RepositoryProvider';

import Skeleton from './components/Skeleton';
import SubCharacteristicsList from './components/SubCharacteristicsList';

import { useQuery as useQueryProduct } from '../hooks/useQuery';
import { useQuery } from './hooks/useQuery';

import * as Styles from './styles';

import Download from '../../../../shared/components/DownloadButton';

interface FilterProps {
  filterTitle: string;
  options: Array<string>;
}

const Repository: NextPageWithLayout = () => {
  useQueryProduct();

  const { repositoryHistoricalCharacteristics, checkedOptionsFormat } = useQuery();
  const { characteristics, subCharacteristics, currentRepository, historicalSQC } = useRepositoryContext();

  const [filterCharacteristics, setFilterCharacteristics] = useState<FilterProps>({
    filterTitle: 'CARACTERÍSTICAS',
    options: []
  });
  const [filterSubCharacteristics, setFilterSubCharacteristics] = useState<FilterProps>({
    filterTitle: 'SUB CARACTERÍSTICAS',
    options: []
  });

  const [checkedOptions, setCheckedOptions] = useState(checkedOptionsFormat);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const getGraphicDates = (sDate: string, eDate: string) => {
    setStartDate(sDate);
    setEndDate(eDate);
  }

  useEffect(() => {
    setCheckedOptions(checkedOptionsFormat);
  }, [checkedOptionsFormat]);

  useEffect(() => {
    setFilterCharacteristics({ ...filterCharacteristics, options: characteristics });
    setFilterSubCharacteristics({ ...filterSubCharacteristics, options: subCharacteristics });
  }, [characteristics, subCharacteristics]);

  const isArrayEmpty = (array: Array<any>) => array.length === 0;

  if (
    isArrayEmpty(repositoryHistoricalCharacteristics) ||
    isArrayEmpty(filterCharacteristics.options) ||
    isArrayEmpty(filterSubCharacteristics.options) ||
    !currentRepository ||
    !historicalSQC
  ) {
    return <Skeleton />;
  }

  return (
    <Box display="flex" width="100%" flexDirection="row">
      <Styles.FilterBackground>
        <Box display="flex" paddingX="15px" flexDirection="column" marginTop="36px" position="fixed">
          {[filterCharacteristics, filterSubCharacteristics].map((filter) => (
            <Filters
              key={filter.filterTitle}
              filterTitle={filter.filterTitle}
              options={filter.options}
              updateOptions={setCheckedOptions}
              checkedOptions={checkedOptions}
            />
          ))}
        </Box>
      </Styles.FilterBackground>

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
                    {currentRepository?.name}
                  </Typography>
                </Box>

                <div>
                  <Download product = {currentRepository} kind = "characteristics" startDate={startDate} endDate={endDate} />
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
            </Box>
          </Container>
        </Box>

        <SubCharacteristicsList checkedOptions={checkedOptions} />
      </Box>
    </Box>
  );
};

Repository.getLayout = getLayout;

export default Repository;
